const stats = [
  {
    number: "847",
    suffix: "",
    label: "Pages launched this month",
    glowColor: "purple",
  },
  {
    number: "8",
    suffix: "min",
    label: "Average time to publish",
    glowColor: "cyan",
  },
  {
    number: "4.2",
    suffix: "x",
    label: "Conversion vs DIY builders",
    glowColor: "emerald",
  },
];

const SocialProof = () => {
  return (
    <section className="py-20 bg-slate-950 border-y border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.08),transparent_70%)]" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const ringClasses = {
              purple: "group-hover:border-purple-500/30",
              cyan: "group-hover:border-cyan-500/30",
              emerald: "group-hover:border-emerald-500/30",
            };
            
            return (
              <div 
                key={index} 
                className="text-center group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative inline-block mb-4">
                  {/* Animated ring on hover */}
                  <div className={`absolute -inset-4 rounded-full border border-transparent ${ringClasses[stat.glowColor as keyof typeof ringClasses]} transition-all duration-500`} />
                  <p className="text-6xl md:text-7xl font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                    {stat.number}
                    {stat.suffix && (
                      <span className="text-4xl">{stat.suffix}</span>
                    )}
                  </p>
                </div>
                <p className="text-white/50 text-sm uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Credibility statement */}
        <div className="text-center pt-12 mt-12 border-t border-white/5">
          <p className="text-white/30 text-sm uppercase tracking-wide mb-4">
            Built by conversion specialists
          </p>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            PageConsult AI is built on 15+ years of landing page strategy 
            that's generated millions in revenue for clients.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
