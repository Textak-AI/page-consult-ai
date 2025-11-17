import { Bot, Calculator, TrendingUp, Zap, Smartphone, DollarSign } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Strategy",
    description: "Not templates—intelligent consultation based on your business",
  },
  {
    icon: Calculator,
    title: "Built-in Calculators",
    description: "ROI, pricing, savings calculators proven to boost conversions 40%+",
  },
  {
    icon: TrendingUp,
    title: "Conversion Optimized",
    description: "Every element backed by data and best practices",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "10 minutes from idea to published page",
  },
  {
    icon: Smartphone,
    title: "Mobile Perfect",
    description: "Responsive design automatically—looks perfect everywhere",
  },
  {
    icon: DollarSign,
    title: "Fair Pricing",
    description: "$47-397/mo vs $20K+ custom development",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What Makes PageConsult Different
          </h2>
          <p className="text-lg text-gray-400">
            Professional name. Powerful features. Beautiful design.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-cyan-400/30 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/10 animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:from-cyan-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                  <Icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
