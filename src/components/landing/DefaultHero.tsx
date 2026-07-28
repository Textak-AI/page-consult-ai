import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function DefaultHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Default headline */}
      <h1
        className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight antialiased mb-6 leading-[0.95]"
      >
        <span className="block">Landing Pages</span>
        <span className="block mt-2">
          That Start With{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x" style={{
            backgroundSize: '200% auto',
            textShadow: '0 0 40px rgba(6, 182, 212, 0.3)'
          }}>
            Strategy
          </span>
        </span>
      </h1>

      {/* Default subheadline */}
      <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
        Answer a few questions. Get a strategy-backed landing page built for your buyers — in minutes.
      </p>

      {/* CTA buttons */}
      <div className="mb-6 p-2 -m-2 flex flex-wrap items-center gap-4">
        <Button
          asChild
          size="lg"
          className="group/btn text-lg px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white border-0 animate-pulse-glow hover:scale-105 rounded-xl font-semibold transition-all duration-300"
        >
          <Link to="/brand-setup">
            <span className="relative z-10">Analyze My Website Free</span>
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          size="lg"
          className="text-lg px-8 py-4 rounded-xl font-semibold border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white transition-all duration-300"
        >
          <a href="#how-it-works">See How It Works</a>
        </Button>
      </div>

      {/* Truthful trust line */}
      <p className="text-gray-500 text-sm text-center sm:text-left">
        Answer a few questions — get a complete draft you can refine.
      </p>
    </motion.div>
  );
}
