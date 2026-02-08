/**
 * Our Approach Section (Stub)
 * 
 * Presents the consulting methodology or approach in an engaging,
 * differentiating way that shows expertise and process.
 * 
 * TODO: Implement full version with:
 * - Methodology visualization
 * - Key principles
 * - Differentiators from competitors
 * - Interactive elements
 */

import { Lightbulb, Target, Rocket, CheckCircle2 } from 'lucide-react';

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
  };
}

export function OurApproachSection({ content }: OurApproachSectionProps) {
  const { 
    headline = "Our Approach",
    subtitle = "A proven methodology that delivers results",
    principles = [],
    mode = 'light'
  } = content;
  
  const isConsulting = content.industryVariant === 'consulting';
  const isLightMode = mode === 'light' || mode === 'warm';
  
  // Get brand color for consulting variant
  const primaryColor = (content as any).primaryColor;

  // Default principles if none provided
  const displayPrinciples = principles.length > 0 ? principles : [
    { 
      title: 'Deep Discovery', 
      description: 'We start by understanding your unique challenges, goals, and context before proposing solutions.',
      icon: 'lightbulb'
    },
    { 
      title: 'Strategic Alignment', 
      description: 'Every recommendation ties directly to your business objectives and measurable outcomes.',
      icon: 'target'
    },
    { 
      title: 'Execution Excellence', 
      description: 'We don\'t just advise—we partner with you to implement and iterate until goals are achieved.',
      icon: 'rocket'
    },
  ];

  const iconMap: Record<string, typeof Lightbulb> = {
    lightbulb: Lightbulb,
    target: Target,
    rocket: Rocket,
    check: CheckCircle2,
  };

  // Consulting gets brand-colored dark section
  if (isConsulting) {
    const bgColor = primaryColor || '#32373C';
    
    return (
      <section 
        className="py-24 md:py-32"
        style={{ backgroundColor: bgColor }}
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-white">
              {headline}
            </h2>
            <p className="text-lg md:text-xl text-white/80">
              {subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {displayPrinciples.slice(0, 3).map((principle, index) => {
              const Icon = iconMap[principle.icon || 'check'] || CheckCircle2;
              return (
                <div 
                  key={index} 
                  className="p-8 rounded-lg text-center bg-white border border-slate-200"
                >
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                    style={{ backgroundColor: `${bgColor}15` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: bgColor }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-900">
                    {principle.title}
                  </h3>
                  <p className="text-base leading-relaxed text-slate-600">
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

  return (
    <section className={`py-24 md:py-32 ${isLightMode ? 'bg-white' : 'bg-slate-950'}`}>
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
          {displayPrinciples.slice(0, 3).map((principle, index) => {
            const Icon = iconMap[principle.icon || 'check'] || CheckCircle2;
            return (
              <div 
                key={index} 
                className={`p-8 rounded-lg text-center ${
                  isLightMode 
                    ? 'bg-slate-50 border border-slate-200' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 ${
                  isLightMode ? 'bg-slate-100' : 'bg-slate-700'
                }`}>
                  <Icon className={`w-7 h-7 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`} />
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${
                  isLightMode ? 'text-slate-900' : 'text-white'
                }`}>
                  {principle.title}
                </h3>
                <p className={`text-base leading-relaxed ${
                  isLightMode ? 'text-slate-600' : 'text-white/70'
                }`}>
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

export default OurApproachSection;
