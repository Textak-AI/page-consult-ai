import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, BarChart3, Users, Search, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PreviewModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: () => void;
}

export function PreviewModeModal({ isOpen, onClose, onStartSession }: PreviewModeModalProps) {
  const handleBackdropClick = () => {
    onStartSession();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          {/* Overlay text */}
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.2 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium bg-slate-900/60 px-4 py-2 rounded-full border border-slate-700/50"
          >
            Click anywhere to start full session
          </motion.p>

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Scaled preview container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 0.7 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[1200px] aspect-[16/10] bg-slate-950 rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden cursor-pointer"
            style={{ 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 60px rgba(6, 182, 212, 0.1)'
            }}
          >
            {/* Header bar */}
            <div className="h-12 border-b border-slate-800/50 bg-slate-950 flex items-center justify-between px-6">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-gradient-to-br from-cyan-400 to-purple-500" />
                <span className="text-cyan-400 font-semibold text-sm">PageConsult AI</span>
              </div>
              <span className="text-slate-300 font-medium text-sm">Strategy Session</span>
              <div className="w-5 h-5 text-slate-500">
                <X className="w-5 h-5" />
              </div>
            </div>

            {/* Tab navigation */}
            <div className="h-10 border-b border-slate-800/50 bg-slate-900/30 flex items-center gap-1 px-4">
              <TabButton icon={<BarChart3 className="w-3 h-3" />} label="Intel" active />
              <TabButton icon={<Users className="w-3 h-3" />} label="Objections" />
              <TabButton icon={<Search className="w-3 h-3" />} label="Research" />
              <TabButton icon={<FileText className="w-3 h-3" />} label="More" />
            </div>

            {/* Main content area */}
            <div className="flex h-[calc(100%-88px)]">
              {/* Left: Chat area */}
              <div className="flex-1 flex flex-col border-r border-slate-800/30">
                {/* Messages */}
                <div className="flex-1 p-6">
                  {/* AI message */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="bg-slate-800/50 rounded-2xl rounded-tl-md px-4 py-3 max-w-md">
                      <p className="text-slate-300 text-sm">
                        Tell me about your business — who do you help and what do you do for them?
                      </p>
                    </div>
                  </div>
                </div>

                {/* Input area */}
                <div className="p-4 border-t border-slate-800/30">
                  <div className="bg-slate-800/50 rounded-xl px-4 py-3 flex items-center gap-2">
                    <span className="text-slate-500 text-sm flex-1">Type your message...</span>
                    <div className="w-8 h-8 rounded-lg bg-cyan-600/50 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white/50" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Intelligence panel */}
              <div className="w-80 bg-slate-900/50 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span className="text-white font-semibold text-sm">Intelligence Profile</span>
                </div>

                {/* Progress bars */}
                <div className="space-y-4">
                  <ProgressItem label="Industry" value={0} />
                  <ProgressItem label="Audience" value={0} />
                  <ProgressItem label="Value Prop" value={0} />
                </div>

                {/* Score card */}
                <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-xs uppercase tracking-wide">Readiness</span>
                    <span className="text-cyan-400 font-bold">0%</span>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TabButton({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div className={`
      flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
      ${active 
        ? 'bg-slate-800/50 text-cyan-400' 
        : 'text-slate-500'
      }
    `}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

function ProgressItem({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-slate-400 text-xs">{label}</span>
        <span className="text-slate-500 text-xs">{value}%</span>
      </div>
      <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
