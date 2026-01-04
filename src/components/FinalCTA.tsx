import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useContext } from "react";
import IntelligenceContext from "@/contexts/IntelligenceContext";
import { motion, AnimatePresence } from "framer-motion";
import { formatForHeadline } from "@/utils/formatForDisplay";

const FinalCTA = () => {
  // Try to get intelligence context (may be null if not in provider)
  const intelligenceContext = useContext(IntelligenceContext);
  const extractedIndustry = intelligenceContext?.state?.extracted?.industry;
  const readiness = intelligenceContext?.state?.readiness || 0;

  // Dynamic headline and button based on extracted intelligence
  const ctaHeadline = extractedIndustry
    ? `Ready to Build Your ${formatForHeadline(extractedIndustry)} Page?`
    : "Ready to Build Pages That Convert?";

  const buttonText = readiness >= 60
    ? "Continue My Strategy Session →"
    : "Start Strategic Consultation";

  return (
    <section className="section-spacing bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Grid pattern background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
      
      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="animate-fade-in">
          <AnimatePresence mode="wait">
            <motion.h2 
              key={ctaHeadline}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              {ctaHeadline}
            </motion.h2>
          </AnimatePresence>
          <p className="text-xl text-gray-300 mb-8">
            Start with strategy. Launch with confidence.
          </p>
          
          <Button
            asChild
            size="lg"
            className="bg-white text-slate-900 hover:bg-gray-100 text-lg px-12 py-7 h-auto shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-semibold"
          >
            <Link to="/new">
              {buttonText}
            </Link>
          </Button>
          
          <p className="text-gray-400 mt-4 text-sm">
            No credit card required • 14-day trial
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
