import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Users, TrendingUp, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentSignup {
  name: string;
  location: string;
  time: string;
}

interface WaitlistProofContent {
  totalSignups: number;
  dailySignups: number;
  showRecentSignups: boolean;
  spotsLeft?: number;
}

interface Props {
  content: WaitlistProofContent;
  recentSignups?: RecentSignup[];
  styles?: {
    primaryColor?: string;
    headingFont?: string;
    bodyFont?: string;
  };
}

// Animated counter hook
function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!startOnView || !isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, isInView, startOnView]);

  return { count, ref };
}

export function WaitlistProofSection({ content, recentSignups = [], styles }: Props) {
  const [currentSignupIndex, setCurrentSignupIndex] = useState(0);
  const primaryColor = styles?.primaryColor || '#06b6d4';

  const { count: totalCount, ref: totalRef } = useCountUp(content.totalSignups);
  const { count: dailyCount, ref: dailyRef } = useCountUp(content.dailySignups, 1500);

  // Rotate through recent signups
  useEffect(() => {
    if (!content.showRecentSignups || recentSignups.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSignupIndex((prev) => (prev + 1) % recentSignups.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [content.showRecentSignups, recentSignups.length]);

  const stats = [
    {
      icon: Users,
      value: totalCount,
      label: 'On the waitlist',
      ref: totalRef,
    },
    {
      icon: TrendingUp,
      value: dailyCount,
      label: 'Joined today',
      ref: dailyRef,
    },
    ...(content.spotsLeft !== undefined
      ? [{
          icon: Clock,
          value: content.spotsLeft,
          label: 'Spots remaining',
          ref: null,
          urgent: content.spotsLeft < 100,
        }]
      : []),
  ];

  return (
    <section className="py-16 bg-slate-900/50">
      <div className="max-w-4xl mx-auto px-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  "text-center p-6 rounded-2xl border",
                  "bg-slate-800/50 border-slate-700"
                )}
              >
                <div 
                  className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">
                  <span ref={stat.ref as React.RefObject<HTMLSpanElement>}>
                    {stat.value.toLocaleString()}
                  </span>
                  {(stat as any).urgent && (
                    <span className="text-amber-400 animate-pulse">!</span>
                  )}
                </p>
                <p className="text-sm text-slate-400" style={{ fontFamily: styles?.bodyFont }}>
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Signups Ticker */}
        {content.showRecentSignups && recentSignups.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800/30 p-4"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Users className="w-4 h-4" style={{ color: primaryColor }} />
              </div>

              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSignupIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-white font-medium">
                      {recentSignups[currentSignupIndex].name}
                    </span>
                    <span className="text-slate-500">joined</span>
                    <span className="flex items-center gap-1 text-slate-400 text-sm">
                      <MapPin className="w-3 h-3" />
                      {recentSignups[currentSignupIndex].location}
                    </span>
                    <span className="text-slate-500 text-sm ml-auto">
                      {recentSignups[currentSignupIndex].time}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 mt-3">
              {recentSignups.slice(0, 5).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    index === currentSignupIndex % 5
                      ? "bg-cyan-400"
                      : "bg-slate-600"
                  )}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Live indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-400"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span>Live updates</span>
        </motion.div>
      </div>
    </section>
  );
}
