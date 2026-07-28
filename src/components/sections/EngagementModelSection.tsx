import { memo } from "react";
/**
 * Engagement Model Section
 * 
 * Explains how the consulting engagement works using SDI dynamic design system.
 */

import { MessageSquare, ClipboardList, Rocket, RefreshCw } from 'lucide-react';
import type { SDIPalette, SDISectionThemes, SDITypography } from '@/lib/designIntelligence/types';

interface EngagementModelSectionProps {
  content: {
    headline?: string;
    subtitle?: string;
    steps?: Array<{
      number: number;
      title: string;
      description: string;
      duration?: string;
    }>;
    industryVariant?: string;
    mode?: string;
    // SDI Design System
    primaryColor?: string;
    palette?: SDIPalette;
    sectionThemes?: SDISectionThemes;
    sdiTypography?: SDITypography;
  };
}

function EngagementModelSectionBase({ content }: EngagementModelSectionProps) {
  const { 
    headline = "Our Engagement Model",
    subtitle = "A structured approach designed for your success",
    steps = [],
  } = content;
  
  // SDI Design System
  const theme = content.sectionThemes?.['engagement-model'] || 'light';
  const palette = content.palette;
  const typography = content.sdiTypography;

  // Helper functions for SDI-driven styling
  const getSectionStyles = (): React.CSSProperties => {
    if (!palette) {
      return { backgroundColor: theme === 'dark' ? '#020617' : '#ffffff' };
    }
    switch (theme) {
      case 'dark':
        return { backgroundColor: palette.darkSection };
      case 'tinted':
        return { backgroundColor: palette.primaryTint };
      default:
        return { backgroundColor: palette.lightSection };
    }
  };

  const getTextColorClass = () => {
    return theme === 'dark' ? 'text-white' : 'text-slate-900';
  };

  const getMutedTextColorClass = () => {
    return theme === 'dark' ? 'text-white/70' : 'text-slate-600';
  };

  const getCardStyles = () => {
    if (theme === 'dark') {
      return 'bg-white/5 border border-white/10';
    }
    return 'bg-slate-50 border border-slate-200';
  };

  const getTimelineStyles = () => {
    return theme === 'dark' ? 'bg-white/20' : 'bg-slate-200';
  };

  const getStepCircleStyles = (): React.CSSProperties => {
    if (palette) {
      return { backgroundColor: palette.primary, color: '#ffffff' };
    }
    return { backgroundColor: theme === 'dark' ? '#334155' : '#1e293b', color: '#ffffff' };
  };

  const getStepBadgeStyles = () => {
    if (theme === 'dark') {
      return 'bg-slate-700 text-slate-300';
    }
    return 'bg-slate-200 text-slate-700';
  };

  const getDurationStyles = () => {
    return theme === 'dark' ? 'text-white/50' : 'text-slate-500';
  };

  // Zero-fabrication: only render steps with real title + description
  const displaySteps = (steps || []).filter(
    (s) => s && typeof s.title === 'string' && s.title.trim().length > 0 &&
           typeof s.description === 'string' && s.description.trim().length > 0
  );

  console.log('🧪 [EngagementModelSection] Render check:', {
    receivedCount: steps?.length ?? 0,
    validCount: displaySteps.length,
  });

  if (displaySteps.length === 0) return null;


  const icons = [MessageSquare, ClipboardList, Rocket, RefreshCw];

  return (
    <section 
      className="py-24 md:py-32"
      style={getSectionStyles()}
    >
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className={`${typography?.sectionTitle || 'text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight'} mb-4 ${getTextColorClass()}`}>
            {headline}
          </h2>
          <p className={`${typography?.sectionSubtitle || 'text-lg md:text-xl'} ${getMutedTextColorClass()}`}>
            {subtitle}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className={`absolute left-8 top-0 bottom-0 w-0.5 ${getTimelineStyles()} hidden md:block`} />

            {displaySteps.slice(0, 4).map((step, index) => {
              const Icon = icons[index % icons.length];
              return (
                <div key={index} className="relative flex gap-6 mb-8 last:mb-0">
                  {/* Step number circle */}
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                    style={getStepCircleStyles()}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Step content */}
                  <div className={`flex-1 p-8 rounded-lg ${getCardStyles()}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-sm font-medium px-2 py-0.5 rounded ${getStepBadgeStyles()}`}>
                        Step {step.number}
                      </span>
                      {step.duration && (
                        <span className={`text-sm ${getDurationStyles()}`}>
                          {step.duration}
                        </span>
                      )}
                    </div>
                    <h3 className={`${typography?.cardTitle || 'text-xl font-semibold'} mb-2 ${getTextColorClass()}`}>
                      {step.title}
                    </h3>
                    <p className={`${typography?.body || 'text-base'} ${getMutedTextColorClass()}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export const EngagementModelSection = memo(EngagementModelSectionBase);
export default EngagementModelSection;
