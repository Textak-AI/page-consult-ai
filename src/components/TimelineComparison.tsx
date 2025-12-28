import { Clock, DollarSign, Zap, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TimelineComparison = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.03)_0%,transparent_70%)]" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16 animate-fade-in">
          <p className="text-primary font-medium mb-3 tracking-wide uppercase text-sm">
            The ROI Math
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Weeks to Hours. Thousands to Dozens.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Same strategic depth. Fraction of the time and cost.
          </p>
        </div>

        {/* Comparison cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Traditional Agency */}
          <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 opacity-75">
            <div className="absolute top-4 right-4">
              <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                Traditional
              </span>
            </div>
            
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Typical Agency Process
            </h3>
            
            <div className="space-y-6">
              {/* Timeline */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">3-6 weeks</p>
                  <p className="text-muted-foreground">Discovery, briefs, revisions, approvals</p>
                </div>
              </div>
              
              {/* Cost */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">$5,000 - $15,000</p>
                  <p className="text-muted-foreground">Per landing page, plus revisions</p>
                </div>
              </div>

              {/* Pain points */}
              <div className="pt-4 border-t border-border/50 space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <XCircle className="w-5 h-5 text-destructive/70" />
                  <span>Wait weeks to validate your messaging</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <XCircle className="w-5 h-5 text-destructive/70" />
                  <span>Competitor launches while you're in revisions</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <XCircle className="w-5 h-5 text-destructive/70" />
                  <span>One page = one chance (expensive to iterate)</span>
                </div>
              </div>
            </div>
          </div>

          {/* PageConsult */}
          <div className="relative bg-gradient-to-br from-primary/10 via-card to-secondary/10 rounded-2xl p-8 border-2 border-primary/30 shadow-lg shadow-primary/5">
            <div className="absolute top-4 right-4">
              <span className="text-xs font-medium text-primary-foreground bg-primary px-3 py-1 rounded-full">
                PageConsult
              </span>
            </div>
            
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              AI-Powered Strategy
              <Zap className="w-5 h-5 text-primary" />
            </h3>
            
            <div className="space-y-6">
              {/* Timeline */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">30 minutes</p>
                  <p className="text-muted-foreground">From consultation to live page</p>
                </div>
              </div>
              
              {/* Cost */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">$99/month</p>
                  <p className="text-muted-foreground">Unlimited pages & iterations</p>
                </div>
              </div>

              {/* Benefits */}
              <div className="pt-4 border-t border-primary/20 space-y-3">
                <div className="flex items-center gap-3 text-foreground">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Live and collecting data in hours, not weeks</span>
                </div>
                <div className="flex items-center gap-3 text-foreground">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Iterate freely — test 10 variations for the cost of one</span>
                </div>
                <div className="flex items-center gap-3 text-foreground">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Every section maps to conversion principles</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="text-left">
              <p className="text-lg font-semibold text-foreground">
                Stop waiting. Start validating.
              </p>
              <p className="text-muted-foreground">
                Your competitor isn't waiting 6 weeks for their agency.
              </p>
            </div>
            <Button 
              size="lg" 
              onClick={() => navigate('/wizard')}
              className="group whitespace-nowrap"
            >
              Build Your Page Now
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimelineComparison;
