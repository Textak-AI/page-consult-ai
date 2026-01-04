import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export interface PersonalizedContent {
  company_name: string;
  industry: string;
  headline: string;
  subhead: string;
  cta_text: string;
}

interface PersonalizedHeroProps {
  content: PersonalizedContent;
  onReset: () => void;
  onStartConsultation: () => void;
  isNavigating?: boolean;
}

export function PersonalizedHero({ 
  content, 
  onReset, 
  onStartConsultation,
  isNavigating 
}: PersonalizedHeroProps) {
  // Derive display values with smart fallbacks
  const displayBadge = content.company_name || content.industry || 'Your Business';
  const displayHeadline = content.headline || 'Your Custom Landing Page Is Ready';
  const displaySubhead = content.subhead || 'AI-powered messaging tailored to convert your ideal customers.';
  const displayCta = content.cta_text || 'Build My Full Landing Page';
  
  return (
    <div className="relative">
      {/* Personalized badge */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mb-6"
      >
        <Badge className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 text-foreground px-4 py-2 text-sm font-medium">
          <Sparkles className="w-4 h-4 mr-2 text-secondary" />
          Personalized for {displayBadge}
        </Badge>
      </motion.div>

      {/* Personalized headline */}
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight antialiased mb-6 leading-[1.05]"
      >
        <span className="block">{displayHeadline}</span>
      </motion.h1>
      
      {/* Personalized subheadline */}
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8"
      >
        {displaySubhead}
      </motion.p>

      {/* Callout card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mb-8 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl"
      >
        <p className="text-secondary font-medium text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          This is YOUR personalized landing page preview
        </p>
        <p className="text-muted-foreground text-sm mt-1">
          See how we'd position your {content.industry || 'business'} to convert visitors into customers.
        </p>
      </motion.div>
      
      {/* CTA buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <Button 
          onClick={onStartConsultation}
          disabled={isNavigating}
          size="lg" 
          className="group/btn text-lg px-8 py-4 bg-gradient-to-r from-secondary to-primary hover:brightness-110 text-primary-foreground border-0 hover:scale-105 rounded-xl font-semibold transition-all duration-300"
        >
          <span className="relative z-10">{displayCta}</span>
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
        </Button>
        
        <Button 
          onClick={onReset}
          variant="outline" 
          size="lg" 
          className="text-lg px-8 py-4 bg-transparent border-2 border-border text-foreground hover:border-foreground/50 hover:bg-foreground/5 rounded-xl font-semibold transition-all duration-300"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Another Business
        </Button>
      </motion.div>
      
      {/* Credit card disclaimer */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="text-muted-foreground text-sm text-center sm:text-left"
      >
        No credit card required • Full page ready in 10 minutes
      </motion.p>
    </div>
  );
}
