import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Users, TrendingUp, AlertTriangle, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PremiumCard } from '@/components/ui/PremiumCard';

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
  pageId?: string;
  content?: {
    totalSignups?: number;
    todaySignups?: number;
    spotsRemaining?: number | null;
    recentSignups?: Array<{ name: string; location?: string; timeAgo: string }>;
    showRecentSignups?: boolean;
  };
  showRecentSignups?: boolean;
  spotsRemaining?: number;
}

// Animated counter hook
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(countRef, { once: true });
  
  useEffect(() => {
    if (!isInView || end === 0) return;
    
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration, isInView]);
  
  return { count, ref: countRef };
}

export const WaitlistProofSection: React.FC<Props> = ({
  pageId,
  content,
  showRecentSignups: showRecentSignupsProp = true,
  spotsRemaining: spotsRemainingProp,
}) => {
  const [stats, setStats] = useState<Stats>({
    totalSignups: content?.totalSignups || 0,
    todaySignups: content?.todaySignups || 0,
    recentSignups: content?.recentSignups?.map(s => ({ name: s.name, location: s.location, time: s.timeAgo })) || [],
  });
  const [currentTickerIndex, setCurrentTickerIndex] = useState(0);

  const showRecentSignups = content?.showRecentSignups ?? showRecentSignupsProp;
  const spotsRemaining = content?.spotsRemaining ?? spotsRemainingProp;

  // Fetch stats only if pageId provided
  useEffect(() => {
    if (!pageId) return;

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

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [pageId]);

  // Rotate ticker
  useEffect(() => {
    if (stats.recentSignups.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentTickerIndex((prev) => (prev + 1) % stats.recentSignups.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stats.recentSignups.length]);

  const totalCounter = useCountUp(stats.totalSignups);
  const todayCounter = useCountUp(stats.todaySignups);
  const spotsCounter = useCountUp(spotsRemaining || 0);

  const statItems = [
    {
      icon: Users,
      value: totalCounter.count,
      ref: totalCounter.ref,
      label: 'Total Signups',
      color: 'cyan',
    },
    {
      icon: TrendingUp,
      value: todayCounter.count,
      ref: todayCounter.ref,
      label: 'Today',
      color: 'green',
    },
    ...(spotsRemaining !== undefined && spotsRemaining !== null ? [{
      icon: AlertTriangle,
      value: spotsCounter.count,
      ref: spotsCounter.ref,
      label: 'Spots Left',
      color: 'amber',
    }] : []),
  ];

  return (
    <section 
      className="relative overflow-hidden"
      style={{ 
        backgroundColor: 'hsl(217, 33%, 5%)',
        padding: '80px 24px',
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      
      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`grid gap-6 ${statItems.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} mb-8`}
        >
          {statItems.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <PremiumCard 
                key={i} 
                variant="glass" 
                className="text-center py-8"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                  stat.color === 'cyan' ? 'bg-cyan-500/10' :
                  stat.color === 'green' ? 'bg-emerald-500/10' :
                  'bg-amber-500/10'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    stat.color === 'cyan' ? 'text-cyan-400' :
                    stat.color === 'green' ? 'text-emerald-400' :
                    'text-amber-400'
                  }`} strokeWidth={1.5} />
                </div>
                
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  <span ref={stat.ref}>{stat.value.toLocaleString()}</span>
                </div>
                
                <p className="text-sm text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </p>
              </PremiumCard>
            );
          })}
        </motion.div>

        {/* Recent Signups Ticker */}
        {showRecentSignups && stats.recentSignups.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <PremiumCard variant="glass" className="py-4 px-6">
              <div className="flex items-center justify-center gap-3 text-sm min-h-[28px]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTickerIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-white font-medium">
                      {stats.recentSignups[currentTickerIndex]?.name}
                    </span>
                    {stats.recentSignups[currentTickerIndex]?.location && (
                      <>
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-500">
                          {stats.recentSignups[currentTickerIndex].location}
                        </span>
                      </>
                    )}
                    <span className="text-slate-500">
                      • {stats.recentSignups[currentTickerIndex]?.time}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </PremiumCard>
          </motion.div>
        )}
      </div>
    </section>
  );
};
