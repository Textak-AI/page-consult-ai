import { Clock } from "lucide-react";

interface SocialProofSectionProps {
  content: {
    stats: Array<{
      label: string;
      value: string;
    }>;
    recentActivity?: Array<{
      name: string;
      action: string;
      time: string;
      location: string;
    }>;
    industryInsights?: {
      title: string;
      stats: string[];
      facts?: string[];
      valueProps?: string[];
      credentials?: string[];
      extractedStats?: {
        marketSize: string | null;
        growthRate: string | null;
        customerCount: string | null;
      };
    };
    industry?: string;
  };
  onUpdate: (content: any) => void;
}

function getSocialProofHeader(industry?: string): { title: string; subtitle: string } {
  const industryLower = industry?.toLowerCase() || '';
  
  // Wedding/Events
  if (industryLower.includes('wedding') || industryLower.includes('dj')) {
    return { title: 'Trusted by Happy Couples', subtitle: 'See what couples are saying' };
  }
  
  // B2B/SaaS
  if (industryLower.includes('b2b') || industryLower.includes('saas') || industryLower.includes('software')) {
    return { title: 'Trusted by Companies', subtitle: 'Join leading teams' };
  }
  
  // E-commerce
  if (industryLower.includes('ecommerce') || industryLower.includes('shop') || industryLower.includes('store')) {
    return { title: 'What Customers Are Saying', subtitle: 'Join thousands of satisfied shoppers' };
  }
  
  // Legal
  if (industryLower.includes('legal') || industryLower.includes('law') || industryLower.includes('attorney')) {
    return { title: 'Client Success Stories', subtitle: 'Proven results you can trust' };
  }
  
  // Home Services
  if (industryLower.includes('home') || industryLower.includes('contractor') || industryLower.includes('repair')) {
    return { title: 'Trusted by Homeowners', subtitle: 'See what neighbors are saying' };
  }
  
  // Healthcare
  if (industryLower.includes('health') || industryLower.includes('medical') || industryLower.includes('doctor')) {
    return { title: 'What Patients Are Saying', subtitle: 'Real testimonials from real patients' };
  }
  
  // Consulting
  if (industryLower.includes('consult')) {
    return { title: 'Client Results', subtitle: 'Trusted by industry leaders' };
  }
  
  // Default
  return { title: 'Trusted by Customers', subtitle: 'Join thousands of satisfied clients' };
}

export function SocialProofSection({ content }: SocialProofSectionProps) {
  const header = getSocialProofHeader(content.industry);
  
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">{header.title}</h2>
          <p className="text-muted-foreground">
            {header.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {content.stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Industry Insights Section */}
        {content.industryInsights && (
          <div className="mb-12 space-y-6">
            {/* Market Overview Card */}
            <div className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                📊 Market Overview
              </h3>
              
              {/* Extracted Key Stats */}
              {content.industryInsights.extractedStats && (
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  {content.industryInsights.extractedStats.marketSize && (
                    <div className="bg-card/80 rounded-lg p-4 border">
                      <div className="text-sm text-muted-foreground mb-1">Market Size</div>
                      <div className="text-lg font-bold text-primary">
                        {content.industryInsights.extractedStats.marketSize}
                      </div>
                    </div>
                  )}
                  {content.industryInsights.extractedStats.growthRate && (
                    <div className="bg-card/80 rounded-lg p-4 border">
                      <div className="text-sm text-muted-foreground mb-1">Growth Rate</div>
                      <div className="text-lg font-bold text-primary">
                        {content.industryInsights.extractedStats.growthRate}
                      </div>
                    </div>
                  )}
                  {content.industryInsights.extractedStats.customerCount && (
                    <div className="bg-card/80 rounded-lg p-4 border">
                      <div className="text-sm text-muted-foreground mb-1">Market Activity</div>
                      <div className="text-lg font-bold text-primary">
                        {content.industryInsights.extractedStats.customerCount}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Market Stats */}
              <div className="space-y-2">
                {content.industryInsights.stats.slice(0, 3).map((stat: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <p>{stat}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Value Propositions */}
            {content.industryInsights.valueProps && content.industryInsights.valueProps.length > 0 && (
              <div className="p-6 bg-card rounded-lg border">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  💎 Why Choose Professional Service
                </h4>
                <div className="space-y-3">
                  {content.industryInsights.valueProps.map((prop: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                      <p className="text-sm">{prop}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pain Points / Industry Facts */}
            {content.industryInsights.facts && content.industryInsights.facts.length > 0 && (
              <div className="p-6 bg-card rounded-lg border">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  ⚠️ Industry Insights
                </h4>
                <div className="space-y-3">
                  {content.industryInsights.facts.map((fact: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-orange-600 dark:text-orange-400">►</span>
                      <p className="text-sm text-muted-foreground">{fact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Credentials */}
            {content.industryInsights.credentials && content.industryInsights.credentials.length > 0 && (
              <div className="p-6 bg-accent/20 rounded-lg border">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  🏆 Professional Standards
                </h4>
                <div className="space-y-2">
                  {content.industryInsights.credentials.map((cred: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-blue-600 dark:text-blue-400">✦</span>
                      <p className="text-sm">{cred}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {content.recentActivity && content.recentActivity.length > 0 && (
          <div className="mt-8 p-6 bg-card rounded-lg border">
            <div className="flex items-center gap-2 mb-4 text-sm font-medium">
              <Clock className="w-4 h-4 text-secondary" />
              <span>Recent Activity</span>
            </div>
            <div className="space-y-3">
              {content.recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div>
                    <span className="font-medium">{activity.name}</span>
                    <span className="text-muted-foreground"> {activity.action}</span>
                    <span className="text-muted-foreground"> from {activity.location}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
