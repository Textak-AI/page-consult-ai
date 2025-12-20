import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Users, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RecentSignup {
  name: string;
  location?: string;
  time: string;
}

interface Stats {
  totalSignups: number;
  todaySignups: number;
  recentSignups: RecentSignup[];
}

interface Props {
  pageId: string;
  showRecentSignups?: boolean;
  spotsRemaining?: number;
}

// Animated counter component
const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration, isInView]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

export const WaitlistProofSection: React.FC<Props> = ({
  pageId,
  showRecentSignups = true,
  spotsRemaining,
}) => {
  const [stats, setStats] = useState<Stats>({
    totalSignups: 0,
    todaySignups: 0,
    recentSignups: [],
  });
  const [currentTickerIndex, setCurrentTickerIndex] = useState(0);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('beta-stats', {
        body: { pageId },
      });

      if (error) throw error;
      if (data.success !== false) {
        setStats({
          totalSignups: data.totalSignups || 0,
          todaySignups: data.todaySignups || 0,
          recentSignups: data.recentSignups || [],
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [pageId]);

  // Rotate ticker every 3 seconds
  useEffect(() => {
    if (stats.recentSignups.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentTickerIndex((prev) => (prev + 1) % stats.recentSignups.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [stats.recentSignups.length]);

  const statItems = [
    {
      icon: Users,
      value: stats.totalSignups,
      label: 'People Waiting',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      icon: TrendingUp,
      value: stats.todaySignups,
      label: 'Joined Today',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    ...(spotsRemaining !== undefined ? [{
      icon: Clock,
      value: spotsRemaining,
      label: 'Spots Left',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    }] : []),
  ];

  return (
    <section className="py-16 bg-slate-900">
      <div className="container mx-auto px-4">
        {/* Stats grid */}
        <div className={`grid gap-6 ${spotsRemaining !== undefined ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'} max-w-3xl mx-auto`}>
          {statItems.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700 p-6 text-center"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.bgColor} mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                <AnimatedCounter value={stat.value} />
              </div>
              <div className="text-sm text-slate-400 uppercase tracking-wide">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent signup ticker */}
        {showRecentSignups && stats.recentSignups.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex justify-center"
          >
            <div className="relative h-10 min-w-[280px] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTickerIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-sm text-slate-300">
                      <span className="text-white font-medium">
                        {stats.recentSignups[currentTickerIndex]?.name}
                      </span>
                      {stats.recentSignups[currentTickerIndex]?.location && (
                        <span className="text-slate-400">
                          {' '}from {stats.recentSignups[currentTickerIndex].location}
                        </span>
                      )}
                      <span className="text-slate-500">
                        {' '}• {stats.recentSignups[currentTickerIndex]?.time}
                      </span>
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
