import { memo } from "react";
/**
 * The Real Challenge Section
 * 
 * A problem-agitation section that deeply explores the client's challenges
 * before presenting solutions. Now uses SDI dynamic design system for
 * automatic styling based on industry and brand colors.
 */

import { AlertTriangle, TrendingDown, Clock } from 'lucide-react';
import type { SDIPalette, SDISectionThemes, SDITypography } from '@/lib/designIntelligence/types';

interface TheRealChallengeSectionProps {
  content: {
    headline?: string;
    challenges?: Array<{
      title: string;
      description: string;
      impact?: string;
    }>;
    industryVariant?: string;
    mode?: string;
    // SDI Dynamic Design System
    primaryColor?: string;
    palette?: SDIPalette;
    sectionThemes?: SDISectionThemes;
    sdiTypography?: SDITypography;
  };
}

function TheRealChallengeSectionBase({ content }: TheRealChallengeSectionProps) {
  const { 
    headline = "The Challenges You're Facing",
    challenges = [],
  } = content;
  
  // SDI theme resolution
  const theme = content.sectionThemes?.['the-real-challenge'] || 'tinted';
  const palette = content.palette;
  const typography = content.sdiTypography;

  // Helper: Get section background styles from SDI
  const getSectionStyles = (): React.CSSProperties => {
    if (!palette) {
      // Fallback for non-SDI pages
      return { backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc' };
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

  // Helper: Get text color class based on theme
  const getTextColorClass = (): string => {
    return theme === 'dark' ? 'text-white' : 'text-slate-900';
  };

  // Helper: Get muted text color class based on theme
  const getMutedTextColorClass = (): string => {
    return theme === 'dark' ? 'text-white/70' : 'text-slate-600';
  };

  // Helper: Get card styles based on theme
  const getCardStyles = (): string => {
    if (theme === 'dark') {
      return 'bg-white/10 border-white/20 backdrop-blur-sm';
    }
    return 'bg-white border-slate-200 shadow-sm';
  };

  // Helper: Get icon container styles from SDI palette
  const getIconStyles = (): React.CSSProperties => {
    if (theme === 'dark') {
      return { backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff' };
    }
    if (palette) {
      return { backgroundColor: palette.iconBg, color: palette.iconColor };
    }
    return { backgroundColor: '#f1f5f9', color: '#475569' };
  };

  // Zero-fabrication: only render challenges with real title + description
  const displayChallenges = (challenges || []).filter(
    (c) => c && typeof c.title === 'string' && c.title.trim().length > 0 &&
           typeof c.description === 'string' && c.description.trim().length > 0
  );

  console.log('🧪 [TheRealChallengeSection] Render check:', {
    receivedCount: challenges?.length ?? 0,
    validCount: displayChallenges.length,
  });

  if (displayChallenges.length === 0) return null;


  const icons = [AlertTriangle, TrendingDown, Clock];

  return (
    <section 
      className="py-24 md:py-32"
      style={getSectionStyles()}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`${typography?.sectionTitle || 'text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight'} ${getTextColorClass()}`}>
            {headline}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {displayChallenges.slice(0, 3).map((challenge, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div 
                key={index} 
                className={`rounded-lg border p-8 ${getCardStyles()}`}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                  style={getIconStyles()}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className={`${typography?.cardTitle || 'text-xl font-semibold'} mb-3 ${getTextColorClass()}`}>
                  {challenge.title}
                </h3>
                <p className={`${typography?.body || 'text-base leading-relaxed'} mb-4 ${getMutedTextColorClass()}`}>
                  {challenge.description}
                </p>
                {challenge.impact && (
                  <p 
                    className={`text-sm font-medium ${theme === 'dark' ? 'text-white/60' : ''}`}
                    style={theme !== 'dark' && palette ? { color: palette.iconColor } : undefined}
                  >
                    {challenge.impact}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const TheRealChallengeSection = memo(TheRealChallengeSectionBase);
export default TheRealChallengeSection;
