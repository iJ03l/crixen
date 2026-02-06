import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

gsap.registerPlugin(ScrollTrigger);

const Pricing = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [animatedValues, setAnimatedValues] = useState<number[]>([0, 0, 0]);
  const { openAuthModal } = useAuthStore();

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
      const cards = cardsRef.current?.querySelectorAll('.pricing-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
              onEnter: () => {
                // Animate price numbers
                const targets = [0, 10, 100];
                targets.forEach((target, i) => {
                  gsap.to(
                    { value: 0 },
                    {
                      value: target,
                      duration: 0.6,
                      delay: i * 0.1,
                      ease: 'power2.out',
                      onUpdate: function () {
                        setAnimatedValues((prev) => {
                          const newValues = [...prev];
                          newValues[i] = Math.round(this.targets()[0].value);
                          return newValues;
                        });
                      },
                    }
                  );
                });
              },
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const plans = [
    {
      name: 'Starter',
      price: animatedValues[0],
      priceLabel: 'Free',
      description: 'Ideal for solopreneurs managing one brand',
      features: [
        '1 Project / Memory Context',
        'Basic generation limits',
        'Standard tone settings',
        'Community support',
      ],
      cta: 'Get started',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: animatedValues[1],
      priceLabel: '$10/mo',
      description: 'Great for creators with multiple personas',
      features: [
        '3 Projects',
        '150 Generations / day',
        'Advanced strategy tools',
        'Priority support',
        'Local-first speed',
      ],
      cta: 'Get started',
      highlighted: true,
    },
    {
      name: 'Agency',
      price: animatedValues[2],
      priceLabel: '$100/mo',
      description: 'For social media managers & scaling teams',
      features: [
        'Unlimited Projects',
        'Unlimited Generations',
        'Isolated memory per project',
        'Team collaboration',
        'Dedicated account manager',
      ],
      cta: 'Get started',
      highlighted: false,
    },
  ];

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="relative bg-dark-bg py-20 lg:py-32"
    >
      <div className="w-[86vw] max-w-[1100px] mx-auto">
        <h2
          ref={titleRef}
          className="font-heading font-bold text-3xl lg:text-[clamp(34px,3.6vw,52px)] text-dark-text text-center mb-12 lg:mb-16"
        >
          Simple pricing
        </h2>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6"
        >
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`pricing-card relative p-6 lg:p-7 rounded-[22px] border transition-all duration-300 ${plan.highlighted
                ? 'bg-white/[0.05] border-white/[0.14] shadow-glow scale-105 z-10'
                : 'bg-dark-card border-white/[0.06] hover:-translate-y-1'
                }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-dark-silver/20 border border-dark-silver/30 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-dark-silver" />
                  <span className="text-xs font-mono text-dark-silver uppercase tracking-wider">
                    Popular
                  </span>
                </div>
              )}

              <div className="mb-5">
                <h3 className="font-heading font-semibold text-lg text-dark-text mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-dark-muted">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="font-heading font-bold text-4xl text-dark-text">
                  {plan.price === 0 ? 'Free' : `$${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-dark-muted text-sm">/mo</span>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <Check
                      size={16}
                      className="text-green-400 mt-0.5 flex-shrink-0"
                    />
                    <span className="text-sm text-dark-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => openAuthModal('signup')}
                className={`w-full py-3 rounded-[14px] font-medium transition-all duration-200 ${plan.highlighted
                  ? 'btn-primary'
                  : 'btn-secondary'
                  }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
