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
  Search,
  Palette,
  Crown
} from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().trim().email({ message: "Please enter a valid email" });

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

  const benefits = [
    { icon: Search, text: 'Company-specific market research', color: 'from-cyan-500/20 to-cyan-600/10', iconColor: 'text-cyan-400' },
    { icon: Palette, text: 'Your logo auto-imported', color: 'from-purple-500/20 to-purple-600/10', iconColor: 'text-purple-400' },
    { icon: Crown, text: 'Early access to Founders Tier', color: 'from-amber-500/20 to-amber-600/10', iconColor: 'text-amber-400' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onContinueWithoutResearch}
        >
          {/* Backdrop with deeper blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, delay: 0.05 }}
            className="relative w-full max-w-lg mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Premium glass container */}
            <div 
              className="relative overflow-hidden rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(124, 58, 237, 0.2)',
                boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 100px rgba(124, 58, 237, 0.1)',
              }}
            >
              {/* Ambient glow effect */}
              <div 
                className="absolute -top-32 -right-32 w-64 h-64 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                }}
              />
              
              {/* Close button - refined */}
              <button 
                onClick={onContinueWithoutResearch}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative p-8">
                {/* Header Icon - Premium floating badge */}
                <div className="relative w-16 h-16 mb-6">
                  {/* Blur halo */}
                  <div 
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(6, 182, 212, 0.4) 100%)',
                      filter: 'blur(12px)',
                    }}
                  />
                  {/* Icon container */}
                  <div 
                    className="relative w-full h-full rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
                      boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                </div>

                {/* Title - Premium typography */}
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                  Unlock Personalized Strategy
                </h2>
                <p className="text-slate-400 text-base leading-relaxed mb-8">
                  Share your business card and I'll research your specific market position.
                </p>

                {/* Benefits - Premium cards */}
                <div className="space-y-3 mb-8">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.08 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30"
                    >
                      <div 
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${benefit.color}`}
                      >
                        <benefit.icon className={`w-4 h-4 ${benefit.iconColor}`} />
                      </div>
                      <span className="text-sm text-slate-200 font-medium">
                        {benefit.text}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Form - Refined inputs */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5" />
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => {
                        setCompanyName(e.target.value);
                        setErrors(prev => ({ ...prev, company: undefined }));
                      }}
                      placeholder="e.g., Acme Security Solutions"
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all disabled:opacity-50"
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
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5" />
                      Website
                    </label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => {
                        setWebsite(e.target.value);
                        setErrors(prev => ({ ...prev, website: undefined }));
                      }}
                      placeholder="e.g., acmesecurity.com"
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all disabled:opacity-50"
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
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      Work Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors(prev => ({ ...prev, email: undefined }));
                      }}
                      placeholder="e.g., you@acmesecurity.com"
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all disabled:opacity-50"
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

                  {/* Trust line - Softer approach */}
                  <p className="text-xs text-slate-500 leading-relaxed">
                    We'll research publicly available information to personalize your strategy.
                    <br />
                    <span className="text-slate-400">Your email unlocks Founders pricing. No spam, ever.</span>
                  </p>

                  {/* Primary CTA - Premium button with real shadow physics */}
                  <motion.button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: isValid && !isSubmitting 
                        ? 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)' 
                        : 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
                      boxShadow: isValid && !isSubmitting 
                        ? '0 4px 12px rgba(139, 92, 246, 0.3)' 
                        : 'none',
                    }}
                    whileHover={isValid && !isSubmitting ? { 
                      y: -4,
                      boxShadow: '0 10px 28px -4px rgba(139, 92, 246, 0.4)',
                    } : {}}
                    whileTap={isValid && !isSubmitting ? { 
                      y: 2,
                      boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2)',
                    } : {}}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Researching your business...
                      </>
                    ) : (
                      <>
                        Unlock Personalized Research
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>

                  {/* Secondary CTA - Subtle skip option */}
                  <button
                    type="button"
                    onClick={onContinueWithoutResearch}
                    className="w-full py-2.5 text-sm text-slate-500 hover:text-slate-300 transition-colors duration-200"
                  >
                    Continue Without Research
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
