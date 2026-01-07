import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Users, Target, ArrowRight, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { z } from 'zod';

const emailSchema = z.string().trim().email({ message: "Please enter a valid email" });

interface EmailGateModalProps {
  isOpen: boolean;
  onSubmit: (email: string) => Promise<void>;
  onContinueWithoutEmail: () => void;
  industry?: string | null;
  audience?: string | null;
}

export default function EmailGateModal({ 
  isOpen, 
  onSubmit, 
  onContinueWithoutEmail,
  industry,
  audience 
}: EmailGateModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle ESC key - continues without email (activates focus mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onContinueWithoutEmail();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onContinueWithoutEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(result.data);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate personalized teaser based on extracted intelligence
  const getTeaser = () => {
    if (industry && audience) {
      return `Enter your email to get detailed insights on the ${industry} market and ${audience} buyer patterns.`;
    }
    if (industry) {
      return `Enter your email to get detailed insights on the ${industry} market and buyer patterns.`;
    }
    return "Enter your email to unlock detailed insights on your market and ideal buyers.";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onContinueWithoutEmail}
        >
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, delay: 0.05 }}
            className="relative w-full max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/10">
              {/* Header with gradient */}
              <div className="bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-slate-900 p-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <button 
                    onClick={onContinueWithoutEmail}
                    className="text-slate-400 hover:text-white transition-colors p-1"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Unlock Your Market Research
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {getTeaser()}
                </p>
              </div>

              {/* What they'll get */}
              <div className="px-6 py-4 space-y-3 border-b border-slate-700/50">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  What you'll unlock:
                </p>
                <div className="space-y-2">
                  {[
                    { icon: TrendingUp, text: 'Market size & opportunity analysis' },
                    { icon: Users, text: 'Detailed buyer persona insights' },
                    { icon: Target, text: 'Common objections & how to handle them' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-cyan-400" />
                      </div>
                      <span className="text-sm text-slate-300">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Email form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                    className="bg-slate-800 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500 h-12"
                  />
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm"
                    >
                      {error}
                    </motion.p>
                  )}
                </div>

                {/* Primary CTA */}
                <Button
                  type="submit"
                  disabled={isSubmitting || !email.trim()}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white h-12 text-base font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Unlocking insights...
                    </>
                  ) : (
                    <>
                      Unlock My Market Research
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                {/* Secondary CTA - ghost button */}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onContinueWithoutEmail}
                  className="w-full text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 h-10 text-sm font-normal"
                >
                  Continue Without Research
                </Button>

                <p className="text-xs text-slate-500 text-center">
                  No spam. Just strategy insights for your business.
                </p>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
