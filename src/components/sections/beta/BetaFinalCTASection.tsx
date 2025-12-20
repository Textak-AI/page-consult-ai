import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Bell, Clock } from "lucide-react";

interface BetaFinalCTASectionProps {
  content: {
    headline?: string;
    subtext?: string;
    ctaText?: string;
    launchDate?: string;
    trustText?: string;
  };
  onUpdate?: (content: any) => void;
  onEmailSubmit?: (email: string) => Promise<void>;
  isEditing?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function BetaFinalCTASection({ 
  content, 
  onUpdate, 
  onEmailSubmit,
  isEditing 
}: BetaFinalCTASectionProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  const { 
    headline = "Be the First to Know",
    subtext = "Join our exclusive waitlist and get early access when we launch.",
    ctaText = "Join Waitlist",
    launchDate,
    trustText = "No spam, ever. Unsubscribe anytime."
  } = content;

  // Countdown timer
  useEffect(() => {
    if (!launchDate) return;
    
    const targetDate = new Date(launchDate).getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;
      
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [launchDate]);

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
      className="relative overflow-hidden"
      style={{ backgroundColor: 'hsl(217, 33%, 6%)', padding: '120px 24px' }}
    >
      {/* Dramatic Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, hsla(189, 95%, 43%, 0.15) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ backgroundColor: 'hsla(270, 95%, 60%, 0.08)' }}
        />
      </div>
      
      {isEditing && (
        <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg pointer-events-none z-10" />
      )}
      
      <div className="container mx-auto max-w-3xl text-center relative z-10 flex flex-col items-center gap-8">
        {/* Countdown Timer */}
        {timeLeft && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
              <Clock className="w-4 h-4 text-purple-400" strokeWidth={1.5} />
              <span className="text-sm font-medium text-purple-400">
                {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s until launch
              </span>
            </div>
          </motion.div>
        )}

        {/* Headline */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight max-w-3xl ${
            isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""
          }`}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleBlur("headline", e)}
        >
          {headline}
        </motion.h2>
        
        {/* Subtext */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed"
        >
          {subtext}
        </motion.p>

        {/* Email Capture Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md pt-4"
        >
          {isSuccess ? (
            <div className="text-center p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <Bell className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
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
                className="h-14 px-8 text-base font-semibold transition-all duration-300 hover:scale-[1.02] group animate-pulse-glow"
                style={{
                  background: 'linear-gradient(135deg, hsl(189, 95%, 43%), hsl(200, 95%, 50%))',
                  color: 'white',
                  borderRadius: '12px',
                }}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {ctaText}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          )}
        </motion.div>

        {/* Trust Text */}
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-sm text-slate-500"
        >
          {trustText}
        </motion.p>
      </div>
    </section>
  );
}
