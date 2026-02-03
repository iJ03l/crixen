import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from '../sections/Navigation';
import HeroSection from '../sections/HeroSection';
import CombinedFeatureSection from '../sections/CombinedFeatureSection';
import DashboardPreview from '../sections/DashboardPreview';
import HowItWorks from '../sections/HowItWorks';
import UseCases from '../sections/UseCases';
import Testimonials from '../sections/Testimonials';
import Pricing from '../sections/Pricing';
import FAQ from '../sections/FAQ';
import FinalCTA from '../sections/FinalCTA';
import AuthModal from '../sections/AuthModal';
import { useAuthStore } from '../store/authStore';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
    const mainRef = useRef<HTMLDivElement>(null);
    const { isAuthModalOpen } = useAuthStore();

    useEffect(() => {
        // Wait for all sections to mount before setting up global snap
        const timer = setTimeout(() => {
            const pinned = ScrollTrigger.getAll()
                .filter(st => st.vars.pin)
                .sort((a, b) => a.start - b.start);

            const maxScroll = ScrollTrigger.maxScroll(window);

            if (!maxScroll || pinned.length === 0) return;

            const pinnedRanges = pinned.map(st => ({
                start: st.start / maxScroll,
                end: (st.end ?? st.start) / maxScroll,
                center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
            }));

            ScrollTrigger.create({
                snap: {
                    snapTo: (value: number) => {
                        const inPinned = pinnedRanges.some(
                            r => value >= r.start - 0.02 && value <= r.end + 0.02
                        );
                        if (!inPinned) return value;

                        const target = pinnedRanges.reduce(
                            (closest, r) =>
                                Math.abs(r.center - value) < Math.abs(closest - value)
                                    ? r.center
                                    : closest,
                            pinnedRanges[0]?.center ?? 0
                        );
                        return target;
                    },
                    duration: { min: 0.15, max: 0.35 },
                    delay: 0,
                    ease: 'power2.out',
                },
            });
        }, 500);

        return () => {
            clearTimeout(timer);
            ScrollTrigger.getAll().forEach(st => st.kill());
        };
    }, []);

    return (
        <div ref={mainRef} className="relative bg-dark-bg min-h-screen">
            {/* Noise overlay */}
            <div className="noise-overlay" />

            {/* Navigation */}
            <Navigation />

            {/* Main content */}
            <main className="relative">
                {/* Section 1: Hero - z-10 */}
                <div className="relative z-10">
                    <HeroSection />
                </div>

                {/* Merged Section 1: Secure & Tone - z-20 */}
                <div className="relative z-20">
                    <CombinedFeatureSection
                        feature1={{
                            id: "auto-reply",
                            eyebrow: "SECURE GENERATION",
                            headline: "Reply in seconds. Zero API keys.",
                            description: "Enterprise-grade security built-in. All AI requests are signed and proxied through our backend—never expose your secrets.",
                            linkText: "See security specs",
                            backgroundImage: "/feature_auto_bg.jpg",
                            uiCardType: "reply"
                        }}
                        feature2={{
                            id: "tone-control",
                            eyebrow: "CENTRALIZED BRAIN",
                            headline: "Define your strategy once. Deploy everywhere.",
                            description: "Create distinct 'Brains' for each brand. Crixen helps you maintain a consistent voice across all your accounts.",
                            linkText: "Explore strategy tools",
                            backgroundImage: "/feature_tone_bg.jpg",
                            uiCardType: "tone"
                        }}
                    />
                </div>

                {/* Merged Section 2: Dashboard & Analytics - z-30 */}
                <div className="relative z-30">
                    <CombinedFeatureSection
                        feature1={{
                            id: "multi-platform",
                            eyebrow: "UNIFIED DASHBOARD",
                            headline: "Manage multiple brands from one place.",
                            description: "Switch between projects instantly. Perfect for agencies and creators managing multiple personas.",
                            linkText: "View integrations",
                            backgroundImage: "/feature_multi_bg.jpg",
                            uiCardType: "platforms"
                        }}
                    />
                </div>

                {/* Section 6: Dashboard Preview - z-40 */}
                <div className="relative z-40">
                    <DashboardPreview />
                </div>

                {/* Flowing sections */}
                <HowItWorks />
                <UseCases />
                <Testimonials />
                <Pricing />
                <FAQ />
                <FinalCTA />
            </main>

            {/* Auth Modal */}
            {isAuthModalOpen && <AuthModal />}
        </div>
    );
}
