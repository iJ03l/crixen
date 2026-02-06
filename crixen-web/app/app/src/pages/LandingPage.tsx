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
import SEO from '../components/SEO';

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
            <SEO />
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
                            eyebrow: "ZERO-KNOWLEDGE SECURITY",
                            headline: "Reply in seconds. Encrypted by design.",
                            description: (
                                <>
                                    Crixen safeguards your brand with enterprise-grade security. All requests are signed and proxied—never exposing your secrets.
                                    <br /><br />
                                    <strong>NOVA Encrypted Storage</strong>
                                    <br />
                                    Your strategies are encrypted and stored on IPFS with invisible NEAR accounts created automatically. Only you can decrypt your data.
                                    <br /><br />
                                    Built on <strong>NEAR AI with Trusted Execution Environments</strong> for verifiable, user-owned AI that enterprises trust.
                                </>
                            ),
                            linkText: "See security specs",
                            href: "https://near.ai",
                            backgroundImage: "/feature_auto_bg.jpg",
                            uiCardType: "reply"
                        }}
                        feature2={{
                            id: "tone-control",
                            eyebrow: "STRATEGY BRAIN",
                            headline: "Define your strategy once. Deploy everywhere.",
                            description: "Create distinct 'Brains' for each project with brand voice and captured strategies. Sync from Notion, edit from dashboard or extension—all encrypted and versioned.",
                            linkText: "Explore strategy tools",
                            backgroundImage: "/feature_tone_bg.jpg",
                            uiCardType: "tone"
                        }}
                        feature3={{
                            id: "multi-platform",
                            eyebrow: "TIER-BASED MANAGEMENT",
                            headline: "Scale with your needs.",
                            description: "Starter gets 1 project, Pro gets 3, Agency gets unlimited. Each project has its own strategies and brand voice—perfect for agencies and creators.",
                            linkText: "View pricing",
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
