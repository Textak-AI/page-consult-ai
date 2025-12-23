import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, RefreshCw, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateHeroImages, regenerateHeroImages, HeroImage } from '@/lib/heroImages';
import { toast } from 'sonner';

interface HeroBackgroundCarouselProps {
  industry: string;
  subcategory?: string;
  onSelect: (imageUrl: string) => void;
  selectedImage?: string;
  className?: string;
}

export function HeroBackgroundCarousel({
  industry,
  subcategory,
  onSelect,
  selectedImage,
  className = '',
}: HeroBackgroundCarouselProps) {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch images when industry changes
  useEffect(() => {
    if (industry) {
      fetchImages();
    }
  }, [industry, subcategory]);

  // Auto-rotate carousel
  useEffect(() => {
    if (images.length > 1 && !isPaused && !isLocked) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 4500);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [images.length, isPaused, isLocked]);

  const fetchImages = async () => {
    if (!industry) return;
    
    setIsLoading(true);
    try {
      const result = await generateHeroImages(industry, subcategory, 4);
      setImages(result.images);
      setCurrentIndex(0);
      
      if (result.fromCache) {
        console.log('Loaded hero images from cache');
      }
    } catch (error) {
      console.error('Failed to fetch hero images:', error);
      toast.error('Failed to load hero images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!industry) return;
    
    setIsRegenerating(true);
    setIsLocked(false);
    try {
      const result = await regenerateHeroImages(industry, subcategory, 4);
      setImages(result.images);
      setCurrentIndex(0);
      toast.success('Generated new hero images');
    } catch (error) {
      console.error('Failed to regenerate hero images:', error);
      toast.error('Failed to generate new images');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSelect = () => {
    if (images[currentIndex]) {
      console.log('🖼️ [HeroBackgroundCarousel] Image selected:', images[currentIndex].url);
      onSelect(images[currentIndex].url);
      setIsLocked(true);
    }
  };

  const handleChange = () => {
    setIsLocked(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    if (!isLocked) {
      setIsPaused(true);
      // Resume after 10 seconds of inactivity
      setTimeout(() => setIsPaused(false), 10000);
    }
  };

  if (isLoading) {
    return (
      <div className={`relative rounded-xl overflow-hidden bg-slate-900/50 ${className}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm text-slate-400">Generating hero backgrounds...</p>
        </div>
        <div className="aspect-video" />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className={`relative rounded-xl overflow-hidden bg-slate-900/50 border border-slate-800 ${className}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <ImageIcon className="w-10 h-10 text-slate-600" />
          <p className="text-sm text-slate-500">Select an industry to generate hero backgrounds</p>
        </div>
        <div className="aspect-video" />
      </div>
    );
  }

  return (
    <div 
      className={`relative rounded-xl overflow-hidden ${className}`}
      onMouseEnter={() => {
        setIsHovered(true);
        if (!isLocked) setIsPaused(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!isLocked) setIsPaused(false);
      }}
    >
      {/* Images */}
      <div className="relative aspect-video">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]?.url}
            alt={`Hero background option ${currentIndex + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>

        {/* Gradient overlay for better visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        {/* Hover/Selected overlay */}
        <AnimatePresence>
          {(isHovered || isLocked) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {isLocked ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 bg-emerald-500/90 text-white px-4 py-2 rounded-full">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Selected</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleChange}
                    className="bg-black/50 border-white/20 text-white hover:bg-white/20"
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleSelect}
                  className="bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg"
                >
                  Use This Background
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected badge (always visible when locked) */}
        {isLocked && selectedImage === images[currentIndex]?.url && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
            <Check className="w-3 h-3" />
            Selected
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Regenerate button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="bg-black/50 border-white/20 text-white hover:bg-white/20"
        >
          {isRegenerating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          New Options
        </Button>
      </div>
    </div>
  );
}
