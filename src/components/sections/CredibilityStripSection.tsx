import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, TrendingUp, Award } from 'lucide-react';

interface CredibilityStripProps {
  content: {
    stats?: Array<{
      value: string;
      label: string;
      icon?: string;
    }>;
  };
}

export function CredibilityStripSection({ content }: CredibilityStripProps) {
  const stats = content.stats || [];
  
  // Don't render if no stats
  if (stats.length === 0) return null;
  
  const getIcon = (iconName: string) => {
    const iconClass = "w-5 h-5 text-brand";
    switch (iconName) {
      case 'users': return <Users className={iconClass} />;
      case 'clock': return <Clock className={iconClass} />;
      case 'trending-up': return <TrendingUp className={iconClass} />;
      case 'award': return <Award className={iconClass} />;
      default: return <Award className={iconClass} />;
    }
  };

  return (
    <section className="relative py-8 bg-background/50 border-y border-border/30">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center">
                {getIcon(stat.icon || 'award')}
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-bold text-foreground">
                  {stat.value}
                </span>
                <span className="text-xs md:text-sm text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
