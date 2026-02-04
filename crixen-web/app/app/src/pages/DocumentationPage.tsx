import ContentLayout from '../layouts/ContentLayout';

export default function DocumentationPage() {
    return (
        <ContentLayout title="Documentation" subtitle="Learn how to get the most out of Crixen.">
            <div className='grid gap-6 md:grid-cols-2'>
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                    <h3 className="font-heading font-semibold text-xl mb-2 mt-0">Getting Started</h3>
                    <p className="text-sm text-dark-muted mb-4">
                        Install the extension, sign in, and start replying in seconds.
                    </p>
                    <a href="#" className="text-sm text-blue-400">Read Guide →</a>
                </div>
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                    <h3 className="font-heading font-semibold text-xl mb-2 mt-0">Projects & Memory</h3>
                    <p className="text-sm text-dark-muted mb-4">
                        How to isolate contexts for different brands or personas using Projects.
                    </p>
                    <a href="#" className="text-sm text-blue-400">Read Guide →</a>
                </div>
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                    <h3 className="font-heading font-semibold text-xl mb-2 mt-0">API Integration</h3>
                    <p className="text-sm text-dark-muted mb-4">
                        Connect Crixen to your own tools. (Coming Soon)
                    </p>
                    <span className="text-sm text-dark-muted">Coming Soon</span>
                </div>
            </div>
        </ContentLayout>
    );
}
