import ContentLayout from '../../layouts/ContentLayout';

export default function SecurityPage() {
    return (
        <ContentLayout title="Security" subtitle="How we protect your data">
            <p>
                Security is at the core of our business. We use industry-standard encryption and security practices to keep your data safe.
            </p>
            <h3>Data Encryption</h3>
            <p>
                All data transmitted between your browser and our servers is encrypted using TLS 1.2 or higher. We encryption data at rest using AES-256.
            </p>
            <h3>Access Controls</h3>
            <p>
                Our team has strict access controls ensuring that only authorized personnel have access to production systems and user data, and only when necessary for support or maintenance.
            </p>
        </ContentLayout>
    );
}
