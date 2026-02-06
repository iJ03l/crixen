import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Send, MessageSquare, Instagram, Twitter, FileText, PlusCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface FeatureSectionProps {
  id: string;
  eyebrow: string;
  headline: string;
  description: string;
  linkText: string;
  backgroundImage: string;
  uiCardType: 'reply' | 'tone' | 'platforms' | 'analytics';
}

const FeatureSection = ({
  id,
  eyebrow,
  headline,
  description,
  linkText,
  backgroundImage,
  uiCardType,
}: FeatureSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        },
      });

      // ENTRANCE (0-30%)
      scrollTl.fromTo(
        leftCardRef.current,
        { x: '-55vw', opacity: 0, rotate: -2 },
        { x: 0, opacity: 1, rotate: 0, ease: 'none' },
        0
      );

      scrollTl.fromTo(
        rightCardRef.current,
        { x: '55vw', opacity: 0, rotate: 2 },
        { x: 0, opacity: 1, rotate: 0, ease: 'none' },
        0
      );

      scrollTl.fromTo(
        bgRef.current,
        { scale: 1.08, opacity: 0.7 },
        { scale: 1, opacity: 1, ease: 'none' },
        0
      );

      // SETTLE (30-70%): Static

      // EXIT (70-100%)
      scrollTl.fromTo(
        leftCardRef.current,
        { x: 0, opacity: 1 },
        { x: '-22vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        rightCardRef.current,
        { x: 0, opacity: 1 },
        { x: '22vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        bgRef.current,
        { scale: 1, opacity: 1 },
        { scale: 1.04, opacity: 0.85, ease: 'power2.in' },
        0.7
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const renderUICard = () => {
    switch (uiCardType) {
      case 'reply':
        return (
          <div className="p-5 lg:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/20 flex items-center justify-center">
                <span className="text-sm font-medium text-dark-text">A</span>
              </div>
              <div>
                <p className="text-sm font-medium text-dark-text">Alex Rivera</p>
                <p className="text-xs text-dark-muted">@arivera</p>
              </div>
            </div>
            <div className="bg-white/[0.05] rounded-xl p-4 mb-3">
              <p className="text-sm text-dark-muted">
                &ldquo;This is exactly what I&apos;ve been looking for! How did you know?&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-2 bg-dark-silver/10 rounded-xl p-4 border border-dark-silver/20">
              <MessageSquare size={16} className="text-dark-silver" />
              <p className="text-sm text-dark-text flex-1">
                So glad it resonated! Always here if you want to dive deeper.
              </p>
              <button className="animate-pulse-subtle">
                <Send size={18} className="text-dark-silver" />
              </button>
            </div>
          </div>
        );
      case 'tone':
        return (
          <div className="p-5 lg:p-6">
            <p className="font-mono text-xs text-dark-muted uppercase tracking-wider mb-4">
              Voice Settings
            </p>
            <div className="space-y-3">
              {[
                { label: 'Professional', active: false },
                { label: 'Playful', active: true },
                { label: 'Radically Honest', active: false },
                { label: 'Supportive', active: false },
              ].map((tone, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${tone.active
                    ? 'bg-dark-silver/10 border-dark-silver/30'
                    : 'bg-white/[0.03] border-white/[0.05]'
                    }`}
                >
                  <span
                    className={`text-sm ${tone.active ? 'text-dark-text' : 'text-dark-muted'
                      }`}
                  >
                    {tone.label}
                  </span>
                  {tone.active && (
                    <div className="w-2 h-2 rounded-full bg-dark-silver" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <p className="text-xs text-dark-muted mb-1">Sample output:</p>
              <p className="text-sm text-dark-text italic">
                &ldquo;Omg yes!! This is everything ✨ Love where your head&apos;s at!&rdquo;
              </p>
            </div>
          </div>
        );
      case 'platforms':
        return (
          <div className="p-5 lg:p-6">
            <p className="font-mono text-xs text-dark-muted uppercase tracking-wider mb-4">
              Connected Platforms
            </p>
            <div className="space-y-3">
              {[
                { name: 'Instagram', icon: Instagram, connected: true, status: 'CONNECTED' },
                { name: 'X / Twitter', icon: Twitter, connected: true, status: 'CONNECTED' },
                { name: 'Notion', icon: FileText, connected: true, status: 'CONNECTED' },
                { name: 'More Socials', icon: PlusCircle, connected: false, status: 'COMING SOON' },
              ].map((platform, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                >
                  <div className="flex items-center gap-3">
                    <platform.icon size={18} className="text-dark-muted" />
                    <span className="text-sm text-dark-text">
                      {platform.name}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-mono ${platform.connected
                      ? 'text-green-400'
                      : 'text-dark-silver'
                      }`}
                  >
                    {platform.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-dark-silver">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-mono">
                3 platforms active • 24 new comments
              </span>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="p-5 lg:p-6">
            <p className="font-mono text-xs text-dark-muted uppercase tracking-wider mb-4">
              This Week
            </p>
            <div className="flex items-end gap-2 h-24 mb-4">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-dark-silver/20 rounded-t-sm"
                  style={{
                    height: `${h}%`,
                    opacity: 0.3 + (i * 0.1),
                  }}
                />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Replies', value: '1,247' },
                { label: 'Engagement', value: '+34%' },
                { label: 'Avg Time', value: '12s' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center"
                >
                  <p className="text-lg font-heading font-bold text-dark-text">
                    {stat.value}
                  </p>
                  <p className="text-xs text-dark-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section
      id={id}
      ref={sectionRef}
      className="section-pinned bg-dark-bg flex items-center justify-center"
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-dark-bg/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-6 lg:px-[8vw]">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Left Content Card */}
          <div
            ref={leftCardRef}
            className="w-full lg:w-[38vw] max-w-lg"
          >
            <div className="glass-card p-6 lg:p-8">
              <p className="font-mono text-xs text-dark-silver uppercase tracking-[0.08em] mb-4">
                {eyebrow}
              </p>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-[clamp(28px,3vw,42px)] text-dark-text leading-tight mb-4">
                {headline}
              </h2>
              <p className="text-base text-dark-muted leading-relaxed mb-6">
                {description}
              </p>
              <button className="inline-flex items-center gap-2 text-sm text-dark-silver hover:text-dark-text transition-colors group">
                {linkText}
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </div>

          {/* Right UI Card */}
          <div
            ref={rightCardRef}
            className="w-full lg:w-[34vw] max-w-md"
          >
            <div className="glass-card">{renderUICard()}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
