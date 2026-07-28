import { memo } from "react";
/**
 * Our Approach Section
 * 
 * Presents the consulting methodology or approach using SDI dynamic design system.
 */

import { Lightbulb, Target, Rocket, CheckCircle2 } from 'lucide-react';
import type { SDIPalette, SDISectionThemes, SDITypography } from '@/lib/designIntelligence/types';

interface OurApproachSectionProps {
  content: {
    headline?: string;
    subtitle?: string;
    principles?: Array<{
      title: string;
      description: string;
      icon?: string;
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

function OurApproachSectionBase({ content }: OurApproachSectionProps) {
  const { 
    headline = "Our Approach",
    subtitle = "A proven methodology that delivers results",
    principles = [],
  } = content;
  
  // SDI Design System
  const theme = content.sectionThemes?.['our-approach'] || 'dark';
  const palette = content.palette;
  const typography = content.sdiTypography;

  // Helper functions for SDI-driven styling
  const getSectionStyles = (): React.CSSProperties => {
    if (!palette) {
      return { backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff' };
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
    return theme === 'dark' ? 'text-white/80' : 'text-slate-600';
  };

  const getCardStyles = () => {
    if (theme === 'dark') {
      // On dark bg, use white cards with brand-colored icons
      return 'bg-white border border-slate-200';
    }
    return 'bg-slate-50 border border-slate-200';
  };

  const getCardTextColorClass = () => {
    // Cards are always light background
    return 'text-slate-900';
  };

  const getCardMutedTextColorClass = () => {
    return 'text-slate-600';
  };

  const getIconStyles = (): React.CSSProperties => {
    if (palette) {
      return { backgroundColor: palette.iconBg, color: palette.iconColor };
    }
    return { backgroundColor: '#f1f5f9', color: '#475569' };
  };

  // Zero-fabrication: only render principles with real title + description
  const displayPrinciples = (principles || []).filter(
    (p) => p && typeof p.title === 'string' && p.title.trim().length > 0 &&
           typeof p.description === 'string' && p.description.trim().length > 0
  );

  console.log('🧪 [OurApproachSection] Render check:', {
    receivedCount: principles?.length ?? 0,
    validCount: displayPrinciples.length,
  });

  if (displayPrinciples.length === 0) return null;


  const iconMap: Record<string, typeof Lightbulb> = {
    lightbulb: Lightbulb,
    target: Target,
    rocket: Rocket,
    check: CheckCircle2,
  };

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

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {displayPrinciples.slice(0, 3).map((principle, index) => {
            const Icon = iconMap[principle.icon || 'check'] || CheckCircle2;
            return (
              <div 
                key={index} 
                className={`p-8 rounded-lg text-center ${getCardStyles()}`}
              >
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={getIconStyles()}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className={`${typography?.cardTitle || 'text-xl font-semibold'} mb-3 ${getCardTextColorClass()}`}>
                  {principle.title}
                </h3>
                <p className={`${typography?.body || 'text-base leading-relaxed'} ${getCardMutedTextColorClass()}`}>
                  {principle.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const OurApproachSection = memo(OurApproachSectionBase);
export default OurApproachSection;
