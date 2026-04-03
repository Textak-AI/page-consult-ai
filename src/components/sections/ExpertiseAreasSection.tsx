import { memo } from "react";
/**
 * Expertise Areas Section
 * 
 * Showcases areas of expertise using SDI dynamic design system.
 */

import { Briefcase, BarChart3, Users2, Layers } from 'lucide-react';
import type { SDIPalette, SDISectionThemes, SDITypography } from '@/lib/designIntelligence/types';

interface ExpertiseAreasSectionProps {
  content: {
    headline?: string;
    subtitle?: string;
    areas?: Array<{
      title: string;
      description: string;
      icon?: string;
      examples?: string[];
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

function ExpertiseAreasSectionBase({ content }: ExpertiseAreasSectionProps) {
  const { 
    headline = "Areas of Practice",
    subtitle = "Deep expertise across critical business domains",
    areas = [],
  } = content;
  
  // SDI Design System
  const theme = content.sectionThemes?.['expertise-areas'] || 'light';
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
    return theme === 'dark' ? 'text-white/70' : 'text-slate-600';
  };

  const getCardStyles = () => {
    if (theme === 'dark') {
      return 'bg-white/5 border border-white/10 hover:bg-white/10 transition-colors';
    }
    return 'bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors';
  };

  const getIconStyles = (): React.CSSProperties => {
    if (theme === 'dark') {
      return { backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff' };
    }
    if (palette) {
      return { backgroundColor: palette.iconBg, color: palette.iconColor };
    }
    return { backgroundColor: '#f1f5f9', color: '#475569' };
  };

  const getTagStyles = () => {
    if (theme === 'dark') {
      return 'bg-white/10 text-white/60';
    }
    return 'bg-slate-100 text-slate-600';
  };

  // Default areas if none provided
  const displayAreas = areas.length > 0 ? areas : [
    { 
      title: 'Strategic Advisory', 
      description: 'Helping leadership navigate complex decisions with clarity and confidence.',
      icon: 'briefcase',
      examples: ['Market entry', 'M&A support', 'Growth strategy']
    },
    { 
      title: 'Performance Optimization', 
      description: 'Identifying and unlocking operational improvements that drive bottom-line results.',
      icon: 'chart',
      examples: ['Process redesign', 'Cost reduction', 'Efficiency gains']
    },
    { 
      title: 'Organizational Excellence', 
      description: 'Building high-performing teams and cultures that sustain competitive advantage.',
      icon: 'users',
      examples: ['Leadership development', 'Change management', 'Culture transformation']
    },
    { 
      title: 'Digital Transformation', 
      description: 'Guiding technology-enabled change that creates new value and capabilities.',
      icon: 'layers',
      examples: ['Digital strategy', 'Tech enablement', 'Data & analytics']
    },
  ];

  const iconMap: Record<string, typeof Briefcase> = {
    briefcase: Briefcase,
    chart: BarChart3,
    users: Users2,
    layers: Layers,
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

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {displayAreas.slice(0, 4).map((area, index) => {
            const Icon = iconMap[area.icon || 'briefcase'] || Briefcase;
            return (
              <div 
                key={index} 
                className={`p-8 rounded-lg ${getCardStyles()}`}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={getIconStyles()}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`${typography?.cardTitle || 'text-xl font-semibold'} mb-2 ${getTextColorClass()}`}>
                      {area.title}
                    </h3>
                    <p className={`${typography?.body || 'text-base'} mb-3 ${getMutedTextColorClass()}`}>
                      {area.description}
                    </p>
                    {area.examples && area.examples.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {area.examples.map((example, i) => (
                          <span 
                            key={i}
                            className={`text-xs px-2 py-1 rounded-full ${getTagStyles()}`}
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const ExpertiseAreasSection = memo(ExpertiseAreasSectionBase);
export default ExpertiseAreasSection;
