import { ArrowRight, Send, MessageSquare, Instagram, Twitter, FileText, PlusCircle } from 'lucide-react';

interface FeatureProps {
    id: string;
    eyebrow: string;
    headline: string;
    description: string;
    linkText: string;
    backgroundImage: string;
    uiCardType: 'reply' | 'tone' | 'platforms' | 'analytics';
}

interface CombinedFeatureSectionProps {
    feature1: FeatureProps;
    feature2?: FeatureProps;
    feature3?: FeatureProps;
}

const CombinedFeatureSection = ({ feature1, feature2, feature3 }: CombinedFeatureSectionProps) => {

    const renderUICard = (type: string) => {
        switch (type) {
            case 'reply':
                return (
                    <div className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/20 flex items-center justify-center">
                                <span className="text-sm font-medium text-dark-text">A</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-dark-text">Alex Rivera</p>
                                <p className="text-xs text-dark-muted">@arivera</p>
                            </div>
                        </div>
                        <div className="bg-white/[0.05] rounded-xl p-4 mb-3">
                            <p className="text-sm text-dark-muted">
                                &ldquo;This is exactly what I&apos;ve been looking for! How did you know?&rdquo;
                            </p>
                        </div>
                        <div className="flex items-center gap-2 bg-dark-silver/10 rounded-xl p-4 border border-dark-silver/20">
                            <MessageSquare size={16} className="text-dark-silver" />
                            <p className="text-sm text-dark-text flex-1">
                                So glad it resonated! Always here if you want to dive deeper.
                            </p>
                            <button className="animate-pulse-subtle">
                                <Send size={18} className="text-dark-silver" />
                            </button>
                        </div>
                    </div>
                );
            case 'tone':
                return (
                    <div className="p-5">
                        <p className="font-mono text-xs text-dark-muted uppercase tracking-wider mb-4">
                            Voice Settings
                        </p>
                        <div className="space-y-3">
                            {[
                                { label: 'Professional', active: false },
                                { label: 'Playful', active: true },
                                { label: 'Radically Honest', active: false },
                                { label: 'Supportive', active: false },
                            ].map((tone, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${tone.active
                                        ? 'bg-dark-silver/10 border-dark-silver/30'
                                        : 'bg-white/[0.03] border-white/[0.05]'
                                        }`}
                                >
                                    <span
                                        className={`text-sm ${tone.active ? 'text-dark-text' : 'text-dark-muted'
                                            }`}
                                    >
                                        {tone.label}
                                    </span>
                                    {tone.active && (
                                        <div className="w-2 h-2 rounded-full bg-dark-silver" />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                            <p className="text-xs text-dark-muted mb-1">Sample output:</p>
                            <p className="text-sm text-dark-text italic">
                                &ldquo;Omg yes!! This is everything ✨ Love where your head&apos;s at!&rdquo;
                            </p>
                        </div>
                    </div>
                );
            case 'platforms':
                return (
                    <div className="p-5">
                        <p className="font-mono text-xs text-dark-muted uppercase tracking-wider mb-4">
                            Connected Platforms
                        </p>
                        <div className="space-y-3">
                            {[
                                { name: 'Instagram', icon: Instagram, connected: true, status: 'CONNECTED' },
                                { name: 'X / Twitter', icon: Twitter, connected: true, status: 'CONNECTED' },
                                { name: 'Notion', icon: FileText, connected: true, status: 'CONNECTED' },
                                { name: 'More Socials', icon: PlusCircle, connected: false, status: 'COMING SOON' },
                            ].map((platform, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                                >
                                    <div className="flex items-center gap-3">
                                        <platform.icon size={18} className="text-dark-muted" />
                                        <span className="text-sm text-dark-text">
                                            {platform.name}
                                        </span>
                                    </div>
                                    <span
                                        className={`text-xs font-mono ${platform.connected
                                            ? 'text-green-400'
                                            : 'text-dark-silver'
                                            }`}
                                    >
                                        {platform.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-dark-silver">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs font-mono">
                                3 platforms active • 24 new comments
                            </span>
                        </div>
                    </div>
                );
            case 'analytics':
                return (
                    <div className="p-5">
                        <p className="font-mono text-xs text-dark-muted uppercase tracking-wider mb-4">
                            This Week
                        </p>
                        <div className="flex items-end gap-2 h-24 mb-4">
                            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-dark-silver/20 rounded-t-sm"
                                    style={{
                                        height: `${h}%`,
                                        opacity: 0.3 + (i * 0.1),
                                    }}
                                />
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'Replies', value: '1,247' },
                                { label: 'Engagement', value: '+34%' },
                                { label: 'Avg Time', value: '12s' },
                            ].map((stat, i) => (
                                <div
                                    key={i}
                                    className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center"
                                >
                                    <p className="text-lg font-heading font-bold text-dark-text">
                                        {stat.value}
                                    </p>
                                    <p className="text-xs text-dark-muted">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const FeatureBlock = ({ feature }: { feature: FeatureProps }) => (
        <div className="flex flex-col gap-4">
            <div>
                <p className="font-mono text-xs text-dark-silver uppercase tracking-[0.08em] mb-2">
                    {feature.eyebrow}
                </p>
                <h2 className="font-heading font-bold text-2xl lg:text-3xl text-dark-text leading-tight mb-2">
                    {feature.headline}
                </h2>
                <p className="text-sm text-dark-muted leading-relaxed mb-4">
                    {feature.description}
                </p>
                <button className="inline-flex items-center gap-2 text-sm text-dark-silver hover:text-dark-text transition-colors group">
                    {feature.linkText}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
            <div className="glass-card bg-white/[0.02]">
                {renderUICard(feature.uiCardType)}
            </div>
        </div>
    );

    const getGridClasses = () => {
        if (feature3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'; // 3 cols
        if (feature2) return 'grid-cols-1 md:grid-cols-2'; // 2 cols
        return 'grid-cols-1'; // 1 col
    };

    const getMaxWidth = () => {
        if (feature3) return 'max-w-7xl lg:max-w-[90vw] xl:max-w-7xl';
        if (feature2) return 'max-w-7xl';
        return 'max-w-4xl';
    };

    return (
        <section className="relative w-full py-20 px-6 lg:px-8 border-t border-white/5 bg-dark-bg">
            {/* Shared Background Image */}
            <div
                className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `url(${feature1.backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-transparent to-dark-bg" />
            </div>

            <div className={`relative z-10 mx-auto ${getMaxWidth()}`}>
                <div className={`grid gap-12 lg:gap-20 ${getGridClasses()}`}>
                    <FeatureBlock feature={feature1} />
                    {feature2 && <FeatureBlock feature={feature2} />}
                    {feature3 && <FeatureBlock feature={feature3} />}
                </div>
            </div>
        </section>
    );
};

export default CombinedFeatureSection;
