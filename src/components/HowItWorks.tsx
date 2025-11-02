import { MessageCircle, Zap, Target } from "lucide-react";

const steps = [
  {
    icon: MessageCircle,
    number: "1",
    title: "Smart Questions",
    description:
      "AI asks about your business, audience, and goals—like a consultant, not a form.",
  },
  {
    icon: Zap,
    number: "2",
    title: "Instant Generation",
    description:
      "Watch your page build in real-time with custom content and conversion features.",
  },
  {
    icon: Target,
    number: "3",
    title: "Publish & Optimize",
    description:
      "Customize anything, add your branding, and launch with one click. AI suggests improvements weekly.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            From Strategy to Launch in 10 Minutes
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-card rounded-2xl p-8 shadow-lg hover-lift animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm shadow-md">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
