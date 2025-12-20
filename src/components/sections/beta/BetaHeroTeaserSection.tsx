import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight, Users, Calendar, Loader2 } from "lucide-react";

interface BetaHeroTeaserSectionProps {
  content: {
    headline: string;
    subheadline: string;
    ctaText?: string;
    launchTimeline?: string;
    signupCount?: number;
    logoUrl?: string | null;
    primaryColor?: string;
  };
  onUpdate?: (content: any) => void;
  onEmailSubmit?: (email: string) => Promise<void>;
  isEditing?: boolean;
}

export function BetaHeroTeaserSection({ 
  content, 
  onUpdate, 
  onEmailSubmit,
  isEditing 
}: BetaHeroTeaserSectionProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (onEmailSubmit) {
        await onEmailSubmit(email);
      }
      setIsSuccess(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    if (onUpdate) {
      onUpdate({
        ...content,
        [field]: e.currentTarget.textContent || content[field as keyof typeof content],
      });
    }
  };

  return (
    <section 
      className="min-h-screen flex items-center relative overflow-hidden"
      style={{ backgroundColor: 'hsl(217, 33%, 6%)' }}
    >
      {/* Premium Background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(at 40% 20%, hsla(189, 95%, 43%, 0.15) 0px, transparent 50%),
              radial-gradient(at 80% 0%, hsla(270, 95%, 60%, 0.12) 0px, transparent 50%),
              radial-gradient(at 0% 50%, hsla(189, 95%, 43%, 0.08) 0px, transparent 50%),
              radial-gradient(at 100% 100%, hsla(270, 95%, 60%, 0.08) 0px, transparent 50%)
            `,
          }}
        />
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        
        {/* Floating Orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] animate-float-slow"
          style={{ backgroundColor: 'hsla(189, 95%, 43%, 0.08)' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] animate-float-delayed"
          style={{ backgroundColor: 'hsla(270, 95%, 60%, 0.06)' }}
        />
      </div>

      {isEditing && (
        <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg pointer-events-none z-20" />
      )}

      {/* Content */}
      <div className="container mx-auto max-w-5xl text-center relative z-10 px-6 py-32">
        <div className="flex flex-col items-center gap-8">
          
          {/* Logo */}
          {content.logoUrl && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src={content.logoUrl} 
                alt="Company logo" 
                className="h-12 md:h-16 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </motion.div>
          )}

          {/* Launch Timeline Badge */}
          {content.launchTimeline && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm"
            >
              <Calendar className="w-4 h-4 text-purple-400" strokeWidth={1.5} />
              <span className="text-sm font-medium text-purple-400 tracking-wide">
                {content.launchTimeline}
              </span>
            </motion.div>
          )}

          {/* Mystery Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-bold tracking-tight leading-[1.1] max-w-4xl ${
              isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""
            }`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur("headline", e)}
            style={{ color: 'white', textShadow: '0 4px 40px hsla(0, 0%, 0%, 0.5)' }}
          >
            {content.headline}
          </motion.h1>
          
          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className={`text-lg md:text-xl lg:text-2xl max-w-2xl leading-relaxed ${
              isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""
            }`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur("subheadline", e)}
            style={{ color: 'hsl(215, 20%, 65%)' }}
          >
            {content.subheadline}
          </motion.p>

          {/* Email Capture Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="w-full max-w-md pt-4"
          >
            {isSuccess ? (
              <div className="text-center p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <p className="text-lg font-medium text-white mb-2">You're on the list!</p>
                <p className="text-sm text-slate-400">We'll notify you when we launch.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 px-5 text-base bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                    disabled={isSubmitting}
                  />
                  {error && <p className="text-sm text-red-400 mt-2 text-left">{error}</p>}
                </div>
                <Button 
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="h-14 px-8 text-base font-semibold transition-all duration-300 hover:scale-[1.02] group"
                  style={{
                    background: 'linear-gradient(135deg, hsl(189, 95%, 43%), hsl(200, 95%, 50%))',
                    color: 'white',
                    boxShadow: '0 0 30px hsla(189, 95%, 43%, 0.3)',
                    borderRadius: '12px',
                  }}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {content.ctaText || "Join Waitlist"}
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </motion.div>

          {/* Social Proof */}
          {content.signupCount && content.signupCount > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex items-center gap-2 text-sm text-slate-400"
            >
              <Users className="w-4 h-4 text-cyan-400" strokeWidth={1.5} />
              <span>
                Join <span className="text-white font-medium">{content.signupCount.toLocaleString()}</span> others waiting
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
