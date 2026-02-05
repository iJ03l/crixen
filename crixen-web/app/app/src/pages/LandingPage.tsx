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
        // Cleanup function for any ScrollTriggers created in child components if needed
        return () => {
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

                {/* Merged Section: Secure, Tone & Dashboard - z-20 */}
                <div id="features" className="relative z-20 scroll-mt-24">
                    <CombinedFeatureSection
                        feature1={{
                            id: "auto-reply",
                            eyebrow: "SECURE GENERATION",
                            headline: "Reply in seconds. Zero API keys.",
                            description: (
                                <>
                                    Crixen safeguards your brand with enterprise-grade security. All requests are signed and proxied—never exposing your secrets.
                                    <br /><br />
                                    <strong>Built on NEAR AI for User-Owned, Verifiable AI.</strong>
                                    <br />
                                    We deploy your custom voice models using Private Inference on <strong>Intel TDX and NVIDIA Confidential Computing</strong> infrastructure.
                                    <br /><br />
                                    Your data runs inside a <strong>Trusted Execution Environment</strong> with real-time verification, ensuring total isolation and encryption. Trusted by enterprises, ready for your sensitive workloads.
                                </>
                            ),
                            linkText: "See security specs",
                            href: "https://near.ai",
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
                        feature3={{
                            id: "multi-platform",
                            eyebrow: "UNIFIED DASHBOARD",
                            headline: "Manage multiple brands.",
                            description: "Switch between projects instantly. Perfect for agencies and creators.",
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
