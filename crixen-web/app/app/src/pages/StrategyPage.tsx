import { useEffect } from 'react';
import { Briefcase, Plus, Edit3, Trash2, Save, X, BookOpen, Sparkles, PenTool, Crown, ChevronRight, Target, FileText, Lightbulb, Shield } from 'lucide-react';
import { useStrategyStore } from '../store/strategyStore';

interface Strategy {
    id: string;
    name: string;
    prompt: string;
    source: 'notion' | 'manual' | 'ai-generated';
    created_at: string;
}

export default function StrategyPage() {
    const {
        projects,
        selectedProject,
        limits,
        tier,
        loading,
        error,
        projectLoading,
        editingBrandVoice,
        brandVoiceText,
        editingStrategy,
        newStrategyMode,
        newStrategy,
        editingProjectName,
        projectNameText,
        addingProject,
        newProjectName,
        isSavingBrandVoice,
        isSavingStrategy,
        isNovaSecured,
        loadProjects,
        selectProject,
        createProject,
        updateProjectName,
        saveBrandVoice,
        addStrategy,
        updateStrategy,
        deleteStrategy,
        setEditingBrandVoice,
        setBrandVoiceText,
        setEditingStrategy,
        setNewStrategyMode,
        setNewStrategy,
        setEditingProjectName,
        setProjectNameText,
        setAddingProject,
        setNewProjectName
    } = useStrategyStore();

    useEffect(() => {
        loadProjects();
    }, []);

    // Helper functions for UI rendering
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                        <Briefcase className="text-blue-400" />
                        Brand Strategy
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base">Manage your brand voices and engagement strategies</p>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-xs md:text-sm text-gray-300 flex items-center gap-2">
                        <Crown size={14} className={tier === 'pro' || tier === 'agency' ? "text-yellow-400" : "text-gray-400"} />
                        <span className="capitalize">{tier} Plan</span>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 text-sm md:text-base">
                    <X size={18} />
                    {error}
                </div>
            )}

            {/* Project Selector */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h2 className="font-bold text-base md:text-lg text-white flex items-center gap-2">
                        <Target size={18} className="text-blue-400" />
                        Projects ({(projects || []).length}/{limits.maxProjects === Infinity ? '∞' : limits.maxProjects})
                    </h2>
                    <button
                        onClick={() => setAddingProject(true)}
                        disabled={(projects || []).length >= limits.maxProjects}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm w-full sm:w-auto justify-center sm:justify-start"
                    >
                        <Plus size={16} /> New Project
                    </button>
                </div>

                {addingProject && (
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            placeholder="Project Name"
                            className="flex-1 bg-black/30 border border-blue-500/30 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                            autoFocus
                        />
                        <button
                            onClick={createProject}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                        >
                            Create
                        </button>
                        <button
                            onClick={() => setAddingProject(false)}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {(projects || []).map((project) => (
                        <button
                            key={project.id}
                            onClick={() => selectProject(project.id)}
                            className={`
                                flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-left min-w-[140px]
                                ${selectedProject?.id === project.id
                                    ? 'bg-blue-500/20 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                    : 'bg-black/20 border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10'}
                            `}
                        >
                            <div className={`p-2 rounded-lg ${selectedProject?.id === project.id ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-500'}`}>
                                <Briefcase size={16} />
                            </div>
                            <div>
                                <div className="font-medium text-sm truncate max-w-[100px]">{project.name}</div>
                                <div className="text-xs opacity-60">{project.strategy_count || 0} strategies</div>
                            </div>
                        </button>
                    ))}
                    {(projects || []).length === 0 && !loading && (
                        <div className="text-gray-500 text-sm italic py-2">No projects yet. Create one to get started.</div>
                    )}
                </div>
            </div>

            {/* Selected Project Details */}
            {selectedProject && (
                projectLoading ? renderProjectSkeleton() : (
                    <>
                        {/* Project Header / Name Edit */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hidden sm:block">
                                    <Briefcase size={20} />
                                </div>
                                <div>
                                    {editingProjectName ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={projectNameText}
                                                onChange={(e) => setProjectNameText(e.target.value)}
                                                className="bg-black/30 border border-blue-500/30 rounded px-2 py-1 text-white text-lg font-bold outline-none focus:border-blue-500"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') updateProjectName();
                                                    if (e.key === 'Escape') setEditingProjectName(false);
                                                }}
                                            />
                                            <button onClick={updateProjectName} className="text-green-400 hover:text-green-300"><Save size={18} /></button>
                                            <button onClick={() => setEditingProjectName(false)} className="text-gray-400 hover:text-gray-300"><X size={18} /></button>
                                        </div>
                                    ) : (
                                        <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                                            {selectedProject.name}
                                            <button
                                                onClick={() => {
                                                    setProjectNameText(selectedProject.name);
                                                    setEditingProjectName(true);
                                                }}
                                                className="text-gray-500 hover:text-white transition-colors"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                        </h2>
                                    )}
                                    <p className="text-gray-400 text-xs md:text-sm flex items-center gap-1">
                                        Project ID: {selectedProject.id}
                                        {isNovaSecured && (
                                            <span className="ml-2 text-green-400 flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 text-[10px]">
                                                <Shield size={10} /> Secure Storage Active
                                            </span>
                                        )}
                                    </p>
                                </div>
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
                                    {selectedProject.brand_voice ? (
                                        <div className="whitespace-pre-wrap">{selectedProject.brand_voice}</div>
                                    ) : (
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
                                {/* Pre-filter strategies for safety */}
                                {(selectedProject.strategies || [])
                                    .filter((s): s is Strategy => Boolean(s && s.id && s.name))
                                    .map((strategy) => (
                                        <div
                                            key={strategy.id}
                                            className="bg-black/20 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all"
                                        >
                                            {editingStrategy && editingStrategy.id === strategy.id ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={editingStrategy.name ?? ''}
                                                        onChange={(e) => setEditingStrategy({ ...editingStrategy, name: e.target.value })}
                                                        className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-sm"
                                                    />
                                                    <textarea
                                                        value={editingStrategy.prompt ?? ''}
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
                                                    <p className="text-xs text-gray-400 line-clamp-3 mb-3 whitespace-pre-wrap">
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
