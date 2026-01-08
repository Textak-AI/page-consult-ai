import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Globe, 
  Mail, 
  Building2, 
  ArrowRight, 
  Loader2, 
  X,
  Check,
  Gift,
  Search,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { z } from 'zod';

const emailSchema = z.string().trim().email({ message: "Please enter a valid email" });
const urlSchema = z.string().trim().url({ message: "Please enter a valid URL" }).or(z.string().trim().min(3));

export interface BusinessCardData {
  companyName: string;
  website: string;
  email: string;
}

interface BusinessCardGateModalProps {
  isOpen: boolean;
  onSubmit: (data: BusinessCardData) => Promise<void>;
  onContinueWithoutResearch: () => void;
  industry?: string | null;
}

export default function BusinessCardGateModal({ 
  isOpen, 
  onSubmit, 
  onContinueWithoutResearch,
  industry,
}: BusinessCardGateModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ company?: string; website?: string; email?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onContinueWithoutResearch();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onContinueWithoutResearch]);

  // Normalize website URL
  const normalizeWebsite = (url: string): string => {
    let normalized = url.trim();
    if (normalized && !normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }
    return normalized;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};

    // Validate company name
    if (!companyName.trim() || companyName.trim().length < 2) {
      newErrors.company = 'Company name is required';
    }

    // Validate website
    const normalizedWebsite = normalizeWebsite(website);
    try {
      new URL(normalizedWebsite);
    } catch {
      newErrors.website = 'Please enter a valid website URL';
    }

    // Validate email
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        companyName: companyName.trim(),
        website: normalizedWebsite,
        email: email.trim(),
      });
    } catch (err) {
      setErrors({ email: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = companyName.trim().length >= 2 && 
                  website.trim().length >= 3 && 
                  email.trim().includes('@');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onContinueWithoutResearch}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, delay: 0.05 }}
            className="relative w-full max-w-lg mx-auto"
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
                    onClick={onContinueWithoutResearch}
                    className="text-slate-400 hover:text-white transition-colors p-1"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Unlock Personalized Strategy
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Share your business card and I'll research your specific market position.
                </p>
              </div>

              {/* Value stack */}
              <div className="px-6 py-4 space-y-2.5 border-b border-slate-700/50">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  What you'll get:
                </p>
                <div className="space-y-2">
                  {[
                    { icon: Search, text: 'Company-specific market research' },
                    { icon: Palette, text: 'Your logo auto-imported' },
                    { icon: Gift, text: '50% off Founders pricing', highlight: true },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        item.highlight 
                          ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20' 
                          : 'bg-cyan-500/10'
                      }`}>
                        <item.icon className={`w-4 h-4 ${
                          item.highlight ? 'text-amber-400' : 'text-cyan-400'
                        }`} />
                      </div>
                      <span className={`text-sm ${
                        item.highlight ? 'text-amber-300 font-medium' : 'text-slate-300'
                      }`}>
                        {item.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    Company Name *
                  </label>
                  <Input
                    type="text"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      setErrors(prev => ({ ...prev, company: undefined }));
                    }}
                    placeholder="e.g., Acme Security Solutions"
                    disabled={isSubmitting}
                    className="bg-slate-800 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500 h-11"
                  />
                  {errors.company && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm"
                    >
                      {errors.company}
                    </motion.p>
                  )}
                </div>

                {/* Website */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    Website *
                  </label>
                  <Input
                    type="text"
                    value={website}
                    onChange={(e) => {
                      setWebsite(e.target.value);
                      setErrors(prev => ({ ...prev, website: undefined }));
                    }}
                    placeholder="e.g., acmesecurity.com"
                    disabled={isSubmitting}
                    className="bg-slate-800 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500 h-11"
                  />
                  {errors.website && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm"
                    >
                      {errors.website}
                    </motion.p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    Work Email *
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors(prev => ({ ...prev, email: undefined }));
                    }}
                    placeholder="e.g., you@acmesecurity.com"
                    disabled={isSubmitting}
                    className="bg-slate-800 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500 h-11"
                  />
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                <p className="text-xs text-slate-500">
                  We'll research publicly available information to personalize your strategy. 
                  Your email unlocks Founders pricing. No spam, ever.
                </p>

                {/* Primary CTA */}
                <Button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white h-12 text-base font-medium shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Researching your business...
                    </>
                  ) : (
                    <>
                      Unlock Personalized Research
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                {/* Secondary CTA */}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onContinueWithoutResearch}
                  className="w-full text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 h-10 text-sm font-normal"
                >
                  Continue Without Research
                </Button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
