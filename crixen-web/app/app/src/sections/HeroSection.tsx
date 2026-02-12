import { useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const HeroSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const navigate = useNavigate();

  // Load animation (on mount)
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      // Background
      tl.fromTo(
        bgRef.current,
        { opacity: 0, scale: 1.06 },
        { opacity: 1, scale: 1, duration: 0.9 },
        0
      );

      // Headline words
      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll('.word');
        tl.fromTo(
          words,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.06 },
          0.2
        );
      }

      // Subheadline + CTAs
      tl.fromTo(
        '.hero-subcontent',
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        0.45
      );

      // Right UI card
      tl.fromTo(
        cardRef.current,
        { x: '10vw', opacity: 0, rotate: 2 },
        { x: 0, opacity: 1, rotate: 0, duration: 0.8 },
        0.55
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Scroll-driven exit animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
          onLeaveBack: () => {
            // Reset all elements to visible when scrolling back to top
            gsap.set([contentRef.current, cardRef.current], {
              x: 0,
              opacity: 1,
            });
            gsap.set(bgRef.current, { scale: 1, opacity: 1 });
          },
        },
      });

      // ENTRANCE (0-30%): Hold - already visible from load animation
      // SETTLE (30-70%): Static

      // EXIT (70-100%)
      scrollTl.fromTo(
        contentRef.current,
        { x: 0, opacity: 1 },
        { x: '-18vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        cardRef.current,
        { x: 0, opacity: 1 },
        { x: '18vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        bgRef.current,
        { scale: 1, opacity: 1 },
        { scale: 1.05, opacity: 0.9, ease: 'power2.in' },
        0.7
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // const headlineWords = ['Turn', 'comments', 'into', 'conversations.']; // Unused

  return (
    <section
      ref={sectionRef}
      className="section-pinned bg-dark-bg flex items-start lg:items-center justify-start lg:justify-center"
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/hero_bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.6) 55%, rgba(5,5,5,0.8) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-6 lg:px-[8vw] pt-32 pb-20 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          {/* Left Content */}
          <div ref={contentRef} className="w-full lg:w-[42vw] text-left">
            <h1
              ref={headlineRef}
              className="font-heading font-bold text-4xl sm:text-5xl lg:text-[clamp(44px,5vw,76px)] text-dark-text leading-[0.95] tracking-tight"
            >
              <span className="word inline-block mr-[0.3em]">The</span>
              <span className="word inline-block mr-[0.3em]">Ultimate</span>
              <span className="word inline-block mr-[0.3em]">Social</span>
              <span className="word inline-block mr-[0.3em]">Media</span>
              <span className="word inline-block mr-[0.3em]">AI</span>
              <span className="word inline-block mr-[0.3em]">Agent.</span>
            </h1>

            <div className="hero-subcontent mt-6 lg:mt-8">
              <p className="text-base lg:text-lg text-dark-muted max-w-lg leading-relaxed">
                Crixen helps you manage multiple brands with encrypted strategy storage,
                automated engagement, and a dashboard that scales with your needs.
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-6 lg:mt-8">
                <a
                  href="https://chromewebstore.google.com/detail/crixen/oapmeeppjjmmchhbbdighfimhkifdmgj?hl=en-US&utm_source=ext_sidebar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center gap-2"
                >
                  <Sparkles size={18} />
                  Install Extension
                </a>
                <button className="btn-secondary flex items-center gap-2">
                  <Play size={18} />
                  Watch demo
                </button>
              </div>

              <p className="font-mono text-xs text-dark-muted mt-4 tracking-wide">
                Trusted by creators/enterprises • Little to no setup step required
              </p>
            </div>
          </div>

          {/* Right UI Card */}
          <div
            ref={cardRef}
            className="w-full lg:w-[34vw] max-w-md lg:max-w-none"
          >
            <div className="glass-card p-5 lg:p-6">
              {/* Card Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-dark-silver/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-dark-silver/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-dark-silver/20" />
                </div>
              </div>

              {/* Caption */}
              <p className="font-mono text-xs text-dark-muted uppercase tracking-wider mb-4">
                Crixen is generating replies...
              </p>

              {/* Reply Rows */}
              <div className="space-y-3">
                {[
                  {
                    name: 'Sarah Chen',
                    handle: '@sarahchen',
                    reply:
                      'Love this perspective! The way you break down complex ideas is so refreshing.',
                  },
                  {
                    name: 'Marcus Webb',
                    handle: '@mwebb',
                    reply:
                      'This resonates with me. Been thinking about this exact topic lately.',
                  },
                  {
                    name: 'Emma Torres',
                    handle: '@emmat',
                    reply:
                      'Exactly what I needed to hear today. Thank you for sharing!',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dark-silver/40 to-dark-silver/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-dark-text">
                        {item.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-dark-text">
                          {item.name}
                        </span>
                        <span className="text-xs text-dark-muted">
                          {item.handle}
                        </span>
                      </div>
                      <p className="text-sm text-dark-muted truncate">
                        {item.reply}
                      </p>
                    </div>
                    <div className="animate-pulse-subtle">
                      <Sparkles size={16} className="text-dark-silver" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
