import { useNavigate, useLocation } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (path: string) => {
        if (path.startsWith('http')) {
            window.open(path, '_blank', 'noopener,noreferrer');
            return;
        }

        // Handle anchors
        if (path.startsWith('/#')) {
            // If on homepage, scroll
            if (location.pathname === '/') {
                const id = path.replace('/#', '');
                const el = document.getElementById(id);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                // Otherwise navigate to home with hash (React Router needs help usually, but let's try pushing)
                // A simple window.location might be more robust for anchors across pages without HashLink
                window.location.href = path;
            }
            return;
        }

        navigate(path);
        window.scrollTo(0, 0); // Reset scroll for new pages
    };

    return (
        <footer className="bg-dark-bg border-t border-white/[0.06] py-12 lg:py-16">
            <div className="w-[86vw] max-w-[1100px] mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
                    {/* Product */}
                    <div>
                        <h4 className="font-heading font-semibold text-sm text-dark-text mb-4">
                            Product
                        </h4>
                        <ul className="space-y-2.5">
                            {[
                                { label: 'Pricing', path: '/#pricing' },
                                { label: 'Changelog', path: '/changelog' },
                            ].map((item) => (
                                <li key={item.label}>
                                    <button
                                        onClick={() => handleNavigation(item.path)}
                                        className="text-sm text-dark-muted hover:text-dark-text transition-colors text-left"
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-heading font-semibold text-sm text-dark-text mb-4">
                            Resources
                        </h4>
                        <ul className="space-y-2.5">
                            {[
                                { label: 'Documentation', path: '/docs' },
                                { label: 'Community', path: 'https://t.me/crixenai' },
                            ].map((item) => (
                                <li key={item.label}>
                                    <button
                                        onClick={() => handleNavigation(item.path)}
                                        className="text-sm text-dark-muted hover:text-dark-text transition-colors text-left"
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-heading font-semibold text-sm text-dark-text mb-4">
                            Company
                        </h4>
                        <ul className="space-y-2.5">
                            {[
                                { label: 'About', path: '/about' },
                                { label: 'Contact', path: '/contact' },
                            ].map((item) => (
                                <li key={item.label}>
                                    <button
                                        onClick={() => handleNavigation(item.path)}
                                        className="text-sm text-dark-muted hover:text-dark-text transition-colors text-left"
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-heading font-semibold text-sm text-dark-text mb-4">
                            Legal
                        </h4>
                        <ul className="space-y-2.5">
                            {[
                                { label: 'Privacy', path: '/privacy' },
                                { label: 'Terms', path: '/terms' },
                                { label: 'Security', path: '/security' },
                                { label: 'Cookies', path: '/cookies' },
                            ].map((item) => (
                                <li key={item.label}>
                                    <button
                                        onClick={() => handleNavigation(item.path)}
                                        className="text-sm text-dark-muted hover:text-dark-text transition-colors text-left"
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/[0.06]">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <span className="font-heading font-bold text-lg text-dark-text">
                            Crixen
                        </span>
                        <a
                            href="https://x.com/crixenai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-dark-muted hover:text-dark-text transition-colors"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            <span className="text-sm">@crixenai</span>
                        </a>
                    </div>
                    <p className="text-xs text-dark-muted">
                        © {new Date().getFullYear()} Crixen. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
