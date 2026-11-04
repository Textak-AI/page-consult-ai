import { motion, AnimatePresence } from 'framer-motion';
import { Check, RefreshCw, Loader2, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HeroImage } from '@/lib/heroImages';

interface AmbientHeroBackgroundProps {
  images: HeroImage[];
  isLocked: boolean;
  lockedIndex: number;
  currentIndex: number;
  isGenerating: boolean;
  onSelect: () => void;
  onRegenerate: () => void;
  onUnlock: () => void;
  onDotClick: (index: number) => void;
}

/** Plain words for the photo picker. The chosen photo becomes the photo at the top of the owner's page (Generate reads heroBackgroundUrl). */
export const HERO_PICKER_UI = {
  title: 'Photo for the top of your page',
  browsing: 'These photos rotate behind the questions. Pick one to use as the main photo on your page, or skip it and choose later in the editor.',
  locked: 'This photo will be the main photo on your page. You can change it later in the editor.',
  use: 'Use this photo',
  more: 'Show different photos',
  generating: 'Making new photos…',
  change: 'Change',
  brand: 'With your logo',
  industry: 'Industry photo',
} as const;

export function AmbientHeroBackground({
  images,
  isLocked,
  lockedIndex,
  currentIndex,
  isGenerating,
  onSelect,
  onRegenerate,
  onUnlock,
  onDotClick,
}: AmbientHeroBackgroundProps) {
  const displayIndex = isLocked ? lockedIndex : currentIndex;
  const hasImages = images.length > 0;
  const currentImage = images[displayIndex];

  return (
    <>
      {/* Background photos: a true crossfade (both layers overlap), so there is no dark gap between photos. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <AnimatePresence initial={false}>
          {currentImage && (
            <motion.div
              key={`${currentImage.url}-${displayIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-subtle-zoom"
                style={{ backgroundImage: `url(${currentImage.url})`, backgroundPosition: 'center center' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/90" />
      </div>

      {/* Picker: its own panel in the corner, never under or over the wizard card. Hidden on small screens (photos can be picked in the editor). */}
      {(hasImages || isGenerating) && (
        <div className="hidden md:block fixed bottom-6 left-6 z-30 w-72 rounded-xl border border-white/15 bg-slate-900/85 backdrop-blur-md p-4 text-white shadow-xl">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ImageIcon className="w-4 h-4 text-cyan-300" />
            {HERO_PICKER_UI.title}
          </div>

          {!hasImages && isGenerating ? (
            <p className="mt-2 flex items-center gap-2 text-xs text-white/70">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {HERO_PICKER_UI.generating}
            </p>
          ) : (
            <>
              <p className="mt-1.5 text-xs leading-relaxed text-white/70">
                {isLocked ? HERO_PICKER_UI.locked : HERO_PICKER_UI.browsing}
              </p>

              <div className="mt-3 flex items-center justify-between">
                {images.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        type="button"
                        aria-label={`Show photo ${index + 1}`}
                        onClick={() => onDotClick(index)}
                        disabled={isLocked}
                        className={cn(
                          'h-2 rounded-full transition-all duration-300',
                          index === displayIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60',
                          image.type === 'brand' && index === displayIndex && 'bg-purple-400',
                          isLocked && 'cursor-not-allowed opacity-50'
                        )}
                      />
                    ))}
                  </div>
                )}
                {currentImage && (
                  <span className="text-[11px] text-white/60">
                    {currentImage.type === 'brand' ? HERO_PICKER_UI.brand : HERO_PICKER_UI.industry}
                  </span>
                )}
              </div>

              <div className={cn('mt-3 flex gap-2', !isLocked && 'flex-col')}>
                {isLocked ? (
                  <>
                    <span className="flex flex-1 items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-medium text-emerald-200">
                      <Check className="w-3.5 h-3.5" /> Chosen
                    </span>
                    <button
                      type="button"
                      onClick={onUnlock}
                      className="rounded-lg border border-white/25 px-3 py-2 text-xs font-medium hover:bg-white/10"
                    >
                      {HERO_PICKER_UI.change}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={onSelect}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-white/90"
                    >
                      <Check className="w-3.5 h-3.5" /> {HERO_PICKER_UI.use}
                    </button>
                    <button
                      type="button"
                      onClick={onRegenerate}
                      disabled={isGenerating}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/25 px-3 py-2 text-xs font-medium hover:bg-white/10 disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      {isGenerating ? HERO_PICKER_UI.generating : HERO_PICKER_UI.more}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
