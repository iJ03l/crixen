import { create } from 'zustand';
import { api } from '../services/api';

interface Strategy {
    id: string;
    name: string;
    prompt: string;
    source: 'notion' | 'manual' | 'ai-generated';
    created_at: string;
}

interface Project {
    id: number;
    name: string;
    brand_voice: string;
    strategies: Strategy[];
    strategy_count: number;
}

interface Limits {
    maxProjects: number;
    maxStrategiesPerProject: number;
}

interface StrategyState {
    projects: Project[];
    selectedProject: Project | null;
    limits: Limits;
    tier: string;
    loading: boolean;
    projectLoading: boolean;
    error: string;

    // Edit states (UI)
    editingBrandVoice: boolean;
    brandVoiceText: string;
    editingStrategy: Strategy | null;
    newStrategyMode: boolean;
    newStrategy: { name: string; prompt: string };
    editingProjectName: boolean;
    projectNameText: string;
    addingProject: boolean;
    newProjectName: string;

    // Loading states for actions
    isSavingBrandVoice: boolean;
    isSavingStrategy: boolean;
    isNovaSecured: boolean;

    // Actions
    loadProjects: () => Promise<void>;
    selectProject: (id: number) => Promise<void>;
    createProject: () => Promise<void>;
    updateProjectName: () => Promise<void>;
    saveBrandVoice: () => Promise<void>;
    addStrategy: () => Promise<void>;
    updateStrategy: (strategy: Strategy) => Promise<void>;
    deleteStrategy: (strategyId: string) => Promise<void>;

    // UI Actions
    setEditingBrandVoice: (editing: boolean) => void;
    setBrandVoiceText: (text: string) => void;
    setEditingStrategy: (strategy: Strategy | null) => void;
    setNewStrategyMode: (mode: boolean) => void;
    setNewStrategy: (strategy: { name: string; prompt: string }) => void;
    setEditingProjectName: (editing: boolean) => void;
    setProjectNameText: (text: string) => void;
    setAddingProject: (adding: boolean) => void;
    setNewProjectName: (name: string) => void;
    setError: (error: string) => void;
}

