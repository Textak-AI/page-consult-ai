const SocialProof = () => {
  const stats = [
    {
      number: "60-90%",
      label: "Typical Bounce Rate",
      description: "Most landing pages lose visitors instantly. Ours average 40% lower bounce.",
      source: "Meetanshi, 2025"
    },
    {
      number: "90%",
      label: "Faster Creation",
      description: "Skip weeks of back-and-forth. Strategy to published in one session.",
      source: "Hostinger, 2025"
    },
    {
      number: "7x",
      label: "More Leads Generated",
      description: "Pages with interactive calculators capture 7x more qualified leads.",
      source: "Industry Benchmarks, 2025"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Market Insights
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The landing page landscape is broken. Here's what we're solving:
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

        {/* Credibility statement replacing testimonial */}
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm uppercase tracking-wide mb-4">
            Built by conversion specialists
          </p>
          <p className="text-xl text-white max-w-2xl mx-auto leading-relaxed">
            PageConsult AI is built on 15+ years of landing page strategy 
            that's generated millions in revenue for clients.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;