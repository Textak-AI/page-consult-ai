import { Check, X } from "lucide-react";

const forYouItems = [
  "You know your business but struggle to articulate it on a landing page",
  "You've wasted hours tweaking templates that still don't feel right",
  "You want strategy, not just a pretty page",
  "You'd rather talk through your business than drag boxes around",
  "You're launching something and need to move fast",
];

const notForYouItems = [
  "You want pixel-perfect control over every element",
  "You already have a design team and just need a builder",
  "You're building a complex multi-page website",
  "You prefer to start from a blank canvas",
  "You don't know what your business does yet",
];

const Features = () => {
  return (
    <section id="features" className="section-spacing bg-slate-900 relative overflow-hidden scroll-mt-16">
      {/* Subtle gradient orbs for depth */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <p className="text-cyan-400 text-sm font-semibold tracking-wide uppercase mb-3">
            Right Fit?
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Is This For You?
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* "For you" card — elevated with subtle glow */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-b from-emerald-500/20 to-emerald-500/0 rounded-3xl blur-sm opacity-60" />
            <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-emerald-500/20 shadow-xl h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  PageConsult is for you if...
                </h3>
              </div>

              <ul className="space-y-4">
                {forYouItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* "Not for you" card — muted but still polished */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-white/5 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-700/50 border border-white/10 flex items-center justify-center">
                <X className="w-5 h-5 text-white/40" />
              </div>
              <h3 className="text-xl font-semibold text-white/50">
                This probably isn't for you if...
              </h3>
            </div>

            <ul className="space-y-4">
              {notForYouItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-white/30 mt-0.5 flex-shrink-0" />
                  <span className="text-white/40">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
