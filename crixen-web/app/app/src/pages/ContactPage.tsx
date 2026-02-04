import ContentLayout from '../layouts/ContentLayout';

export default function ContactPage() {
    return (
        <ContentLayout title="Contact Us" subtitle="We'd love to hear from you.">
            <p>
                Have a question, feedback, or need support? We're here to help.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mt-8 not-prose">
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                    <h3 className="font-heading font-semibold text-xl mb-2">Support</h3>
                    <p className="text-dark-muted mb-4">For help with your account or technical issues.</p>
                    <a href="mailto:support@crixen.app" className="text-blue-400 hover:text-blue-300">support@crixen.app</a>
                </div>
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                    <h3 className="font-heading font-semibold text-xl mb-2">Community</h3>
                    <p className="text-dark-muted mb-4">Join our Telegram community for real-time updates.</p>
                    <a href="https://t.me/crixenai" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Join on Telegram</a>
                </div>
            </div>
        </ContentLayout>
    );
}
