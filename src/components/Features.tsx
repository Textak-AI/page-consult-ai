import { Bot, Calculator, TrendingUp, Zap } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Strategy",
    description: "Not just page building — real strategic consultation. Our AI extracts positioning, identifies your competitive edge, and structures messaging that converts.",
    gradient: "from-purple-500 to-purple-600",
    borderColor: "border-purple-500/20",
    bgColor: "from-purple-500/10 to-purple-500/5",
    accentColor: "from-purple-500 via-cyan-500 to-purple-500",
    size: "large",
  },
  {
    icon: Calculator,
    title: "Built-in Calculators",
    description: "ROI calculators, savings estimators — interactive tools that qualify leads.",
    gradient: "from-cyan-500 to-cyan-600",
    borderColor: "border-cyan-500/20",
    bgColor: "from-cyan-500/10 to-cyan-500/5",
    accentColor: "from-cyan-500 to-cyan-400",
    size: "small",
  },
  {
    icon: TrendingUp,
    title: "Conversion Optimized",
    description: "Every section structured around proven conversion principles.",
    gradient: "from-emerald-500 to-emerald-600",
    borderColor: "border-emerald-500/20",
    bgColor: "from-emerald-500/10 to-emerald-500/5",
    accentColor: "from-emerald-500 to-emerald-400",
    size: "small",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "From first question to published page in under 10 minutes. Make changes with AI assistance instantly — no waiting for designers or developers.",
    gradient: "from-amber-500 to-orange-500",
    borderColor: "border-amber-500/20",
    bgColor: "from-amber-500/10 to-amber-500/5",
    accentColor: "from-amber-500 via-orange-500 to-amber-500",
    size: "large",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-slate-100 relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <p className="text-purple-600 text-sm font-semibold tracking-wide uppercase mb-3">
            Why PageConsult
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
            What Makes Us Different
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLarge = feature.size === "large";
            
            return (
              <div
                key={feature.title}
                className={`group animate-scale-in ${isLarge ? "md:col-span-2" : ""}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`h-full bg-white rounded-3xl ${isLarge ? "p-8" : "p-6"} border border-slate-200/80 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-500 relative overflow-hidden`}>
                  {/* Gradient accent on hover */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.accentColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  {isLarge ? (
                    <div className="flex items-start gap-6">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.bgColor} border ${feature.borderColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-7 h-7 bg-gradient-to-br ${feature.gradient} bg-clip-text`} style={{ color: feature.gradient.includes('purple') ? '#a855f7' : feature.gradient.includes('amber') ? '#f59e0b' : '#06b6d4' }} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-lg">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.bgColor} border ${feature.borderColor} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6" style={{ color: feature.gradient.includes('cyan') ? '#06b6d4' : '#10b981' }} />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
