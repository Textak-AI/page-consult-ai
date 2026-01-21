import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';

interface IntelligenceGatedTabProps {
  tabName: string;
  unlockThreshold: number;
  currentScore: number;
  description: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ElementType;
  shortLabel: string;
  showSoonLabel?: boolean;
}

const TAB_DESCRIPTIONS: Record<string, { threshold: number; description: string }> = {
  'content-editor': {
    threshold: 25,
    description: 'Edit headlines, copy, and CTAs with AI-powered suggestions based on your strategy.',
  },
  'style-editor': {
    threshold: 50,
    description: 'Customize colors, fonts, and visual hierarchy aligned with your brand positioning.',
  },
  'advanced-settings': {
    threshold: 75,
    description: 'Fine-tune form fields, tracking pixels, and conversion optimization features.',
  },
  'analytics': {
    threshold: 100,
    description: 'View visitor behavior, conversion rates, and A/B test results for your pages.',
  },
  'export': {
    threshold: 50,
    description: 'Download HTML, integrate with CMS platforms, or publish to custom domains.',
  },
  'personas': {
    threshold: 60,
    description: 'Access detailed buyer personas based on your target market research.',
  },
};

export function IntelligenceGatedTab({
  tabName,
  unlockThreshold,
  currentScore,
  description,
  isActive,
  onClick,
  icon: Icon,
  shortLabel,
  showSoonLabel = false,
}: IntelligenceGatedTabProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tabRef = useRef<HTMLDivElement>(null);

  const isUnlocked = currentScore >= unlockThreshold;
  const progressPercent = Math.min(100, (currentScore / unlockThreshold) * 100);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (!isUnlocked && !isMobile) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setShowTooltip(false);
    }
  };

  const handleTap = () => {
    if (!isUnlocked && isMobile) {
      setShowTooltip(true);
      // Auto-dismiss after 3 seconds on mobile
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setShowTooltip(false), 3000);
    } else if (isUnlocked) {
      onClick();
    }
  };

  const handleClick = () => {
    if (isMobile) {
      handleTap();
    } else if (isUnlocked) {
      onClick();
    }
  };

  return (
    <div
      ref={tabRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tab Button */}
      <div
        onClick={handleClick}
        role="button"
        tabIndex={isUnlocked ? 0 : -1}
        aria-label={
          isUnlocked
            ? shortLabel
            : `Locked. Requires ${unlockThreshold} intelligence points to unlock`
        }
        aria-disabled={!isUnlocked}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
          transition-all duration-200 whitespace-nowrap flex-shrink-0
          ${isUnlocked
            ? isActive
              ? 'bg-slate-700 text-white cursor-pointer'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 cursor-pointer'
            : 'text-slate-600 cursor-not-allowed'
          }
        `}
      >
        <Icon className="w-4 h-4" />
        <span className="hidden sm:inline">{shortLabel}</span>
        {!isUnlocked && showSoonLabel && (
          <span className="text-[10px] uppercase tracking-wide text-slate-700">Soon</span>
        )}
        {!isUnlocked && !showSoonLabel && (
          <Lock className="w-3 h-3 text-slate-600" />
        )}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && !isUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50"
            style={{ maxWidth: '220px' }}
          >
            {/* Arrow pointer */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-slate-800/95 border-l border-t border-cyan-500/30" />
            
            {/* Tooltip content */}
            <div className="relative bg-slate-800/95 backdrop-blur-md border border-cyan-500/30 rounded-lg p-3 shadow-xl shadow-black/30">
              {/* Gradient border glow effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 pointer-events-none" />
              
              {/* Content */}
              <div className="relative space-y-2">
                {/* Header with lock */}
                <div className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs font-medium text-cyan-400">
                    Unlocks at {unlockThreshold} pts
                  </span>
                </div>
                
                {/* Description */}
                <p className="text-xs text-white/90 leading-relaxed">
                  {description}
                </p>
                
                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">Current progress</span>
                    <span className="text-cyan-400 font-medium">{currentScore}/{unlockThreshold}</span>
                  </div>
                  <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper to get tab config
export function getTabConfig(tabId: string) {
  return TAB_DESCRIPTIONS[tabId] || { threshold: 50, description: 'Feature coming soon.' };
}

export default IntelligenceGatedTab;
