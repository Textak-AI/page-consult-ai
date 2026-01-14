import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleBriefSectionProps {
  number: number;
  title: string;
  color: string;
  colorBg: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export function CollapsibleBriefSection({
  number,
  title,
  color,
  colorBg,
  children,
  defaultExpanded = true,
  className,
}: CollapsibleBriefSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  return (
    <div className={cn("mb-6", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 mb-3 group"
      >
        <div className="flex items-center gap-3">
          <span 
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
              colorBg,
              color
            )}
          >
            {number}
          </span>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400 group-hover:text-white transition-colors"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.span>
      </button>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
