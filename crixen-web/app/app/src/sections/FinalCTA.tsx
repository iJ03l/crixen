import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

const FinalCTA = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
              onClick={() => navigate('/dashboard')}
              className="btn-primary flex items-center gap-2"
            >
              Get Started
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </section>
  );
};

export default FinalCTA;
