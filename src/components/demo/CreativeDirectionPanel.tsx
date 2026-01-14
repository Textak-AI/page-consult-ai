import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Quote, MessageSquare, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConsultationArtifacts, CreativeArtifact } from '@/lib/artifactDetection';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CreativeDirectionPanelProps {
  artifacts: ConsultationArtifacts;
  className?: string;
}

function ArtifactItem({ 
  artifact, 
  label,
  isSelected = false 
}: { 
  artifact: CreativeArtifact; 
  label: string;
  isSelected?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-3 rounded-lg border transition-all",
        isSelected 
          ? "bg-gradient-to-br from-purple-500/20 to-cyan-500/10 border-purple-500/30"
          : "bg-slate-800/30 border-slate-700/50 opacity-75"
      )}
    >
      <div className="flex items-start gap-2">
        {isSelected && (
          <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
            {label}
          </div>
          <p className={cn(
            "text-sm leading-relaxed",
            isSelected ? "text-white font-medium" : "text-slate-400"
          )}>
            "{artifact.content}"
          </p>
          {artifact.context && isSelected && (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
              <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
              <span className="italic">{artifact.context}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function CreativeDirectionPanel({ artifacts, className }: CreativeDirectionPanelProps) {
  const hasSelectedHeadline = !!artifacts.selectedHeadline;
  const hasSelectedCTA = !!artifacts.selectedCTA;
  const hasSelectedPositioning = !!artifacts.selectedPositioning;
  const hasAlternatives = artifacts.alternativeHeadlines.length > 0 || artifacts.alternativeCTAs.length > 0;
  
  // Check if we have any meaningful content to display
  const hasContent = hasSelectedHeadline || hasSelectedCTA || hasSelectedPositioning || hasAlternatives;
  
  if (!hasContent) {
    return null;
  }
  
  return (
    <div className={cn("space-y-3", className)}>
      {/* Section Header */}
      <div className="flex items-center gap-2 px-1">
        <Lightbulb className="w-4 h-4 text-purple-400" />
        <h3 className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Creative Direction
        </h3>
        {(hasSelectedHeadline || hasSelectedCTA) && (
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            User Selected
          </span>
        )}
      </div>
      
      <AnimatePresence mode="popLayout">
        {/* Selected Headline */}
        {hasSelectedHeadline && artifacts.selectedHeadline && (
          <ArtifactItem 
            artifact={artifacts.selectedHeadline}
            label="Selected Headline"
            isSelected
          />
        )}
        
        {/* Selected CTA */}
        {hasSelectedCTA && artifacts.selectedCTA && (
          <ArtifactItem 
            artifact={artifacts.selectedCTA}
            label="Selected CTA"
            isSelected
          />
        )}
        
        {/* Selected Positioning */}
        {hasSelectedPositioning && artifacts.selectedPositioning && (
          <ArtifactItem 
            artifact={artifacts.selectedPositioning}
            label="Positioning Statement"
            isSelected
          />
        )}
        
        {/* Alternative Headlines (collapsed) */}
        {artifacts.alternativeHeadlines.length > 0 && !hasSelectedHeadline && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-2 rounded-lg bg-slate-800/30 border border-slate-700/30 cursor-help">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Quote className="w-3 h-3" />
                  <span>{artifacts.alternativeHeadlines.length} headline option{artifacts.alternativeHeadlines.length > 1 ? 's' : ''} available</span>
                  <ChevronRight className="w-3 h-3 ml-auto" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <div className="space-y-2">
                <p className="text-xs font-medium">Headline Options:</p>
                {artifacts.alternativeHeadlines.slice(0, 3).map((h, i) => (
                  <p key={i} className="text-xs text-slate-300">"{h.content}"</p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
        
        {/* User Feedback */}
        {artifacts.userFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
          >
            <div className="flex items-start gap-2">
              <MessageSquare className="w-3 h-3 text-emerald-400 mt-0.5" />
              <p className="text-xs text-emerald-300 italic">
                "{artifacts.userFeedback}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CreativeDirectionPanel;
