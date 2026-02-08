/**
 * Client Results Section
 * 
 * Showcases client outcomes and measurable results using SDI dynamic design system.
 */

import { TrendingUp, Award, Users, CheckCircle2 } from 'lucide-react';
import type { SDIPalette, SDISectionThemes, SDITypography } from '@/lib/designIntelligence/types';

interface ClientResultsSectionProps {
  content: {
    headline?: string;
    subtitle?: string;
    results?: Array<{
      metric: string;
      description: string;
      client?: string;
      industry?: string;
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

export function ClientResultsSection({ content }: ClientResultsSectionProps) {
  const { 
    headline = "Client Success Stories",
    subtitle = "Measurable results that speak for themselves",
    results = [],
  } = content;
  
  // SDI Design System
  const theme = content.sectionThemes?.['client-results'] || 'tinted';
  const palette = content.palette;
  const typography = content.sdiTypography;

  // Helper functions for SDI-driven styling
  const getSectionStyles = (): React.CSSProperties => {
    if (!palette) {
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
    return 'bg-white border border-slate-200';
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

  const getMetricStyles = (): React.CSSProperties => {
    // Use primary color for metrics on light themes
    if (theme !== 'dark' && palette) {
      return { color: palette.primary };
    }
    return {};
  };

  const getMetricColorClass = () => {
    if (theme === 'dark') {
      return 'text-white';
    }
    // If no palette, use a default accent color
    return palette ? '' : 'text-slate-900';
  };

  // Default results if none provided
  const displayResults = results.length > 0 ? results : [
    { 
      metric: '40% Revenue Growth', 
      description: 'Helped a mid-market company restructure their go-to-market strategy, resulting in significant revenue uplift.',
      client: 'Technology Company',
      industry: 'SaaS'
    },
    { 
      metric: '$2.5M Cost Savings', 
      description: 'Identified operational inefficiencies and implemented process improvements that delivered lasting savings.',
      client: 'Manufacturing Firm',
      industry: 'Industrial'
    },
    { 
      metric: '3x Team Productivity', 
      description: 'Redesigned workflows and implemented new systems that dramatically improved team output.',
      client: 'Professional Services',
      industry: 'Consulting'
    },
  ];

  const icons = [TrendingUp, Award, Users, CheckCircle2];

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
          {displayResults.slice(0, 3).map((result, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div 
                key={index} 
                className={`p-8 rounded-lg ${getCardStyles()}`}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={getIconStyles()}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 
                  className={`text-2xl font-bold mb-2 ${getMetricColorClass()}`}
                  style={getMetricStyles()}
                >
                  {result.metric}
                </h3>
                <p className={`${typography?.body || 'text-base'} mb-4 ${getMutedTextColorClass()}`}>
                  {result.description}
                </p>
                {(result.client || result.industry) && (
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white/50' : 'text-slate-500'}`}>
                    {result.client && <span>{result.client}</span>}
                    {result.client && result.industry && <span> • </span>}
                    {result.industry && <span>{result.industry}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ClientResultsSection;
