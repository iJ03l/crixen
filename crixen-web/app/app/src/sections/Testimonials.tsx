import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Testimonials = () => {
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
      const cards = cardsRef.current?.querySelectorAll('.testimonial-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0 },
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

  const testimonials = [
    {
      quote:
        "It's like having a community manager who actually sounds like me. My audience has noticed the consistency.",
      name: 'Alex Rivera',
      handle: '@arivera',
      role: 'Creator',
    },
    {
      quote:
        "We cut reply time by 70% without losing the human touch. Our clients are amazed at how responsive we've become.",
      name: 'Sam Torres',
      handle: '@torresdigital',
      role: 'Agency Lead',
    },
    {
      quote:
        "The tone controls are chef's kiss—consistent but never robotic. It genuinely feels like an extension of our brand.",
      name: 'Jordan Lee',
      handle: '@jlee_brand',
      role: 'Brand Lead',
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
          What early users are saying
        </h2>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="testimonial-card glass-card p-6 lg:p-7 flex flex-col"
            >
              <Quote
                size={24}
                className="text-dark-silver/40 mb-4 flex-shrink-0"
              />
              <p className="text-sm text-dark-text leading-relaxed mb-6 flex-1">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dark-silver/30 to-dark-silver/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-dark-text">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-dark-text">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-dark-muted">
                    {testimonial.handle} • {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
