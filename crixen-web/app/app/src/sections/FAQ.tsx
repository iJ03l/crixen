import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

gsap.registerPlugin(ScrollTrigger);

const FAQ = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const accordionRef = useRef<HTMLDivElement>(null);

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

      // Accordion items animation
      const items = accordionRef.current?.querySelectorAll('[data-faq-item]');
      if (items) {
        gsap.fromTo(
          items,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: accordionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const faqs = [
    {
      question: 'Does Crixen post on my behalf?',
      answer:
        'Only if you enable auto-send. By default, you approve every reply before it goes out. You have full control over what gets published and when.',
    },
    {
      question: 'Can I change the tone per platform?',
      answer:
        'Yes! You can set platform-specific voice rules in your settings. Want to be more professional on LinkedIn and more casual on Instagram? Crixen handles that seamlessly.',
    },
    {
      question: 'Is my data used to train models?',
      answer:
        'No. Your data is never used to train AI models. We take privacy seriously and only use your data to provide the Crixen service to you.',
    },
    {
      question: 'Which platforms are supported?',
      answer:
        'We currently support Instagram, X (Twitter), and Notion (for strategy syncing). We are actively building integrations for LinkedIn, TikTok, and more.',
    },
    {
      question: 'What happens if I exceed my reply limit?',
      answer:
        'On the Starter plan, you\'ll be notified when you approach your limit. You can upgrade anytime to unlock unlimited replies. Pro and Team plans have no reply limits.',
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer:
        'Absolutely. You can cancel your subscription at any time from your dashboard. You\'ll continue to have access until the end of your billing period.',
    },
  ];

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="relative bg-dark-bg py-20 lg:py-32"
    >
      <div className="w-[90vw] sm:w-[80vw] lg:w-[70vw] max-w-[780px] mx-auto">
        <h2
          ref={titleRef}
          className="font-heading font-bold text-3xl lg:text-[clamp(34px,3.6vw,52px)] text-dark-text text-center mb-12 lg:mb-16"
        >
          Questions & answers
        </h2>

        <div ref={accordionRef}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                data-faq-item
                className="bg-dark-card border border-white/[0.06] rounded-2xl px-5 py-1 data-[state=open]:bg-white/[0.03] transition-colors"
              >
                <AccordionTrigger className="text-left text-dark-text hover:no-underline py-4 text-sm lg:text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-dark-muted text-sm leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
