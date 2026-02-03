import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { User, Building2, ShoppingBag, Headphones } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const UseCases = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Cards animation
      const cards = cardsRef.current?.querySelectorAll('.use-case-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const useCases = [
    {
      icon: User,
      title: 'Social Media Managers',
      description:
        'Handle multiple clients without switching contexts. Draft, approve, and schedule replies in seconds.',
    },
    {
      icon: Building2,
      title: 'Founders & Startups',
      description:
        'Build in public without the time sink. Maintain an active presence while focusing on your product.',
    },
    {
      icon: ShoppingBag,
      title: 'Personal Brands',
      description:
        'Optimize your social presence. Engage with every comment to build a loyal community faster.',
    },
    {
      icon: Headphones,
      title: 'Agencies',
      description:
        'Scale your operations. Assign distinct "Brains" to each client to ensure on-brand messaging at scale.',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative bg-dark-bg py-20 lg:py-32"
    >
      <div className="w-[86vw] max-w-[1100px] mx-auto">
        <h2
          ref={titleRef}
          className="font-heading font-bold text-3xl lg:text-[clamp(34px,3.6vw,52px)] text-dark-text text-center mb-12 lg:mb-16"
        >
          Built for creators, teams, and brands
        </h2>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5"
        >
          {useCases.map((useCase, i) => (
            <div
              key={i}
              className="use-case-card glass-card p-6 lg:p-7 group hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-white/[0.05] flex items-center justify-center mb-4 group-hover:bg-white/[0.08] transition-colors">
                <useCase.icon size={22} className="text-dark-silver" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-dark-text mb-2">
                {useCase.title}
              </h3>
              <p className="text-sm text-dark-muted leading-relaxed">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
