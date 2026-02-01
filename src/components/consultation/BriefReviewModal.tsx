import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowRight, Sparkles, Target, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ExtractedIntelligence } from '@/contexts/IntelligenceContext';

interface BriefReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  intelligence: ExtractedIntelligence;
  readinessScore: number;
}

export function BriefReviewModal({
  isOpen,
  onClose,
  onContinue,
  intelligence,
  readinessScore,
}: BriefReviewModalProps) {
  const [isAnimating, setIsAnimating] = useState(true);

  // Extract key insights for display
  const briefSections = [
    {
      icon: Target,
      label: 'Industry',
      value: intelligence.industry || intelligence.industryFull,
      summary: intelligence.industrySummary,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Users,
      label: 'Target Audience',
      value: intelligence.audience || intelligence.audienceFull,
      summary: intelligence.audienceSummary,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      icon: Zap,
      label: 'Value Proposition',
      value: intelligence.valueProp || intelligence.valuePropFull,
      summary: intelligence.valuePropSummary,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: Sparkles,
      label: 'Competitive Edge',
      value: intelligence.competitorDifferentiator || intelligence.competitorDifferentiatorFull,
      summary: intelligence.edgeSummary,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
  ].filter(section => section.value);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-white">
                Your Strategy Brief
              </DialogTitle>
              <p className="text-sm text-slate-400 mt-0.5">
                Here's what we've captured about your business
              </p>
            </div>
          </motion.div>
        </DialogHeader>

        {/* Readiness Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mx-6 mt-4 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-slate-700/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Intelligence Readiness</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${readinessScore}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
              <span className="text-sm font-semibold text-white">{readinessScore}%</span>
            </div>
          </div>
        </motion.div>

        {/* Brief Sections */}
        <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto">
          {briefSections.map((section, index) => (
            <motion.div
              key={section.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 ${section.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <section.icon className={`w-4 h-4 ${section.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                    {section.label}
                  </p>
                  <p className="text-white font-medium">
                    {section.value}
                  </p>
                  {section.summary && (
                    <p className="text-sm text-slate-400 mt-1">
                      {section.summary}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {briefSections.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <p>No intelligence captured yet. Continue the conversation to build your strategy brief.</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-0 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
          >
            Continue Chat
          </Button>
          <Button
            onClick={onContinue}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
          >
            Continue to Brand Setup
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
