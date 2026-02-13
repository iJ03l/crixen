const logos = [
    { src: '/logos/logo_rev.svg', alt: 'Partner 1' },
    { src: '/logos/logo2.png', alt: 'Partner 2' },
    { src: '/logos/logo4.jpeg', alt: 'Partner 3' },
    { src: '/logos/logo3.png', alt: 'Partner 4' },
];

const LogoStrip = () => {
    return (
        <section className="relative w-full bg-dark-bg overflow-hidden">
            {/* Top inset shadow — cast by hero above */}
            <div
                className="absolute top-0 left-0 right-0 h-24 pointer-events-none z-10"
                style={{
                    background:
                        'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.35) 40%, transparent 100%)',
                }}
            />

            {/* Bottom inset shadow — cast by section below */}
            <div
                className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-10"
                style={{
                    background:
                        'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.35) 40%, transparent 100%)',
                }}
            />

            {/* Recessed background effect */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    boxShadow:
                        'inset 0 20px 40px -10px rgba(0,0,0,0.8), inset 0 -20px 40px -10px rgba(0,0,0,0.8)',
                }}
            />

            {/* Content */}
            <div className="relative z-20 py-10 sm:py-14 lg:py-16">
                <p className="font-mono text-[11px] text-dark-muted/60 uppercase tracking-[0.15em] text-center mb-6 sm:mb-8">
                    ECOSYSTEM
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 lg:gap-16 px-4 sm:px-6">
                    {logos.map((logo, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-center"
                        >
                            <img
                                src={logo.src}
                                alt={logo.alt}
                                className="h-8 sm:h-10 lg:h-12 w-auto object-contain opacity-50 grayscale hover:opacity-80 hover:grayscale-0 transition-all duration-500 rounded-md"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LogoStrip;
