import { motion, AnimatePresence } from 'framer-motion';
import { useCompanion } from '@/contexts/CompanionContext';
import { CompanionHeader } from './CompanionHeader';
import { CompanionMessages } from './CompanionMessages';
import { CompanionInput } from './CompanionInput';
import { cn } from '@/lib/utils';

export function CompanionBar() {
  const { state } = useCompanion();

  return (
    <motion.div
      initial={false}
      animate={{ 
        height: state.isExpanded ? 'auto' : 56 
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 30 
      }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-slate-900/95 backdrop-blur-sm border-t border-slate-800",
        state.hasUnread && !state.isExpanded && "ring-1 ring-cyan-500/50"
      )}
    >
      <CompanionHeader isExpanded={state.isExpanded} />
      
      <AnimatePresence>
        {state.isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col h-[220px] sm:h-[50vh] md:h-[240px]"
          >
            <CompanionMessages />
            <CompanionInput />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
