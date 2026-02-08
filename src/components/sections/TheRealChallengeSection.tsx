/**
 * The Real Challenge Section (Stub)
 * 
 * A problem-agitation section that deeply explores the client's challenges
 * before presenting solutions. Designed for consulting and professional services.
 * 
 * TODO: Implement full version with:
 * - Emotional hooks
 * - Problem escalation narrative
 * - Industry-specific pain points
 * - Animated reveal effects
 */

import { AlertTriangle, TrendingDown, Clock } from 'lucide-react';

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
  };
}

export function TheRealChallengeSection({ content }: TheRealChallengeSectionProps) {
  const { 
    headline = "The Challenges You're Facing",
    challenges = [],
    mode = 'light'
  } = content;
  
  const isConsulting = content.industryVariant === 'consulting';
  const isLightMode = mode === 'light' || mode === 'warm';
  
  // Get brand color for consulting variant
  const primaryColor = (content as any).primaryColor;

  // Default challenges if none provided
  const displayChallenges = challenges.length > 0 ? challenges : [
    { 
      title: 'Unclear Strategy', 
      description: 'Without a clear roadmap, opportunities slip away and resources are wasted.', 
      impact: 'Costs you time and market position' 
    },
    { 
      title: 'Execution Gaps', 
      description: 'Great ideas stall without the right expertise to implement them.', 
      impact: 'Slows your growth trajectory' 
    },
    { 
      title: 'Market Uncertainty', 
      description: 'Navigating changing landscapes without guidance increases risk.', 
      impact: 'Creates competitive vulnerability' 
    },
  ];

  const icons = [AlertTriangle, TrendingDown, Clock];

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
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {displayChallenges.slice(0, 3).map((challenge, index) => {
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
                <h3 className={`text-xl font-semibold mb-2 ${
                  isLightMode ? 'text-slate-900' : 'text-white'
                }`}>
                  {challenge.title}
                </h3>
                <p className={`text-base mb-3 ${
                  isLightMode ? 'text-slate-600' : 'text-white/70'
                }`}>
                  {challenge.description}
                </p>
                {challenge.impact && (
                  <p className={`text-sm font-medium ${
                    isLightMode ? 'text-slate-600' : 'text-slate-400'
                  }`}>
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

export default TheRealChallengeSection;
