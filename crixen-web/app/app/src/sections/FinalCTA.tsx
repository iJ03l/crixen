import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Mail } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

gsap.registerPlugin(ScrollTrigger);

const FinalCTA = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { openAuthModal } = useAuthStore();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative">
      {/* CTA Section */}
      <div
        className="relative py-24 lg:py-32"
        style={{
          backgroundImage: 'url(/cta_bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-dark-bg/65" />

        <div
          ref={contentRef}
          className="relative z-10 text-center px-6"
        >
          <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[clamp(40px,4.5vw,64px)] text-dark-text mb-4">
            Ready to reclaim your time?
          </h2>
          <p className="text-base lg:text-lg text-dark-muted max-w-md mx-auto mb-8">
            Start free. Upgrade when you&apos;re ready to scale.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => openAuthModal('signup')}
              className="btn-primary flex items-center gap-2"
            >
              Get Started
              <ArrowRight size={18} />
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <Mail size={18} />
              Contact sales
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark-bg border-t border-white/[0.06] py-12 lg:py-16">
        <div className="w-[86vw] max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Product */}
            <div>
              <h4 className="font-heading font-semibold text-sm text-dark-text mb-4">
                Product
              </h4>
              <ul className="space-y-2.5">
                {['Features', 'Pricing', 'Integrations', 'Changelog'].map(
                  (item) => (
                    <li key={item}>
                      <button className="text-sm text-dark-muted hover:text-dark-text transition-colors">
                        {item}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-heading font-semibold text-sm text-dark-text mb-4">
                Resources
              </h4>
              <ul className="space-y-2.5">
                {['Documentation', 'API Reference', 'Blog', 'Community'].map(
                  (item) => (
                    <li key={item}>
                      <button className="text-sm text-dark-muted hover:text-dark-text transition-colors">
                        {item}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-heading font-semibold text-sm text-dark-text mb-4">
                Company
              </h4>
              <ul className="space-y-2.5">
                {['About', 'Careers', 'Press', 'Contact'].map((item) => (
                  <li key={item}>
                    <button className="text-sm text-dark-muted hover:text-dark-text transition-colors">
                      {item}
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
                {['Privacy', 'Terms', 'Security', 'Cookies'].map((item) => (
                  <li key={item}>
                    <button className="text-sm text-dark-muted hover:text-dark-text transition-colors">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <span className="font-heading font-bold text-lg text-dark-text">
                Crixen
              </span>
            </div>
            <p className="text-xs text-dark-muted">
              © {new Date().getFullYear()} Crixen. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </section>
  );
};

export default FinalCTA;
