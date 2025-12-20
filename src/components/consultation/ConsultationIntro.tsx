/**
 * Consultation Intro - Step 0 explainer carousel
 * Shows before the consultation questionnaire begins
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Search, FileText, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';

const INTRO_STORAGE_KEY = 'pageconsult_intro_seen';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const slides = [
  {
    icon: ClipboardList,
    headline: "6 Strategic Questions",
    subtext: "We ask what matters for conversion — not busywork.",
  },
  {
    icon: Search,
    headline: "AI Analyzes Your Market",
    subtext: "Real research on your audience, not generic templates.",
  },
  {
    icon: FileText,
    headline: "Strategy Brief Generated",
    subtext: "A 10-section strategic foundation for your page.",
  },
  {
    icon: Layout,
    headline: "Page Built From Strategy",
    subtext: "Every headline, feature, and CTA speaks to your audience.",
  },
];

interface ConsultationIntroProps {
  onComplete: () => void;
}

export function ConsultationIntro({ onComplete }: ConsultationIntroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handleComplete = useCallback(() => {
    localStorage.setItem(INTRO_STORAGE_KEY, Date.now().toString());
    onComplete();
  }, [onComplete]);

  // Auto-advance slides
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Handle dot click
  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
    setIsPaused(true);
    // Resume auto-advance after 8 seconds
    setTimeout(() => setIsPaused(false), 8000);
  };

  const CurrentIcon = slides[currentSlide].icon;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-8 max-w-lg w-full"
      >
        {/* Carousel */}
        <div className="text-center min-h-[180px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <CurrentIcon className="w-12 h-12 text-cyan-400 mb-4" />
              <h2 className="text-xl font-semibold text-white">
                {slides[currentSlide].headline}
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                {slides[currentSlide].subtext}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentSlide ? 'bg-cyan-400' : 'bg-slate-600'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Time estimate */}
        <p className="text-slate-400 text-sm text-center mt-6">
          Takes 3-5 minutes
        </p>

        {/* Buttons */}
        <div className="flex flex-col items-center gap-3 mt-6">
          <Button
            onClick={handleComplete}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white"
          >
            Start Strategy Session →
          </Button>
          <button
            onClick={handleComplete}
            className="text-slate-300 text-sm underline hover:text-white transition-colors"
          >
            Skip intro
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Check if we should show the intro
 * Returns true if intro should be shown (never seen or seen > 7 days ago)
 */
export function shouldShowIntro(): boolean {
  const lastSeen = localStorage.getItem(INTRO_STORAGE_KEY);
  if (!lastSeen) return true;
  
  const lastSeenTime = parseInt(lastSeen, 10);
  if (isNaN(lastSeenTime)) return true;
  
  return Date.now() - lastSeenTime > SEVEN_DAYS_MS;
}

export default ConsultationIntro;
