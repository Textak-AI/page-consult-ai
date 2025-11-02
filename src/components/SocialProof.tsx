const stats = [
  {
    number: "302,000+",
    label: "Pages Created",
  },
  {
    number: "85%",
    label: "Average Conversion Rate",
  },
  {
    number: "10 min",
    label: "Average Build Time",
  },
];

const SocialProof = () => {
  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Trusted by Businesses Building Better Pages
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-5xl font-bold text-secondary mb-2">
                {stat.number}
              </div>
              <div className="text-lg text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto bg-card rounded-2xl p-8 shadow-xl animate-slide-up">
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
