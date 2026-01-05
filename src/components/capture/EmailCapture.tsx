import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EmailCaptureProps {
  onSubmit: (email: string) => void;
  onSkip: () => void;
  isLoading?: boolean;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
}

export function EmailCapture({ 
  onSubmit, 
  onSkip, 
  isLoading,
  headline = "Your Strategy Brief is Ready",
  subheadline = "Where should we send a copy? You'll also get tips to make your page convert better.",
  ctaText = "Generate My Strategy Brief"
}: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      onSkip();
      return;
    }
    
    // Basic validation
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email');
      return;
    }
    
    onSubmit(email);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto text-center py-12 px-6"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.1 }}
        className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 
                   flex items-center justify-center border border-cyan-500/30"
      >
        <Sparkles className="w-8 h-8 text-cyan-400" />
      </motion.div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-white mb-3"
      >
        {headline}
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-slate-400 mb-8"
      >
        {subheadline}
      </motion.p>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <Input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            disabled={isLoading}
            className="pl-10 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500
                       focus:border-cyan-500 focus:ring-cyan-500/20"
          />
        </div>
        
        {error && (
          <p className="text-red-400 text-sm text-left">{error}</p>
        )}

        {/* Primary CTA */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700
                     text-white font-medium rounded-xl shadow-lg shadow-cyan-500/25"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              {ctaText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>

        {/* Skip option - de-emphasized */}
        <button
          type="button"
          onClick={onSkip}
          disabled={isLoading}
          className="text-sm text-slate-500 hover:text-slate-400 transition-colors disabled:opacity-50"
        >
          Skip for now
        </button>
      </motion.form>

      {/* Trust signals */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-slate-600 mt-6"
      >
        No spam. Unsubscribe anytime. Your data stays private.
      </motion.p>
    </motion.div>
  );
}

export default EmailCapture;
