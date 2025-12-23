import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, RefreshCw, Loader2, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AmbientHeroBackgroundProps {
  images: string[];
  isLocked: boolean;
  lockedIndex: number;
  currentIndex: number;
  isGenerating: boolean;
  onSelect: () => void;
  onRegenerate: () => void;
  onUnlock: () => void;
  onDotClick: (index: number) => void;
}

export function AmbientHeroBackground({ 
  images, 
  isLocked, 
  lockedIndex,
  currentIndex,
  isGenerating,
  onSelect,
  onRegenerate,
  onUnlock,
  onDotClick
}: AmbientHeroBackgroundProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const displayIndex = isLocked ? lockedIndex : currentIndex;
  const hasImages = images.length > 0;

  return (
    <div 
      className="absolute inset-0 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Images with Ken Burns */}
      <AnimatePresence mode="wait">
        {images.map((url, index) => (
          index === displayIndex && (
            <motion.div
              key={`${url}-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3.5, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-subtle-zoom"
                style={{ 
                  backgroundImage: `url(${url})`,
                  backgroundPosition: 'center center'
                }}
              />
            </motion.div>
          )
        ))}
      </AnimatePresence>
      
      {/* Base gradient overlay (always visible) */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/90" />
      
      {/* Hover overlay - darkens on hover */}
      <motion.div 
        className="absolute inset-0 bg-slate-900/40 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: (isHovered && hasImages) ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Hover Controls - centered buttons */}
      <AnimatePresence>
        {hasImages && !isLocked && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 flex items-center justify-center gap-4 z-10"
          >
            <button
              onClick={onSelect}
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-full font-semibold text-sm hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
            >
              <Check className="w-4 h-4" />
              SELECT
            </button>
            
            <button
              onClick={onRegenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-full font-semibold text-sm hover:bg-white/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {isGenerating ? 'GENERATING...' : 'NEW OPTIONS'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Locked State - small badge + hover to change */}
      {isLocked && (
        <>
          {/* Locked badge (always visible) */}
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/90 backdrop-blur-sm rounded-full text-white text-xs font-medium">
              <Check className="w-3 h-3" />
              Background Locked
            </div>
          </div>
          
          {/* Change button on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 flex items-center justify-center z-10"
              >
                <button
                  onClick={onUnlock}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-full font-semibold text-sm hover:bg-white/30 transition-all hover:scale-105"
                >
                  <Unlock className="w-4 h-4" />
                  CHANGE BACKGROUND
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
      
      {/* Dot Indicators (bottom-left, always visible when images exist) */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-6 flex items-center gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => onDotClick(index)}
              disabled={isLocked}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === displayIndex 
                  ? "bg-white w-8" 
                  : "bg-white/40 hover:bg-white/60 w-2",
                isLocked && "cursor-not-allowed opacity-50"
              )}
            />
          ))}
        </div>
      )}
      
      {/* Loading state - before images arrive */}
      {!hasImages && isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3 text-white/80">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium">Generating backgrounds...</p>
          </div>
        </div>
      )}
    </div>
  );
}
