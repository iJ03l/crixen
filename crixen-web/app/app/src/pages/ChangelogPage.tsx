import ContentLayout from '../layouts/ContentLayout';

export default function ChangelogPage() {
    return (
        <ContentLayout title="Changelog" subtitle="New updates and improvements to Crixen.">
            <div className="relative border-l border-white/10 ml-4 space-y-12">
                {/* v2.1.0 */}
                <div className="pl-8 relative">
                    <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-purple-500 box-content border-4 border-dark-bg" />
                    <span className="text-sm font-mono text-dark-muted mb-1 block">February 2026</span>
                    <h3 className="text-xl font-bold mb-3 mt-0">v2.1.0 - NOVA Integration & Strategy Brain</h3>
                    <ul>
                        <li><strong>NOVA Encrypted Storage</strong>: Strategies now stored with zero-knowledge encryption on IPFS.</li>
                        <li><strong>Invisible NEAR Accounts</strong>: Automatic wallet creation for Pro/Agency users on signup.</li>
                        <li><strong>Strategy Brain</strong>: New interactive dashboard page to manage brand voice and strategies per project.</li>
                        <li><strong>Tier-Based Limits</strong>: Starter (3 strategies), Pro (10), Agency (unlimited) per project.</li>
                        <li><strong>Notion Sync</strong>: Captured strategies from Notion now sync to cloud automatically.</li>
                        <li><strong>Cross-Platform Sync</strong>: Edit brand voice in extension or dashboard—changes sync everywhere.</li>
                    </ul>
                </div>

                {/* v1.2.0 */}
                <div className="pl-8 relative">
                    <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-blue-500 box-content border-4 border-dark-bg" />
                    <span className="text-sm font-mono text-dark-muted mb-1 block">February 2026</span>
                    <h3 className="text-xl font-bold mb-3 mt-0">v1.2.0 - Dashboard & Sync</h3>
                    <ul>
                        <li>Added "Projects" section to dashboard for better organization.</li>
                        <li>Implemented daily generation limits (10 for Starter, 150 for Pro).</li>
                        <li>Synced project names between Chrome Extension and Dashboard seamlessly.</li>
                        <li>Redesigned extension project list to fetch from cloud.</li>
                    </ul>
                </div>

                {/* v1.0.0 */}
                <div className="pl-8 relative">
                    <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-dark-silver box-content border-4 border-dark-bg" />
                    <span className="text-sm font-mono text-dark-muted mb-1 block">January 2026</span>
                    <h3 className="text-xl font-bold mb-3 mt-0">v1.0.0 - Launch</h3>
                    <ul>
                        <li>Initial release of Crixen web platform and Chrome extension.</li>
                        <li>Context-aware AI replies for X (Twitter).</li>
                        <li>Basic analytics and usage tracking.</li>
                    </ul>
                </div>
            </div>
        </ContentLayout>
    );
}
