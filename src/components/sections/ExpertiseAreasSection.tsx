/**
 * Expertise Areas Section (Stub)
 * 
 * Showcases areas of expertise, practice areas, or service categories
 * for consulting and professional services.
 * 
 * TODO: Implement full version with:
 * - Expandable detail cards
 * - Case study links
 * - Industry-specific icons
 * - Animation on scroll
 */

import { Briefcase, BarChart3, Users2, Layers } from 'lucide-react';

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
  };
}

export function ExpertiseAreasSection({ content }: ExpertiseAreasSectionProps) {
  const { 
    headline = "Areas of Practice",
    subtitle = "Deep expertise across critical business domains",
    areas = [],
    mode = 'light',
    industryVariant = 'consulting'
  } = content;
  
  // Force light mode for consulting - this is a design requirement
  const isConsulting = industryVariant === 'consulting';
  const isLightMode = isConsulting ? true : (mode === 'light' || mode === 'warm');

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
    <section className={`py-20 ${isLightMode ? 'bg-slate-50' : 'bg-slate-900'}`}>
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
            isLightMode ? 'text-slate-900' : 'text-white'
          }`}>
            {headline}
          </h2>
          <p className={`text-lg ${isLightMode ? 'text-slate-600' : 'text-white/70'}`}>
            {subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {displayAreas.slice(0, 4).map((area, index) => {
            const Icon = iconMap[area.icon || 'briefcase'] || Briefcase;
            return (
              <div 
                key={index} 
                className={`p-6 rounded-xl border ${
                  isLightMode 
                    ? 'bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10 transition-colors'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isLightMode ? 'bg-primary/10' : 'bg-primary/20'
                  }`}>
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-semibold mb-2 ${
                      isLightMode ? 'text-slate-900' : 'text-white'
                    }`}>
                      {area.title}
                    </h3>
                    <p className={`text-base mb-3 ${
                      isLightMode ? 'text-slate-600' : 'text-white/70'
                    }`}>
                      {area.description}
                    </p>
                    {area.examples && area.examples.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {area.examples.map((example, i) => (
                          <span 
                            key={i}
                            className={`text-xs px-2 py-1 rounded-full ${
                              isLightMode 
                                ? 'bg-slate-100 text-slate-600' 
                                : 'bg-white/10 text-white/60'
                            }`}
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

export default ExpertiseAreasSection;
