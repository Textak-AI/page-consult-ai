/**
 * Client Results Section (Stub)
 * 
 * Showcases client outcomes, case studies, and measurable results
 * for consulting and professional services.
 * 
 * TODO: Implement full version with:
 * - Full case study cards
 * - Before/after metrics
 * - Client logos
 * - Video testimonials
 */

import { TrendingUp, Award, Users, CheckCircle2 } from 'lucide-react';

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
  };
}

export function ClientResultsSection({ content }: ClientResultsSectionProps) {
  const { 
    headline = "Client Success Stories",
    subtitle = "Measurable results that speak for themselves",
    results = [],
    mode = 'light'
  } = content;
  
  const isConsulting = content.industryVariant === 'consulting';
  const isLightMode = mode === 'light' || mode === 'warm';
  
  // Get brand color for consulting variant
  const primaryColor = (content as any).primaryColor;

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

  // Consulting gets subtle brand color background
  const sectionBg = isConsulting && primaryColor 
    ? { backgroundColor: `${primaryColor}08` } // 5% opacity
    : undefined;

  return (
    <section 
      className={`py-24 md:py-32 ${!sectionBg ? (isLightMode ? 'bg-slate-50' : 'bg-slate-900') : ''}`}
      style={sectionBg}
    >
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 ${
            isLightMode ? 'text-slate-900' : 'text-white'
          }`}>
            {headline}
          </h2>
          <p className={`text-lg md:text-xl ${isLightMode ? 'text-slate-600' : 'text-white/70'}`}>
            {subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {displayResults.slice(0, 3).map((result, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div 
                key={index} 
                className={`p-8 rounded-lg ${
                  isLightMode 
                    ? 'bg-white border border-slate-200' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div 
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    isConsulting ? '' : (isLightMode ? 'bg-slate-100' : 'bg-slate-700')
                  }`}
                  style={isConsulting && primaryColor ? { backgroundColor: `${primaryColor}15` } : undefined}
                >
                  <Icon 
                    className={`w-6 h-6 ${isConsulting ? '' : (isLightMode ? 'text-slate-700' : 'text-slate-300')}`}
                    style={isConsulting && primaryColor ? { color: primaryColor } : undefined}
                  />
                </div>
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={primaryColor ? { color: primaryColor } : undefined}
                >
                  {result.metric}
                </h3>
                <p className={`text-base mb-4 ${
                  isLightMode ? 'text-slate-600' : 'text-white/70'
                }`}>
                  {result.description}
                </p>
                {(result.client || result.industry) && (
                  <div className={`text-sm font-medium ${
                    isLightMode ? 'text-slate-500' : 'text-white/50'
                  }`}>
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
