import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConversionCTAPanelProps {
  readiness: number;
  onContinue: () => void;
  onKeepChatting: () => void;
}

export default function ConversionCTAPanel({ 
  readiness, 
  onContinue, 
  onKeepChatting 
}: ConversionCTAPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-cyan-500/5 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">
            Your Intelligence Profile is looking solid
          </h3>
          <p className="text-sm text-slate-400">
            {readiness}% strategy readiness • Ready to build your page
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${readiness}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Description */}
      <p className="text-sm text-slate-300">
        We've gathered enough about your business to create a high-converting landing page. 
        Continue to add your brand assets and finalize your strategy.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          onClick={onContinue}
          className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold py-5"
        >
          Continue to Full Consultation
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <Button
          onClick={onKeepChatting}
          variant="ghost"
          className="text-slate-400 hover:text-white hover:bg-white/5"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Keep Chatting
        </Button>
      </div>
    </motion.div>
  );
}
