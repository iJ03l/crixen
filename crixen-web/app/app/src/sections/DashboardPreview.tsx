import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  LayoutDashboard,
  Settings,
  BarChart3,
  Users,
  Bell,
  Search,
  Instagram,
  Twitter,
  Linkedin,
  MoreHorizontal,
  Check,
  FileText,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const DashboardPreview = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

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
        dashboardRef.current,
        { y: '100vh', opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, ease: 'none' },
        0
      );

      scrollTl.fromTo(
        bgRef.current,
        { scale: 1.06, opacity: 0.7 },
        { scale: 1, opacity: 1, ease: 'none' },
        0
      );

      // Stats cards stagger
      const statCards = statsRef.current?.querySelectorAll('.stat-card');
      if (statCards) {
        scrollTl.fromTo(
          statCards,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, ease: 'none' },
          0.12
        );
      }

      // SETTLE (30-70%): Static

      // EXIT (70-100%)
      scrollTl.fromTo(
        dashboardRef.current,
        { y: 0, opacity: 1, scale: 1 },
        { y: '-35vh', opacity: 0, scale: 0.98, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        bgRef.current,
        { scale: 1, opacity: 1 },
        { scale: 1.03, opacity: 0.85, ease: 'power2.in' },
        0.7
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: FileText, label: 'Strategy', active: false },
    { icon: BarChart3, label: 'Analytics', active: false },
    { icon: Users, label: 'Accounts', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  const stats = [
    { label: 'Replies sent', value: '12,402', change: '+23%' },
    { label: 'Time saved', value: '42h', change: 'this month' },
    { label: 'Avg response time', value: '1m 12s', change: '-45%' },
  ];

  const recentReplies = [
    {
      platform: 'Instagram',
      icon: Instagram,
      user: '@creative.mia',
      comment: 'Love your recent work!',
      reply: 'Thank you so much! Means a lot coming from you.',
      status: 'sent',
    },
    {
      platform: 'X',
      icon: Twitter,
      user: '@techdaily',
      comment: 'When is the next update?',
      reply: 'Soon! We\'re putting the final touches on it.',
      status: 'pending',
    },
    {
      platform: 'LinkedIn',
      icon: Linkedin,
      user: 'Sarah Johnson',
      comment: 'Great insights on the industry trend.',
      reply: 'Appreciate it, Sarah! Happy to share.',
      status: 'sent',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="section-pinned bg-dark-bg flex items-center justify-center"
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/dashboard_bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-dark-bg/70" />
      </div>

      {/* Dashboard Card */}
      <div
        ref={dashboardRef}
        className="relative z-10 w-[90vw] lg:w-[84vw] max-w-[1100px]"
      >
        <div className="glass-card overflow-hidden">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-4">
              <span className="font-heading font-bold text-lg text-dark-text">
                Crixen
              </span>
              <nav className="hidden lg:flex items-center gap-1">
                {['Activity', 'Strategy', 'Analytics', 'Settings'].map(
                  (item, i) => (
                    <button
                      key={item}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${i === 0
                        ? 'text-dark-text bg-white/[0.08]'
                        : 'text-dark-muted hover:text-dark-text'
                        }`}
                    >
                      {item}
                    </button>
                  )
                )}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors">
                <Search size={18} className="text-dark-muted" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors relative">
                <Bell size={18} className="text-dark-muted" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-dark-silver rounded-full" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dark-silver/40 to-dark-silver/10 flex items-center justify-center">
                <span className="text-xs font-medium text-dark-text">JD</span>
              </div>
            </div>
          </div >

          {/* Dashboard Content */}
          <div className="flex">
            {/* Sidebar */}
            <div className="hidden lg:flex flex-col w-16 py-4 border-r border-white/[0.06]">
              {sidebarItems.map((item, i) => (
                <button
                  key={i}
                  className={`p-3 mx-2 rounded-xl transition-colors ${item.active
                    ? 'bg-white/[0.08] text-dark-text'
                    : 'text-dark-muted hover:text-dark-text hover:bg-white/[0.04]'
                    }`}
                  title={item.label}
                >
                  <item.icon size={20} />
                </button>
              ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 lg:p-6">
              <h2 className="font-heading font-semibold text-xl text-dark-text mb-4">
                Activity
              </h2>

              {/* Stats */}
              <div ref={statsRef} className="grid grid-cols-3 gap-3 lg:gap-4 mb-6">
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className="stat-card p-3 lg:p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                  >
                    <p className="font-heading font-bold text-xl lg:text-2xl text-dark-text mb-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-dark-muted mb-1">{stat.label}</p>
                    <span
                      className={`text-xs font-mono ${stat.change.startsWith('+')
                        ? 'text-green-400'
                        : stat.change.startsWith('-')
                          ? 'text-green-400'
                          : 'text-dark-muted'
                        }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                ))}
              </div>

              {/* Recent Replies Table */}
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/[0.05] text-xs font-mono text-dark-muted uppercase tracking-wider">
                  <div className="col-span-2 hidden lg:block">Platform</div>
                  <div className="col-span-3 lg:col-span-2">User</div>
                  <div className="col-span-4 lg:col-span-3">Comment</div>
                  <div className="col-span-4 lg:col-span-4">Reply</div>
                  <div className="col-span-1 text-right">Status</div>
                </div>
                {recentReplies.map((reply, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/[0.03] items-center hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="col-span-2 hidden lg:flex items-center gap-2">
                      <reply.icon size={16} className="text-dark-muted" />
                      <span className="text-sm text-dark-muted">
                        {reply.platform}
                      </span>
                    </div>
                    <div className="col-span-3 lg:col-span-2">
                      <span className="text-sm text-dark-text">
                        {reply.user}
                      </span>
                    </div>
                    <div className="col-span-4 lg:col-span-3">
                      <span className="text-sm text-dark-muted truncate block">
                        {reply.comment}
                      </span>
                    </div>
                    <div className="col-span-4 lg:col-span-4">
                      <span className="text-sm text-dark-text truncate block">
                        {reply.reply}
                      </span>
                    </div>
                    <div className="col-span-1 text-right">
                      {reply.status === 'sent' ? (
                        <Check size={16} className="text-green-400 inline" />
                      ) : (
                        <MoreHorizontal
                          size={16}
                          className="text-dark-muted inline"
                        />
                      )}
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

export default DashboardPreview;
