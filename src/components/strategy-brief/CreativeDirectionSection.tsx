import { motion } from 'framer-motion';
import { Lightbulb, Sparkles, MessageSquare, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConsultationArtifacts, CreativeArtifact } from '@/lib/artifactDetection';
import { CollapsibleBriefSection } from './CollapsibleBriefSection';

interface CreativeDirectionSectionProps {
  artifacts: ConsultationArtifacts;
  sectionNumber: number;
  className?: string;
}

function ArtifactDisplay({ 
  artifact, 
  label,
  isSelected = false 
}: { 
  artifact: CreativeArtifact; 
  label: string;
  isSelected?: boolean;
}) {
  return (
    <div className={cn(
      "p-4 rounded-lg border transition-all",
      isSelected 
        ? "bg-gradient-to-br from-purple-500/20 to-cyan-500/10 border-purple-500/30"
        : "bg-slate-800/30 border-slate-700/50"
    )}>
      <div className="flex items-start gap-3">
        {isSelected && (
          <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">
            {label}
          </div>
          <p className={cn(
            "text-base leading-relaxed",
            isSelected ? "text-white font-medium" : "text-slate-300"
          )}>
            "{artifact.content}"
          </p>
          {artifact.context && isSelected && (
            <div className="mt-3 flex items-start gap-2 text-sm text-slate-400">
              <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="italic">{artifact.context}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CreativeDirectionSection({ 
  artifacts, 
  sectionNumber,
  className 
}: CreativeDirectionSectionProps) {
  const hasSelectedHeadline = !!artifacts.selectedHeadline;
  const hasSelectedCTA = !!artifacts.selectedCTA;
  const hasSelectedPositioning = !!artifacts.selectedPositioning;
  const hasAlternatives = artifacts.alternativeHeadlines.length > 0;
  
  // Check if we have any content to display
  const hasContent = hasSelectedHeadline || hasSelectedCTA || hasSelectedPositioning || hasAlternatives;
  
  if (!hasContent) {
    return null;
  }
  
  console.log('[Strategy Brief] Creative Direction section:', {
    hasSelectedHeadline,
    hasSelectedCTA,
    alternativeCount: artifacts.alternativeHeadlines.length,
    userFeedback: artifacts.userFeedback?.substring(0, 50),
  });
  
  return (
    <CollapsibleBriefSection
      number={sectionNumber}
      title="Creative Direction"
      color="text-purple-400"
      colorBg="bg-purple-500/20"
      defaultExpanded={true}
      className={className}
    >
      <div className="bg-slate-800/50 rounded-xl p-5 space-y-4">
        {/* User Selection Badge */}
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-purple-300">
            User-Selected Direction
          </span>
        </div>
        
        {/* Selected Headline */}
        {hasSelectedHeadline && artifacts.selectedHeadline && (
          <ArtifactDisplay 
            artifact={artifacts.selectedHeadline}
            label="Selected Headline"
            isSelected
          />
        )}
        
        {/* Selected CTA */}
        {hasSelectedCTA && artifacts.selectedCTA && (
          <ArtifactDisplay 
            artifact={artifacts.selectedCTA}
            label="Selected Call-to-Action"
            isSelected
          />
        )}
        
        {/* Selected Positioning */}
        {hasSelectedPositioning && artifacts.selectedPositioning && (
          <ArtifactDisplay 
            artifact={artifacts.selectedPositioning}
            label="Positioning Statement"
            isSelected
          />
        )}
        
        {/* Alternative Headlines */}
        {artifacts.alternativeHeadlines.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Quote className="w-3 h-3" />
              <span>Alternative Options Considered</span>
            </div>
            <div className="space-y-2">
              {artifacts.alternativeHeadlines.slice(0, 3).map((headline, i) => (
                <div 
                  key={i}
                  className="pl-4 border-l-2 border-slate-700 text-sm text-slate-400 italic"
                >
                  "{headline.content}"
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* User Feedback / Reasoning */}
        {artifacts.userFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
          >
            <div className="flex items-start gap-3">
              <MessageSquare className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs uppercase tracking-wider text-emerald-400 mb-1">
                  Why They Chose This
                </div>
                <p className="text-sm text-emerald-300">
                  "{artifacts.userFeedback}"
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </CollapsibleBriefSection>
  );
}
