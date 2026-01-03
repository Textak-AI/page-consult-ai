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
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.05),transparent_50%)]" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <p className="text-purple-600 text-sm font-semibold tracking-wide uppercase mb-3">
            The Process
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
            From Strategy to Launch in{" "}
            <span className="bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
              10 Minutes
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const glowClasses = {
              purple: "from-purple-500/20 group-hover:opacity-100",
              cyan: "from-cyan-500/20 group-hover:opacity-100",
              emerald: "from-emerald-500/20 group-hover:opacity-100",
            };
            const shadowClasses = {
              purple: "hover:shadow-purple-500/10",
              cyan: "hover:shadow-cyan-500/10",
              emerald: "hover:shadow-emerald-500/10",
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
                
                <div className={`relative h-full flex flex-col bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl ${shadowClasses[step.glowColor as keyof typeof shadowClasses]} transition-all duration-500 hover:-translate-y-1`}>
                  {/* Step number with gradient ring */}
                  <div className="w-16 h-16 mb-6 relative flex-shrink-0">
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-2xl opacity-10`} />
                    <div className="absolute inset-[2px] bg-white rounded-2xl flex items-center justify-center">
                      <span className={`text-2xl font-bold bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent`}>
                        {step.number}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed flex-grow">
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