export const useStrategyStore = create<StrategyState>((set, get) => ({
    projects: [],
    selectedProject: null,
    limits: { maxProjects: 1, maxStrategiesPerProject: 3 },
    tier: 'starter',
    loading: true,
    projectLoading: false,
    error: '',

    // Edit states
    editingBrandVoice: false,
    brandVoiceText: '',
    editingStrategy: null,
    newStrategyMode: false,
    newStrategy: { name: '', prompt: '' },
    editingProjectName: false,
    projectNameText: '',
    addingProject: false,
    newProjectName: '',

    // Loading states
    isSavingBrandVoice: false,
    isSavingStrategy: false,
    isNovaSecured: false,

    // Actions
    loadProjects: async () => {
        set({ loading: true, error: '' });
        try {
            const data = await api.projects.list();
            set({
                projects: data.projects,
                limits: data.limits,
                tier: data.tier,
                loading: false
            });

            const { selectedProject } = get();
            if (data.projects.length > 0 && !selectedProject) {
                await get().selectProject(data.projects[0].id);
            }
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    selectProject: async (id: number) => {
        set({ projectLoading: true, error: '' });
        try {
            // 1. Get standard project data
            const project = await api.projects.getById(id);

            // CLEAN DB STRATEGIES IMMEDIATELY
            if (project.strategies && Array.isArray(project.strategies)) {
                const originalLength = project.strategies.length;
                project.strategies = project.strategies.filter((s: any) => s && s.name);
                if (project.strategies.length !== originalLength) {
                    console.warn(`⚠️ Cleaned ${originalLength - project.strategies.length} invalid strategies from DB project data`);
                }
            } else {
                project.strategies = [];
            }

            // 2. Try to get secure Nova data
            let novaStrategies: any[] = [];
            let secured = false;
            try {
                const novaResult = await api.nova.retrieveStrategy(id);
                if (novaResult && novaResult.data) {
                    if (Array.isArray(novaResult.data)) {
                        novaStrategies = novaResult.data;
                    } else if (novaResult.data.strategies) {
                        novaStrategies = novaResult.data.strategies;
                    }

                    if (novaStrategies.length > 0) {
                        // Defensive filtering for corrupted data
                        const preCleanLength = novaStrategies.length;
                        novaStrategies = novaStrategies.filter((s: any) => s && s.name);

                        if (novaStrategies.length !== preCleanLength) {
                            console.warn(`⚠️ Cleaned ${preCleanLength - novaStrategies.length} invalid strategies from Nova data`);
                        }

                        if (novaStrategies.length > 0) {
                            secured = true;
                            console.log('✅ Loaded secured strategies from Nova');
                        }
                    }
                }
            } catch (e) {
                console.warn('Nova fetch failed, using standard DB:', e);
            }

            // 3. Merge/Override strategies if Nova data exists
            if (secured) {
                project.strategies = novaStrategies;
            }

            set({
                selectedProject: project,
                isNovaSecured: secured,
                brandVoiceText: project.brand_voice || '',
                projectNameText: project.name || '',
                editingProjectName: false,
                projectLoading: false
            });
        } catch (err: any) {
            set({ error: err.message, projectLoading: false });
        }
    },

    createProject: async () => {
        const { newProjectName, loadProjects } = get();
        if (!newProjectName.trim()) return;

        try {
            const newProject = await api.projects.create(newProjectName);
            set({
                newProjectName: '',
                addingProject: false
            });
            await loadProjects();
            await get().selectProject(newProject.id);
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    updateProjectName: async () => {
        const { selectedProject, projectNameText, loadProjects } = get();
        if (!selectedProject || !projectNameText.trim()) return;

        try {
            await api.projects.update(selectedProject.id, { name: projectNameText });
            set({ editingProjectName: false });
            await loadProjects();
            // Update local selected project name immediately for UX
            set(state => ({
                selectedProject: state.selectedProject ? { ...state.selectedProject, name: projectNameText } : null
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    saveBrandVoice: async () => {
        const { selectedProject, brandVoiceText } = get();
        if (!selectedProject) return;

        set({ isSavingBrandVoice: true });
        try {
            await api.projects.updateBrandVoice(selectedProject.id, brandVoiceText);
            // Reload page to ensure data consistency
            window.location.reload();
        } catch (err: any) {
            set({ error: err.message, isSavingBrandVoice: false });
        }
    },

    addStrategy: async () => {
        const { selectedProject, newStrategy } = get();
        if (!selectedProject || !newStrategy.name || !newStrategy.prompt) return;

        set({ isSavingStrategy: true });
        try {
            await api.projects.addStrategy(selectedProject.id, {
                ...newStrategy,
                source: 'manual'
            });
            // Reload page to ensure data consistency
            window.location.reload();
        } catch (err: any) {
            set({ error: err.message, isSavingStrategy: false });
        }
    },

    deleteStrategy: async (strategyId: string) => {
        const { selectedProject } = get();
        if (!selectedProject) return;

        try {
            await api.projects.deleteStrategy(selectedProject.id, strategyId);
            // Reload page to ensure data consistency
            window.location.reload();
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    updateStrategy: async (strategy: Strategy) => {
        const { selectedProject } = get();
        if (!selectedProject) return;

        set({ isSavingStrategy: true });
        try {
            const updatedStrategies = selectedProject.strategies.map(s =>
                s.id === strategy.id ? strategy : s
            );
            await api.projects.updateStrategies(selectedProject.id, updatedStrategies);
            // Reload page to ensure data consistency
            window.location.reload();
        } catch (err: any) {
            set({ error: err.message, isSavingStrategy: false });
        }
    },

    // UI Action Setters
    setEditingBrandVoice: (editing) => set({ editingBrandVoice: editing }),
    setBrandVoiceText: (text) => set({ brandVoiceText: text }),
    setEditingStrategy: (strategy) => set({ editingStrategy: strategy }),
    setNewStrategyMode: (mode) => set({ newStrategyMode: mode }),
    setNewStrategy: (strategy) => set({ newStrategy: strategy }),
    setEditingProjectName: (editing) => set({ editingProjectName: editing }),
    setProjectNameText: (text) => set({ projectNameText: text }),
    setAddingProject: (adding) => set({ addingProject: adding }),
    setNewProjectName: (name) => set({ newProjectName: name }),
    setError: (error) => set({ error: error })
}));
