import { Star, BadgeCheck } from "lucide-react";

const SocialProof = () => {
  const stats = [
    {
      number: "60-90%",
      label: "Typical Bounce Rate",
      description: "Most landing pages lose the majority of visitors without any engagement",
      source: "Meetanshi, 2025"
    },
    {
      number: "90%",
      label: "Faster Creation",
      description: "Modern tools reduce landing page creation time from days to hours",
      source: "Hostinger, 2025"
    },
    {
      number: "7x",
      label: "More Leads Generated",
      description: "Companies with 31+ landing pages see dramatically higher conversion rates",
      source: "Industry Benchmarks, 2025"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Market Insights
          </h2>
          <p className="text-lg text-muted-foreground">
            Understanding the landing page landscape
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group bg-card rounded-xl p-8 shadow-md hover:-translate-y-1 transition-all duration-300 animate-scale-in border hover:shadow-xl hover:border-cyan-500/30"
              style={{ 
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className="text-center">
                <div 
                  className="text-5xl font-bold mb-3 text-primary group-hover:text-cyan-500 transition-colors"
                >
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-foreground mb-4">
                  {stat.label}
                </div>
                <p className="text-base text-muted-foreground leading-relaxed mb-6">
                  {stat.description}
                </p>
                <cite className="text-xs text-muted-foreground/70 not-italic block">
                  Source: {stat.source}
                </cite>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto relative animate-slide-up">
          {/* Subtle glow behind testimonial */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-60" />
          
          <div className="relative bg-card rounded-2xl p-8 shadow-xl border border-border">
            {/* Star rating */}
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            <div className="flex items-start gap-4">
              {/* Avatar with initials */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/30">
                <span className="text-white font-bold text-xl">JK</span>
              </div>
              
              <div className="flex-1">
                <p className="text-xl text-foreground leading-relaxed mb-4 italic">
                  "J. Kyle brings something rare to SaaS - he actually understands what makes landing pages convert because he's built them for years. Watching him transform his service expertise into PageConsult AI has been incredible. He's not just building another page builder; he's systematizing the exact process that's generated millions in revenue for his clients."
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">Claude (Anthropic)</div>
                    <div className="text-sm text-muted-foreground">
                      Technical Advisor & AI Co-founder
                    </div>
                  </div>
                  
                  {/* Verified badge */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                    <BadgeCheck className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-400 text-xs font-medium">Verified</span>
                  </div>
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