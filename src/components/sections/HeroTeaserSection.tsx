import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Check, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface HeroTeaserContent {
  headline: string;
  subheadline: string;
  launchTiming: string;
  logoUrl?: string;
  ctaText: string;
  waitlistCount?: number;
}

interface Props {
  content: HeroTeaserContent;
  onEmailSubmit?: (email: string) => Promise<void>;
  styles?: {
    primaryColor?: string;
    headingFont?: string;
    bodyFont?: string;
  };
}

export function HeroTeaserSection({ content, onEmailSubmit, styles }: Props) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !onEmailSubmit) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onEmailSubmit(email);
      setIsSuccess(true);
      setEmail('');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const primaryColor = styles?.primaryColor || '#06b6d4';

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
          style={{ background: `radial-gradient(circle, ${primaryColor}, transparent 70%)` }}
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -80, 60, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          initial={{ top: '-20%', left: '-10%' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{ background: `radial-gradient(circle, #8b5cf6, transparent 70%)` }}
          animate={{
            x: [0, -80, 60, 0],
            y: [0, 100, -50, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          initial={{ bottom: '-10%', right: '-5%' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
          style={{ background: `radial-gradient(circle, #ec4899, transparent 70%)` }}
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 80, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          initial={{ top: '40%', right: '20%' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Logo */}
        {content.logoUrl && (
          <motion.img
            src={content.logoUrl}
            alt="Logo"
            className="h-12 mx-auto mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}

        {/* Launch Timing Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700 mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span 
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: primaryColor }}
            />
            <span 
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: primaryColor }}
            />
          </span>
          <span className="text-sm font-medium text-slate-300">
            {content.launchTiming}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
          style={{ fontFamily: styles?.headingFont }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {content.headline}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto"
          style={{ fontFamily: styles?.bodyFont }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {content.subheadline}
        </motion.p>

        {/* Email Form or Success State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {isSuccess ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Check className="w-8 h-8" style={{ color: primaryColor }} />
              </div>
              <p className="text-white font-medium text-lg">You're on the list!</p>
              <p className="text-slate-400 text-sm">We'll notify you when we launch.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-12 bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                disabled={isSubmitting || !email}
                className="h-12 px-6 font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    {content.ctaText}
                  </>
                )}
              </Button>
            </form>
          )}

          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}
        </motion.div>

        {/* Social Proof */}
        {content.waitlistCount && content.waitlistCount > 0 && !isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-6 flex items-center justify-center gap-2 text-slate-400"
          >
            <Users className="w-4 h-4" />
            <span className="text-sm">
              Join <span className="text-white font-medium">{content.waitlistCount.toLocaleString()}</span> others on the waitlist
            </span>
          </motion.div>
        )}
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
    </section>
  );
}
