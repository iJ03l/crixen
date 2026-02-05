import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link2, Sliders, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const HowItWorks = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 80%',
            end: 'top 55%',
            scrub: 1,
          },
        }
      );

      // Cards animation
      const cards = cardsRef.current?.querySelectorAll('.step-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 75%',
              end: 'top 45%',
              scrub: 1,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const steps = [
    {
      number: '01',
      icon: Link2,
      title: 'Create your workspace',
      description:
        'Sign up and access the centralized dashboard. Manage subscriptions and brands in one place.',
    },
    {
      number: '02',
      icon: Zap,
      title: 'Engage everywhere',
      description:
        'Install the extension and sync your strategy. Handle comments and DMs across all platforms instantly.',
    },
    {
      number: '03',
      icon: Sliders,
      title: 'Define your strategy',
      description:
        'Create a "Brain" for each project. Crixen learns from your inputs to ensure on-brand replies.',
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative bg-dark-bg py-20 lg:py-32"
    >
      <div className="w-[86vw] max-w-[1100px] mx-auto">
        <h2
          ref={titleRef}
          className="font-heading font-bold text-3xl lg:text-[clamp(34px,3.6vw,52px)] text-dark-text text-center mb-12 lg:mb-16"
        >
          How Crixen works
        </h2>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {steps.map((step, i) => (
            <div
              key={i}
              className="step-card glass-card p-6 lg:p-8 relative group hover:-translate-y-1 transition-transform duration-300"
            >
              {/* Number Badge */}
              <div className="absolute -top-3 -left-2 w-10 h-10 rounded-full bg-dark-silver/20 border border-dark-silver/30 flex items-center justify-center">
                <span className="font-mono text-sm font-medium text-dark-silver">
                  {step.number}
                </span>
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center mb-5 group-hover:bg-white/[0.08] transition-colors">
                <step.icon size={24} className="text-dark-silver" />
              </div>

              {/* Content */}
              <h3 className="font-heading font-semibold text-xl text-dark-text mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-dark-muted leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
