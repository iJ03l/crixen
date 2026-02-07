import { useState, useEffect } from 'react';
import { Briefcase, Plus, Edit3, Trash2, Save, X, BookOpen, Sparkles, PenTool, Crown, ChevronRight, Target, FileText, Lightbulb, Shield } from 'lucide-react';
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

export default function StrategyPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [limits, setLimits] = useState<Limits>({ maxProjects: 1, maxStrategiesPerProject: 3 });
    const [tier, setTier] = useState('starter');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Edit states
    const [editingBrandVoice, setEditingBrandVoice] = useState(false);
    const [brandVoiceText, setBrandVoiceText] = useState('');
    const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
    const [newStrategyMode, setNewStrategyMode] = useState(false);
    const [newStrategy, setNewStrategy] = useState({ name: '', prompt: '' });
    const [editingProjectName, setEditingProjectName] = useState(false);
    const [projectNameText, setProjectNameText] = useState('');
    const [addingProject, setAddingProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');

    // Loading states for actions
    const [isSavingBrandVoice, setIsSavingBrandVoice] = useState(false);
    const [isSavingStrategy, setIsSavingStrategy] = useState(false);
    const [isNovaSecured, setIsNovaSecured] = useState(false);
    const [projectLoading, setProjectLoading] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await api.projects.list();
            setProjects(data.projects);
            setLimits(data.limits);
            setTier(data.tier);

            if (data.projects.length > 0 && !selectedProject) {
                await selectProject(data.projects[0].id);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const selectProject = async (id: number) => {
        try {
            setProjectLoading(true);
            // 1. Get standard project data
            const project = await api.projects.getById(id);

            // 2. Try to get secure Nova data
            let novaStrategies = [];
            let secured = false;
            try {
                const novaResult = await api.nova.retrieveStrategy(id);
                if (novaResult && novaResult.data) {
                    // Update: Backend now returns unified data OR strategies array
                    if (Array.isArray(novaResult.data)) {
                        novaStrategies = novaResult.data;
                    } else if (novaResult.data.strategies) {
                        novaStrategies = novaResult.data.strategies;
                    }

                    if (novaStrategies.length > 0) {
                        // FILTER OUT NULLS/INVALID DATA
                        novaStrategies = novaStrategies.filter((s: any) => s && s.name);

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

            setSelectedProject(project);
            setIsNovaSecured(secured);
            setBrandVoiceText(project.brand_voice || '');
            setProjectNameText(project.name || '');
            setEditingProjectName(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setProjectLoading(false);
        }
    };

    const createProject = async () => {
        if (!newProjectName.trim()) return;
        try {
            const newProject = await api.projects.create(newProjectName.trim());
            setProjects([...projects, newProject]);
            setNewProjectName('');
            setAddingProject(false);
            await selectProject(newProject.id);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const saveProjectName = async () => {
        if (!selectedProject || !projectNameText.trim()) return;
        try {
            const result = await api.projects.updateName(selectedProject.id, projectNameText.trim());
            setSelectedProject({ ...selectedProject, name: result.name });
            setProjects(projects.map(p => p.id === selectedProject.id ? { ...p, name: result.name } : p));
            setEditingProjectName(false);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const saveBrandVoice = async () => {
        if (!selectedProject) return;
        try {
            setIsSavingBrandVoice(true);
            await api.projects.updateBrandVoice(selectedProject.id, brandVoiceText);
            // Reload page to ensure data consistency
            window.location.reload();
        } catch (err: any) {
            setError(err.message);
            setIsSavingBrandVoice(false);
        }
    };

    const addStrategy = async () => {
        if (!selectedProject || !newStrategy.name || !newStrategy.prompt) return;
        try {
            setIsSavingStrategy(true);
            await api.projects.addStrategy(selectedProject.id, {
                ...newStrategy,
                source: 'manual'
            });
            // Reload page to ensure data consistency
            window.location.reload();
        } catch (err: any) {
            setError(err.message);
            setIsSavingStrategy(false);
        }
    };

    const deleteStrategy = async (strategyId: string) => {
        if (!selectedProject) return;
        try {
            await api.projects.deleteStrategy(selectedProject.id, strategyId);
            // Reload page to ensure data consistency
            window.location.reload();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const updateStrategy = async (strategy: Strategy) => {
        if (!selectedProject) return;
        try {
            setIsSavingStrategy(true);
            const updatedStrategies = selectedProject.strategies.map(s =>
                s.id === strategy.id ? strategy : s
            );
            await api.projects.updateStrategies(selectedProject.id, updatedStrategies);
            // Reload page to ensure data consistency
            window.location.reload();
        } catch (err: any) {
            setError(err.message);
            setIsSavingStrategy(false);
        }
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'notion': return <BookOpen size={14} className="text-blue-400" />;
            case 'ai-generated': return <Sparkles size={14} className="text-purple-400" />;
            default: return <PenTool size={14} className="text-green-400" />;
        }
    };

    const getSourceLabel = (source: string) => {
        switch (source) {
            case 'notion': return 'From Notion';
            case 'ai-generated': return 'AI Generated';
            default: return 'Manual';
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto space-y-4 md:space-y-6 px-4 md:px-0 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <div className="h-8 w-48 bg-white/10 rounded-lg mb-2"></div>
                        <div className="h-4 w-64 bg-white/5 rounded"></div>
                    </div>
                </div>

                {/* Projects Skeleton */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
                    <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
                    <div className="flex gap-3 flex-wrap">
                        <div className="h-16 w-32 bg-white/5 rounded-lg"></div>
                        <div className="h-16 w-28 bg-white/5 rounded-lg"></div>
                    </div>
                </div>

                {/* Project Header Skeleton */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
                    <div className="h-6 w-40 bg-white/10 rounded"></div>
                </div>

                {/* Brand Voice Skeleton */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
                    <div className="h-5 w-28 bg-white/10 rounded mb-4"></div>
                    <div className="h-20 w-full bg-white/5 rounded-lg"></div>
                </div>

                {/* Strategies Skeleton */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
                    <div className="h-5 w-24 bg-white/10 rounded mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-16 w-full bg-white/5 rounded-lg"></div>
                        <div className="h-16 w-full bg-white/5 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Render helper for Skeleton when switching projects
    const renderProjectSkeleton = () => (
        <div className="space-y-4 md:space-y-6 animate-pulse">
            {/* Project Header Skeleton */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
                <div className="h-8 w-48 bg-white/10 rounded"></div>
            </div>

            {/* Brand Voice Skeleton */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
                <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
                <div className="h-24 w-full bg-white/5 rounded-lg"></div>
            </div>

            {/* Strategies Skeleton */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
                <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="h-32 bg-white/5 rounded-lg"></div>
                    <div className="h-32 bg-white/5 rounded-lg"></div>
                    <div className="h-32 bg-white/5 rounded-lg"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-4 md:space-y-6 animate-fade-in px-4 md:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h1 className="font-heading font-bold text-xl sm:text-2xl md:text-3xl text-white flex items-center gap-2 flex-wrap">
                        Strategy Brain
                        <span className={`text-xs px-2 py-1 rounded-full ${tier === 'agency' ? 'bg-purple-500/20 text-purple-300' :
                            tier === 'pro' ? 'bg-blue-500/20 text-blue-300' :
                                'bg-gray-500/20 text-gray-300'
                            }`}>
                            <Crown size={12} className="inline mr-1" />
                            {(tier === 'free' ? 'Starter' : tier).charAt(0).toUpperCase() + (tier === 'free' ? 'Starter' : tier).slice(1)}
                        </span>
                    </h1>
                    <p className="text-dark-muted mt-1 text-sm sm:text-base">
                        Manage your brand voices and strategies
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
                    {error}
                    <button onClick={() => setError('')} className="ml-4 text-red-400 hover:text-red-200">✕</button>
                </div>
            )}

            {/* Projects Selector */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <h2 className="font-bold text-base md:text-lg text-white flex items-center gap-2">
                        <Briefcase size={18} />
                        Projects ({projects.length}/{limits.maxProjects === Infinity ? '∞' : limits.maxProjects})
                    </h2>
                </div>

                <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3 sm:flex-wrap">
                    {projects.map(project => (
                        <button
                            key={project.id}
                            onClick={() => selectProject(project.id)}
                            className={`px-4 py-3 rounded-lg transition-all ${selectedProject?.id === project.id
                                ? 'bg-blue-500/20 border-2 border-blue-500 text-white'
                                : 'bg-white/5 border border-white/10 text-gray-300 hover:border-white/30'
                                }`}
                        >
                            <div className="font-medium">{project.name}</div>
                            <div className="text-xs text-gray-400 mt-1">
                                {project.strategy_count || 0} strategies
                            </div>
                        </button>
                    ))}

                    {/* Add Project Button/Input */}
                    {projects.length < limits.maxProjects && (
                        addingProject ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    placeholder="Project name..."
                                    className="bg-black/50 border border-blue-500 rounded-lg px-3 py-2 text-white focus:outline-none w-40"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') createProject();
                                        if (e.key === 'Escape') { setAddingProject(false); setNewProjectName(''); }
                                    }}
                                />
                                <button
                                    onClick={createProject}
                                    className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                                >
                                    <Save size={16} />
                                </button>
                                <button
                                    onClick={() => { setAddingProject(false); setNewProjectName(''); }}
                                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setAddingProject(true)}
                                className="px-4 py-3 rounded-lg border-2 border-dashed border-white/20 text-gray-400 hover:border-blue-500/50 hover:text-blue-400 transition-all flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Add Project
                            </button>
                        )
                    )}
                </div>
            </div>

            {projectLoading ? renderProjectSkeleton() : (selectedProject && (
                <>
                    {/* Project Header with Editable Name */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {!editingProjectName ? (
                                <div className="flex items-center gap-3">
                                    <h2 className="font-bold text-xl text-white">{selectedProject.name}</h2>
                                    <button
                                        onClick={() => {
                                            setProjectNameText(selectedProject.name);
                                            setEditingProjectName(true);
                                        }}
                                        className="text-gray-400 hover:text-blue-400 transition-colors"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 flex-1 max-w-md">
                                    <input
                                        type="text"
                                        value={projectNameText}
                                        onChange={(e) => setProjectNameText(e.target.value)}
                                        className="flex-1 bg-black/50 border border-blue-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveProjectName();
                                            if (e.key === 'Escape') setEditingProjectName(false);
                                        }}
                                    />
                                    <button
                                        onClick={saveProjectName}
                                        className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300"
                                    >
                                        <Save size={14} /> Save
                                    </button>
                                    <button
                                        onClick={() => setEditingProjectName(false)}
                                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-300"
                                    >
                                        <X size={14} /> Cancel
                                    </button>
                                </div>
                            )}
                            <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                                {(selectedProject.strategies || []).length} strategies
                            </span>
                        </div>
                    </div>

                    {/* Brand Voice */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                            <h2 className="font-bold text-base md:text-lg text-white flex items-center gap-2">
                                <Target size={16} className="text-blue-400" />
                                Brand Voice
                            </h2>
                            {!editingBrandVoice ? (
                                <button
                                    onClick={() => setEditingBrandVoice(true)}
                                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                                >
                                    <Edit3 size={14} /> Edit
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={saveBrandVoice}
                                        disabled={isSavingBrandVoice}
                                        className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSavingBrandVoice ? (
                                            <>
                                                <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={14} /> Save
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingBrandVoice(false);
                                            setBrandVoiceText(selectedProject.brand_voice || '');
                                        }}
                                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-300"
                                    >
                                        <X size={14} /> Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {editingBrandVoice ? (
                            <textarea
                                value={brandVoiceText}
                                onChange={(e) => setBrandVoiceText(e.target.value)}
                                className="w-full h-32 bg-black/30 border border-white/10 rounded-lg p-4 text-white resize-none focus:border-blue-500 focus:outline-none"
                                placeholder="Describe your brand voice, tone, and personality..."
                            />
                        ) : (
                            <div className="bg-black/20 rounded-lg p-4 text-gray-300 min-h-[80px]">
                                {selectedProject.brand_voice || (
                                    <span className="text-gray-500 italic">No brand voice defined. Click Edit to add one.</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Strategies */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                            <h2 className="font-bold text-base md:text-lg text-white flex items-center gap-2">
                                <FileText size={16} className="text-purple-400" />
                                Strategies ({(selectedProject.strategies || []).length}/{limits.maxStrategiesPerProject === Infinity ? '∞' : limits.maxStrategiesPerProject})
                                {isNovaSecured && (
                                    <span className="ml-2 flex items-center gap-1 text-xs px-2 py-0.5 bg-green-500/20 text-green-300 rounded-full border border-green-500/30">
                                        <Shield size={10} /> Secured by Nova
                                    </span>
                                )}
                            </h2>
                            <button
                                onClick={() => setNewStrategyMode(true)}
                                disabled={(selectedProject.strategies || []).length >= limits.maxStrategiesPerProject}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm w-full sm:w-auto justify-center sm:justify-start"
                            >
                                <Plus size={14} /> Add Strategy
                            </button>
                        </div>

                        {/* New Strategy Form */}
                        {newStrategyMode && (
                            <div className="bg-black/30 border border-blue-500/30 rounded-lg p-4 mb-4 space-y-3">
                                <input
                                    type="text"
                                    placeholder="Strategy name (e.g., 'Twitter Voice')"
                                    value={newStrategy.name}
                                    onChange={(e) => setNewStrategy({ ...newStrategy, name: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                />
                                <textarea
                                    placeholder="Strategy prompt (describe the tone, style, rules...)"
                                    value={newStrategy.prompt}
                                    onChange={(e) => setNewStrategy({ ...newStrategy, prompt: e.target.value })}
                                    className="w-full h-24 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white resize-none focus:border-blue-500 focus:outline-none"
                                />
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => {
                                            setNewStrategyMode(false);
                                            setNewStrategy({ name: '', prompt: '' });
                                        }}
                                        className="px-3 py-1.5 text-gray-400 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={addStrategy}
                                        disabled={!newStrategy.name || !newStrategy.prompt || isSavingStrategy}
                                        className="px-4 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isSavingStrategy ? (
                                            <>
                                                <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Strategy'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Strategy Cards */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(selectedProject.strategies || []).map((strategy) => (
                                <div
                                    key={strategy.id}
                                    className="bg-black/20 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all"
                                >
                                    {editingStrategy?.id === strategy.id ? (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={editingStrategy.name}
                                                onChange={(e) => setEditingStrategy({ ...editingStrategy, name: e.target.value })}
                                                className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-sm"
                                            />
                                            <textarea
                                                value={editingStrategy.prompt}
                                                onChange={(e) => setEditingStrategy({ ...editingStrategy, prompt: e.target.value })}
                                                className="w-full h-20 bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-xs resize-none"
                                            />
                                            <div className="flex gap-2 items-center">
                                                <button
                                                    onClick={() => updateStrategy(editingStrategy)}
                                                    disabled={isSavingStrategy}
                                                    className="text-green-400 text-xs disabled:opacity-50"
                                                >
                                                    {isSavingStrategy ? 'Saving...' : 'Save'}
                                                </button>
                                                <button onClick={() => setEditingStrategy(null)} className="text-gray-400 text-xs">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-medium text-white">{strategy.name}</h3>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => setEditingStrategy(strategy)}
                                                        className="p-1 text-gray-400 hover:text-white"
                                                    >
                                                        <Edit3 size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteStrategy(strategy.id)}
                                                        className="p-1 text-gray-400 hover:text-red-400"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-400 line-clamp-3 mb-3">
                                                {strategy.prompt}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                {getSourceIcon(strategy.source)}
                                                {getSourceLabel(strategy.source)}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}

                            {(selectedProject.strategies || []).length === 0 && !newStrategyMode && (
                                <div className="col-span-full text-center py-8 text-gray-500">
                                    No strategies yet. Click "Add Strategy" or capture from Notion.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tip Banner */}
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/5 rounded-xl p-6 flex items-center gap-4">
                        <Lightbulb size={28} className="text-yellow-400" />
                        <div>
                            <h3 className="font-bold text-white mb-1">Capture from Notion</h3>
                            <p className="text-sm text-gray-400">
                                Open the Crixen extension on any Notion page with a strategy table to capture strategies automatically.
                            </p>
                        </div>
                        <ChevronRight className="text-gray-400 ml-auto" />
                    </div>
                </>
            ))}
        </div>
    );
}
