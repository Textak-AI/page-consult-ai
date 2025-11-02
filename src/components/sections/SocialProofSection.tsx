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
    };
  };
  onUpdate: (content: any) => void;
}

export function SocialProofSection({ content }: SocialProofSectionProps) {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Trusted by Businesses</h2>
          <p className="text-muted-foreground">
            Join thousands of satisfied customers
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
          <div className="mb-12 p-6 bg-card rounded-lg border">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              📊 {content.industryInsights.title}
            </h3>
            <div className="space-y-3">
              {content.industryInsights.stats.map((stat: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">•</span>
                  <p className="text-sm">{stat}</p>
                </div>
              ))}
            </div>
            {content.industryInsights.facts && content.industryInsights.facts.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3">Key Industry Facts:</h4>
                <div className="space-y-2">
                  {content.industryInsights.facts.map((fact: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-secondary">✓</span>
                      <p className="text-sm text-muted-foreground">{fact}</p>
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
