import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface CitedStat {
  statistic: string;
  claim: string;
  source: string;
  year: number;
  fullCitation: string;
}

const SocialProof = () => {
  const [stats, setStats] = useState<CitedStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMarketStats();
  }, []);

  const fetchMarketStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('perplexity-research', {
        body: {
          service: 'landing page optimization and conversion rate optimization',
          industry: 'Digital Marketing',
          concerns: 'conversion rates, page effectiveness, lead generation',
        }
      });

      if (error || !data?.success) {
        console.log('Using fallback stats');
        setStats([]);
      } else {
        // Use the top 3 most impactful stats
        setStats(data.allClaims?.slice(0, 3) || []);
      }
    } catch (error) {
      console.error('Error fetching market stats:', error);
      setStats([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Why Professional Landing Pages Matter
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real market data on landing page effectiveness
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : stats.length > 0 ? (
          <>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {stats.map((stat, index) => {
                // Extract additional context from the claim
                const getStatContext = (claim: string) => {
                  // Try to split claim into main point and context
                  const parts = claim.split(/(?:,|;|\s-\s)/);
                  if (parts.length > 1) {
                    return {
                      main: parts[0].trim(),
                      context: parts.slice(1).join(', ').trim()
                    };
                  }
                  return { main: claim, context: '' };
                };

                const { main, context } = getStatContext(stat.claim);

                return (
                  <div
                    key={index}
                    className="animate-scale-in bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="text-center mb-4">
                      <div className="text-5xl font-bold text-primary mb-2">
                        {stat.statistic || 'N/A'}
                      </div>
                      <div className="text-base font-semibold text-foreground mb-2">
                        {main}
                      </div>
                      {context && (
                        <div className="text-sm text-muted-foreground mb-3">
                          {context}
                        </div>
                      )}
                    </div>
                    <cite className="text-xs text-muted-foreground/70 not-italic block text-center border-t border-border pt-3">
                      Source: {stat.fullCitation}
                    </cite>
                  </div>
                );
              })}
            </div>
            
            <div className="max-w-3xl mx-auto text-center mb-12 p-6 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-base text-foreground leading-relaxed">
                <strong>Why These Numbers Matter:</strong> Most businesses struggle with high bounce rates and limited landing pages due to cost and complexity. PageConsult AI ensures every page you create is optimized from the start—combining professional design, strategic messaging, and conversion-focused features based on real market insights.
              </p>
            </div>
          </>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center bg-card rounded-xl p-6 border border-border">
              <div className="text-5xl font-bold text-primary mb-3">10x</div>
              <div className="text-base text-foreground mb-3">
                Faster than traditional page builders
              </div>
              <p className="text-xs text-muted-foreground">AI-powered efficiency</p>
            </div>
            <div className="text-center bg-card rounded-xl p-6 border border-border">
              <div className="text-5xl font-bold text-primary mb-3">100%</div>
              <div className="text-base text-foreground mb-3">
                Tailored to your audience
              </div>
              <p className="text-xs text-muted-foreground">Consultation-driven approach</p>
            </div>
            <div className="text-center bg-card rounded-xl p-6 border border-border">
              <div className="text-5xl font-bold text-primary mb-3">24/7</div>
              <div className="text-base text-foreground mb-3">
                AI consultant availability
              </div>
              <p className="text-xs text-muted-foreground">Always ready to help</p>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto bg-card rounded-2xl p-8 shadow-xl animate-slide-up border border-border">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0"></div>
            <div className="flex-1">
              <p className="text-xl text-foreground leading-relaxed mb-4 italic">
                "PageConsult AI transformed how we approach landing pages. The AI consultation ensured we built exactly what our customers needed, not just another template."
              </p>
              <div>
                <div className="font-semibold text-foreground">Sarah Chen</div>
                <div className="text-sm text-muted-foreground">
                  Head of Marketing, TechFlow Solutions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
