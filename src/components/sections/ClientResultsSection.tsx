import { memo } from "react";
/**
 * Client Results Section
 * 
 * Showcases client outcomes and measurable results using SDI dynamic design system.
 * Uses shared layout primitives for consistent quality.
 */

import { TrendingUp, Award, Users, CheckCircle2 } from 'lucide-react';
import type { SDIPalette, SDISectionThemes, SDITypography } from '@/lib/designIntelligence/types';
import { SectionWrapper } from './shared/SectionWrapper';
import { SectionHeader } from './shared/SectionHeader';
import { CardGrid } from './shared/CardGrid';
import { StatDisplay } from './shared/StatDisplay';
import { isCleanForDisplay } from '@/lib/contentCleaner';

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
    primaryColor?: string;
    palette?: SDIPalette;
    sectionThemes?: SDISectionThemes;
    sdiTypography?: SDITypography;
  };
}

function ClientResultsSectionBase({ content }: ClientResultsSectionProps) {
  const { 
    headline = "Client Success Stories",
    subtitle = "Measurable results that speak for themselves",
    results = [],
  } = content;
  
  const theme = content.sectionThemes?.['client-results'] || 'tinted';
  const palette = content.palette;
  const typography = content.sdiTypography;
  
  const isLightMode = content.mode 
    ? (content.mode === 'light' || content.mode === 'warm')
    : theme !== 'dark';

  const accentColor = content.primaryColor || palette?.primary || '#475569';

  // Quality floor
  if (results.length < 2) {
    console.log('🎨 [ClientResultsSection] Quality floor: fewer than 2 results, hiding section');
    return null;
  }

  // SDI-driven section background
  const getSectionBg = (): React.CSSProperties => {
    if (isLightMode) return { backgroundColor: '#f8fafc' };
    if (!palette) return { backgroundColor: '#0f172a' };
    switch (theme) {
      case 'dark': return { backgroundColor: palette.darkSection };
      case 'tinted': return { backgroundColor: palette.primaryTint };
      default: return { backgroundColor: palette.lightSection };
    }
  };

  const getCardStyles = () => {
    if (!isLightMode) return 'bg-white/5 border border-white/10';
    return 'bg-white shadow-md border border-gray-100';
  };

  const getIconStyles = (): React.CSSProperties => {
    if (!isLightMode) return { backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff' };
    return { backgroundColor: `${accentColor}15`, color: accentColor };
  };

  const icons = [TrendingUp, Award, Users, CheckCircle2];

  return (
    <SectionWrapper
      background="transparent"
      paddingY="lg"
      style={getSectionBg()}
      sectionType="client-results"
    >
      <SectionHeader
        eyebrow="RESULTS"
        title={headline}
        subtitle={subtitle}
        lightMode={isLightMode}
        accentColor={isLightMode ? accentColor : undefined}
        titleClassName={typography?.sectionTitle}
        subtitleClassName={typography?.sectionSubtitle}
      />

      <CardGrid columns={3} gap="lg" maxCardWidth="380px">
        {results.slice(0, 3).map((result, index) => {
          const Icon = icons[index % icons.length];
          const metricClean = isCleanForDisplay(result.metric);
          
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
              {metricClean ? (
                <StatDisplay
                  value={result.metric}
                  label={result.description}
                  detail={[result.client, result.industry].filter(Boolean).join(' • ')}
                  size="sm"
                  variant="inline"
                  lightMode={isLightMode}
                  accentColor={isLightMode ? accentColor : undefined}
                />
              ) : (
                <>
                  <h3 className={`text-2xl font-bold mb-2 ${isLightMode ? '' : 'text-white'}`}
                    style={isLightMode ? { color: accentColor } : undefined}
                  >
                    {result.metric}
                  </h3>
                  <p className={`${typography?.body || 'text-base'} mb-4 ${isLightMode ? 'text-slate-600' : 'text-white/70'}`}>
                    {result.description}
                  </p>
                  {(result.client || result.industry) && (
                    <div className={`text-sm font-medium ${isLightMode ? 'text-slate-500' : 'text-white/50'}`}>
                      {result.client && <span>{result.client}</span>}
                      {result.client && result.industry && <span> • </span>}
                      {result.industry && <span>{result.industry}</span>}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </CardGrid>
    </SectionWrapper>
  );
}

export const ClientResultsSection = memo(ClientResultsSectionBase);
export default ClientResultsSection;
