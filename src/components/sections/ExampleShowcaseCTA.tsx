import { Button } from '@/components/ui/button';
import { 
  ArrowRight, FileText, Monitor, CheckCircle2, 
  Sparkles, Clock, Target, Users, Building2,
  ExternalLink, Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface ExampleData {
  companyName: string;
  industry: string;
  audience: string;
  goal: string;
  keyInsight: string;
  heroHeadline: string;
  heroSubhead: string;
  pageFeatures: string[];
  briefUrl?: string;
  pageUrl?: string;
  thumbnailUrl?: string;
}

const EXAMPLE_DATA: ExampleData = {
  companyName: "TechFlow Solutions",
  industry: "B2B SaaS",
  audience: "Operations Directors at mid-market companies",
  goal: "Generate qualified demo requests",
  keyInsight: "Operations Directors are measured on efficiency metrics — your page needs to show time savings in their language, not yours.",
  heroHeadline: "Cut Manual Workflows by 10 Hours/Week",
  heroSubhead: "Operations teams at 200+ companies use TechFlow to automate the busywork.",
  pageFeatures: [
    "Strategy-driven headline (not generic)",
    "ROI calculator showing hours saved",
    "Trust signals targeting Ops Directors",
    "Low-friction 'See Demo' CTA"
  ],
  briefUrl: "/examples/techflow-brief",
  pageUrl: "/examples/techflow-page",
  thumbnailUrl: undefined
};

interface Props {
  example?: ExampleData;
}

export function ExampleShowcaseCTA({ 
  example = EXAMPLE_DATA 
}: Props) {
  
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Clock className="w-4 h-4" />
            10-minute process
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            See What You'll Get
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A real strategy brief and landing page — generated from our AI consultation process
          </p>
        </div>
        
        {/* Example Showcase Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl mb-12">
          <div className="p-6 lg:p-8">
            
            {/* Company Header */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                {example.companyName.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-lg">{example.companyName}</h3>
                <p className="text-sm text-muted-foreground">{example.industry} • {example.goal}</p>
              </div>
              <div className="hidden sm:block">
                <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full text-xs font-medium">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Live Example
                </span>
              </div>
            </div>
            
            {/* Two Column Content */}
            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* Left: Strategy Brief Preview */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-primary font-medium">
                  <FileText className="w-5 h-5" />
                  Strategy Brief
                </div>
                
                <div className="bg-muted/50 rounded-xl p-5 space-y-5">
                  {/* Brief Fields */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Building2 className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Industry</p>
                        <p className="text-sm text-foreground font-medium">{example.industry}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Users className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Target Audience</p>
                        <p className="text-sm text-foreground font-medium">{example.audience}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Target className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Page Goal</p>
                        <p className="text-sm text-foreground font-medium">{example.goal}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Key Insight */}
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-medium mb-2">
                      💡 AI Strategic Insight
                    </div>
                    <p className="text-sm text-foreground italic leading-relaxed">
                      "{example.keyInsight}"
                    </p>
                  </div>
                  
                  {/* View Brief Button */}
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={example.briefUrl || '#'}>
                      View Full Strategy Brief
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Right: Generated Page Preview */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-primary font-medium">
                  <Monitor className="w-5 h-5" />
                  Generated Page
                </div>
                
                {/* Page Thumbnail */}
                <div className="relative group">
                  <div className="bg-gradient-to-br from-muted to-muted/50 rounded-xl overflow-hidden aspect-[16/10] flex items-center justify-center border border-border">
                    {example.thumbnailUrl ? (
                      <img 
                        src={example.thumbnailUrl} 
                        alt={`${example.companyName} landing page preview`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="p-6 text-center">
                        <h4 className="text-lg font-bold text-foreground mb-2">
                          {example.heroHeadline}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {example.heroSubhead}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Hover overlay with play */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center cursor-pointer">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                </div>
                
                {/* Page Features */}
                <div className="space-y-2">
                  {example.pageFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {/* View Page Button */}
                <Button variant="outline" className="w-full" asChild>
                  <Link to={example.pageUrl || '#'}>
                    View Live Page
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Footer Quote */}
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-muted-foreground text-sm">
                This page was generated in 10 minutes from a strategic consultation. 
                <span className="text-foreground font-medium"> No templates. No guesswork.</span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Primary CTA */}
        <div className="text-center space-y-6">
          <Button size="lg" className="h-14 px-8 text-lg" asChild>
            <Link to="/new">
              <Sparkles className="w-5 h-5 mr-2" />
              Start Your Free Consultation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              10 minutes start to finish
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Full page + strategy brief
            </span>
          </div>
        </div>
        
      </div>
    </section>
  );
}
