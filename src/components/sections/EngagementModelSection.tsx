/**
 * Engagement Model Section (Stub)
 * 
 * Explains how the consulting engagement works - from initial
 * conversation through delivery and beyond.
 * 
 * TODO: Implement full version with:
 * - Timeline visualization
 * - Phase details
 * - Deliverables for each phase
 * - FAQ integration
 */

import { MessageSquare, ClipboardList, Rocket, RefreshCw } from 'lucide-react';

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
  };
}

export function EngagementModelSection({ content }: EngagementModelSectionProps) {
  const { 
    headline = "Our Engagement Model",
    subtitle = "A structured approach designed for your success",
    steps = [],
    mode = 'light'
  } = content;
  
  const isLightMode = mode === 'light' || mode === 'warm';

  // Default steps if none provided
  const displaySteps = steps.length > 0 ? steps : [
    { 
      number: 1, 
      title: 'Discovery Conversation', 
      description: 'We begin with a deep-dive session to understand your challenges, goals, and context.',
      duration: 'Week 1'
    },
    { 
      number: 2, 
      title: 'Strategic Assessment', 
      description: 'Our team analyzes your situation and develops tailored recommendations.',
      duration: 'Weeks 2-3'
    },
    { 
      number: 3, 
      title: 'Implementation Support', 
      description: 'We partner with you to execute the strategy, adjusting as needed.',
      duration: 'Ongoing'
    },
    { 
      number: 4, 
      title: 'Results & Iteration', 
      description: 'We measure outcomes, celebrate wins, and refine for continuous improvement.',
      duration: 'Continuous'
    },
  ];

  const icons = [MessageSquare, ClipboardList, Rocket, RefreshCw];

  return (
    <section className={`py-20 ${isLightMode ? 'bg-white' : 'bg-slate-950'}`}>
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

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className={`absolute left-8 top-0 bottom-0 w-0.5 ${
              isLightMode ? 'bg-slate-200' : 'bg-white/20'
            } hidden md:block`} />

            {displaySteps.slice(0, 4).map((step, index) => {
              const Icon = icons[index % icons.length];
              return (
                <div key={index} className="relative flex gap-6 mb-8 last:mb-0">
                  {/* Step number circle */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                    isLightMode 
                      ? 'bg-primary text-white' 
                      : 'bg-primary text-white'
                  }`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Step content */}
                  <div className={`flex-1 p-6 rounded-xl border ${
                    isLightMode 
                      ? 'bg-slate-50 border-slate-200' 
                      : 'bg-white/5 border-white/10'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                        isLightMode ? 'bg-primary/10 text-primary' : 'bg-primary/20 text-primary'
                      }`}>
                        Step {step.number}
                      </span>
                      {step.duration && (
                        <span className={`text-sm ${
                          isLightMode ? 'text-slate-500' : 'text-white/50'
                        }`}>
                          {step.duration}
                        </span>
                      )}
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${
                      isLightMode ? 'text-slate-900' : 'text-white'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-base ${
                      isLightMode ? 'text-slate-600' : 'text-white/70'
                    }`}>
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

export default EngagementModelSection;
