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
  return (
    <div className="relative">
      {/* Personalized badge */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mb-6"
      >
        <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-white px-4 py-2 text-sm font-medium">
          <Sparkles className="w-4 h-4 mr-2 text-cyan-400" />
          Personalized for {content.company_name || content.industry}
        </Badge>
      </motion.div>

      {/* Personalized headline */}
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight antialiased mb-6 leading-[0.95]"
      >
        <span className="block">{content.headline}</span>
      </motion.h1>
      
      {/* Personalized subheadline */}
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8"
      >
        {content.subhead}
      </motion.p>

      {/* Callout card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mb-8 p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-xl"
      >
        <p className="text-cyan-400 font-medium text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          This is YOUR personalized landing page preview
        </p>
        <p className="text-gray-400 text-sm mt-1">
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
          className="group/btn text-lg px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white border-0 animate-pulse-glow hover:scale-105 rounded-xl font-semibold transition-all duration-300"
        >
          <span className="relative z-10">{content.cta_text || 'Build My Full Landing Page'}</span>
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
        </Button>
        
        <Button 
          onClick={onReset}
          variant="outline" 
          size="lg" 
          className="text-lg px-8 py-4 bg-transparent border-2 border-white/30 text-white hover:border-white/50 hover:bg-white/5 rounded-xl font-semibold transition-all duration-300"
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
        className="text-gray-500 text-sm text-center sm:text-left"
      >
        No credit card required • Full page ready in 10 minutes
      </motion.p>
    </div>
  );
}
