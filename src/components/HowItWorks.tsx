import { MessageCircle, Zap, Target } from "lucide-react";

const steps = [
  {
    icon: MessageCircle,
    number: "01",
    title: "Smart Discovery",
    description:
      "Have a conversation with our AI strategist. It extracts positioning, audience insights, and competitive angles in real-time.",
    gradient: "from-purple-500 to-purple-600",
    glowColor: "purple",
  },
  {
    icon: Zap,
    number: "02",
    title: "Instant Generation",
    description:
      "Your strategy brief transforms into a conversion-optimized page. Every section built on what you shared.",
    gradient: "from-cyan-500 to-cyan-600",
    glowColor: "cyan",
  },
  {
    icon: Target,
    number: "03",
    title: "Publish & Optimize",
    description:
      "Go live instantly or refine with AI assistance. Built-in analytics show what's converting.",
    gradient: "from-emerald-500 to-emerald-600",
    glowColor: "emerald",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <p className="text-cyan-400 text-sm font-semibold tracking-wide uppercase mb-3">
            The Process
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            From Strategy to Launch in{" "}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              10 Minutes
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const glowClasses = {
              purple: "from-purple-500/30 group-hover:opacity-100",
              cyan: "from-cyan-500/30 group-hover:opacity-100",
              emerald: "from-emerald-500/30 group-hover:opacity-100",
            };
            const shadowClasses = {
              purple: "hover:shadow-purple-500/20",
              cyan: "hover:shadow-cyan-500/20",
              emerald: "hover:shadow-emerald-500/20",
            };
            const accentClasses = {
              purple: "via-purple-500/50",
              cyan: "via-cyan-500/50",
              emerald: "via-emerald-500/50",
            };
            
            return (
              <div
                key={step.number}
                className="group relative animate-scale-in h-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Hover glow */}
                <div className={`absolute -inset-px bg-gradient-to-b ${glowClasses[step.glowColor as keyof typeof glowClasses]} to-transparent rounded-3xl opacity-0 transition-opacity duration-500 blur-xl`} />
                
                <div className={`relative h-full flex flex-col bg-slate-900/80 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-xl shadow-black/20 hover:shadow-2xl ${shadowClasses[step.glowColor as keyof typeof shadowClasses]} transition-all duration-500 hover:-translate-y-1`}>
                  {/* Step number with gradient ring */}
                  <div className="w-16 h-16 mb-6 relative flex-shrink-0">
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-2xl opacity-20`} />
                    <div className="absolute inset-[2px] bg-slate-900 rounded-2xl flex items-center justify-center">
                      <span className={`text-2xl font-bold bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent`}>
                        {step.number}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed flex-grow">
                    {step.description}
                  </p>
                  
                  {/* Subtle bottom accent */}
                  <div className={`absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent ${accentClasses[step.glowColor as keyof typeof accentClasses]} to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
