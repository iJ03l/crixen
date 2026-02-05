import { Briefcase, User, FileText, Zap, Layers, Smile, Target, Sparkles, BookOpen } from 'lucide-react';

export default function StrategyPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-2 mb-10">
                <h1 className="font-heading font-bold text-3xl md:text-4xl text-white">Strategy Brain</h1>
                <p className="text-dark-muted max-w-2xl mx-auto text-lg">
                    Train your AI agent on your unique voice. Whether you're a brand managing multiple clients or an individual building a personal brand, Crixen adapts to you.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* For Brands Section */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-blue-500/20 transition-colors"></div>

                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                            <Briefcase size={28} strokeWidth={1.5} />
                        </div>
                        <h2 className="font-heading font-bold text-2xl text-white">For Brands & Agencies</h2>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <p className="text-gray-300 leading-relaxed">
                            Managing social media for businesses requires consistency and distinct voices for every client. Crixen streamlines this with robust strategy tools.
                        </p>

                        <ul className="space-y-4">
                            <li className="flex gap-4">
                                <div className="mt-1 text-blue-400 shrink-0"><BookOpen size={20} /></div>
                                <div>
                                    <h3 className="font-bold text-white mb-1">Capture Existing Strategies</h3>
                                    <p className="text-sm text-dark-muted">
                                        Have a brand strategy on Notion? Use the extension to <span className="text-white">"Capture"</span> it instantly. Crixen reads your Notion file to learn tone, pillars, and guidelines.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="mt-1 text-blue-400 shrink-0"><Sparkles size={20} /></div>
                                <div>
                                    <h3 className="font-bold text-white mb-1">Generate from Scratch</h3>
                                    <p className="text-sm text-dark-muted">
                                        Starting fresh? Let Crixen create a world-class strategy for you. Describe the business, and our AI will build a comprehensive brand bible.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="mt-1 text-blue-400 shrink-0"><Layers size={20} /></div>
                                <div>
                                    <h3 className="font-bold text-white mb-1">Project Organization</h3>
                                    <p className="text-sm text-dark-muted">
                                        Use <span className="text-white">"Projects"</span> in the extension to isolate clients. Avoid tone mismatch by setting a unique Project for each brand you manage (e.g., "Nike", "Local Cafe").
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* For Individuals Section */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-purple-500/20 transition-colors"></div>

                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                            <User size={28} strokeWidth={1.5} />
                        </div>
                        <h2 className="font-heading font-bold text-2xl text-white">For Individuals</h2>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <p className="text-gray-300 leading-relaxed">
                            Building a personal brand? Crixen acts as your digital twin, helping you engage authentically without sounding robotic.
                        </p>

                        <ul className="space-y-4">
                            <li className="flex gap-4">
                                <div className="mt-1 text-purple-400 shrink-0"><Target size={20} /></div>
                                <div>
                                    <h3 className="font-bold text-white mb-1">Define Your Persona</h3>
                                    <p className="text-sm text-dark-muted">
                                        Input a detailed description of yourself, your interests, and how you talk. Set rules (e.g., "No emojis", "Lower case only") to match your vibe.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="mt-1 text-purple-400 shrink-0"><Smile size={20} /></div>
                                <div>
                                    <h3 className="font-bold text-white mb-1">Dynamic Moods</h3>
                                    <p className="text-sm text-dark-muted">
                                        Feeling spicy or professional? Switch tones instantly from the extension. Set your default to "Casual" but switch to "Witty" when the moment calls for it.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="mt-1 text-purple-400 shrink-0"><Zap size={20} /></div>
                                <div>
                                    <h3 className="font-bold text-white mb-1">Quick Calibration</h3>
                                    <p className="text-sm text-dark-muted">
                                        As you evolve, update your instructions. Crixen learns instantly—no retraining time required.
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/5 border-l-4 border-l-blue-400 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">Ready to set your Strategy?</h3>
                    <p className="text-dark-muted">
                        Open the Crixen Extension on any tab (or Notion) to start capturing or defining your voice.
                    </p>
                </div>
                <div className="flex gap-3">
                    {/* Placeholder for future action button if needed */}
                </div>
            </div>
        </div>
    );
}
