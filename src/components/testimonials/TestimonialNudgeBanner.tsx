import { motion } from 'framer-motion';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TestimonialNudgeBannerProps {
  powerLevel: number;
  testimonialCount: number;
  onGetTestimonials: () => void;
}

export function TestimonialNudgeBanner({ 
  powerLevel, 
  testimonialCount,
  onGetTestimonials 
}: TestimonialNudgeBannerProps) {
  // Only show if no testimonials and power level is above 70
  if (testimonialCount > 0 || powerLevel < 70) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-purple-500/10 border border-purple-500/20 rounded-xl p-4"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-white">
              Boost your conversions with social proof
            </h4>
            <p className="text-xs text-slate-400">
              Pages with testimonials convert 34% better on average
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={onGetTestimonials}
          className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white shrink-0"
        >
          Help Me Get Testimonials
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}

// Nudge configurations for different contexts
export interface NudgeConfig {
  type: 'in-app' | 'email' | 'both';
  message: string;
  triggerCondition: string;
}

export const TESTIMONIAL_NUDGES: NudgeConfig[] = [
  {
    type: 'in-app',
    message: "Your page is at 85% Power Level! Adding just one testimonial could push you to Legendary status. 🏆",
    triggerCondition: 'power_level >= 80 && testimonials_count === 0'
  },
  {
    type: 'in-app',
    message: "Pages with testimonials convert 34% better. We can help you get them — click here.",
    triggerCondition: 'page_published && testimonials_count === 0 && days_since_publish >= 3'
  },
  {
    type: 'in-app',
    message: "Quick win: Add a testimonial in the next 24 hours and get a bonus 5 Power Level points!",
    triggerCondition: 'first_week_user && testimonials_count === 0'
  },
  {
    type: 'email',
    message: "Your landing page is live! Here's how to supercharge it with social proof...",
    triggerCondition: 'page_published && days_since_publish === 7 && testimonials_count === 0'
  }
];
