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
    <section id="features" className="py-20 bg-slate-100">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Is This For You?
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* This IS for you */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                PageConsult is for you if...
              </h3>
            </div>

            <ul className="space-y-4">
              {forYouItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* This is NOT for you */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
                <X className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                This probably isn't for you if...
              </h3>
            </div>

            <ul className="space-y-4">
              {notForYouItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-500">{item}</span>
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
