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
    <section className="py-24 px-6 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Market Insights
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Understanding the landing page landscape
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-8 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-center">
                <div className="text-[64px] font-bold mb-3" style={{ color: '#78A22F' }}>
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-foreground mb-4">
                  {stat.label}
                </div>
                <p className="text-[15px] text-muted-foreground leading-relaxed mb-6">
                  {stat.description}
                </p>
                <cite className="text-xs text-muted-foreground/70 italic not-italic block">
                  Source: {stat.source}
                </cite>
              </div>
            </div>
          ))}
        </div>

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
