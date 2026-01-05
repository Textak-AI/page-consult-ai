import { motion } from 'framer-motion';
import { Download, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface StrategyBrief {
  id: string;
  businessName: string;
  completionScore: number;
  
  positioning: {
    statement: string;
    tagline?: string;
  };
  
  audience: {
    description: string;
    painPoints: string[];
    desiredOutcome: string;
  };
  
  differentiator: {
    primary: string;
    supporting?: string[];
  };
  
  credibility: {
    hasProof: boolean;
    clientCount?: string;
    keyResults?: string[];
    testimonial?: {
      quote: string;
      attribution: string;
    };
  };
  
  messaging: {
    headline: string;
    subheadline: string;
    valueProps?: string[];
  };
  
  structure: {
    sections: string[];
    reasoning: string;
  };
}

interface StrategyBriefViewProps {
  brief: StrategyBrief;
  onDownloadPDF: () => void;
  onBuildPage: () => void;
  onAddProof?: () => void;
}

function BriefCard({ 
  title, 
  children, 
  delay = 0,
  complete = true,
  warning = false
}: { 
  title: string; 
  children: React.ReactNode;
  delay?: number;
  complete?: boolean;
  warning?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-card/50 border border-border rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
        {complete && !warning && (
          <CheckCircle className="w-4 h-4 text-emerald-400" />
        )}
        {warning && (
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        )}
      </div>
      {children}
    </motion.div>
  );
}

export function StrategyBriefView({ 
  brief, 
  onDownloadPDF, 
  onBuildPage,
  onAddProof 
}: StrategyBriefViewProps) {
  
  const scoreColor = brief.completionScore >= 95 
    ? 'text-emerald-400' 
    : brief.completionScore >= 85 
      ? 'text-primary' 
      : 'text-amber-400';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Your Strategy Brief
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            {brief.businessName}
          </p>
          <div className={`inline-flex items-center gap-2 ${scoreColor}`}>
            {brief.completionScore >= 85 ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            {brief.completionScore}% Ready
          </div>
        </motion.div>

        {/* Brief Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          
          {/* Positioning */}
          <BriefCard title="Positioning" delay={0.1}>
            <p className="text-lg text-foreground font-medium leading-relaxed">
              "{brief.positioning.statement}"
            </p>
            {brief.positioning.tagline && (
              <p className="text-sm text-muted-foreground mt-3">
                Tagline: {brief.positioning.tagline}
              </p>
            )}
          </BriefCard>

          {/* Target Audience */}
          <BriefCard title="Target Audience" delay={0.2}>
            <p className="text-foreground mb-3">{brief.audience.description}</p>
            {brief.audience.painPoints.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Pain Points</p>
                <div className="space-y-1">
                  {brief.audience.painPoints.map((point, i) => (
                    <p key={i} className="text-sm text-muted-foreground">• {point}</p>
                  ))}
                </div>
              </div>
            )}
          </BriefCard>

          {/* Differentiator */}
          <BriefCard title="Key Differentiator" delay={0.3}>
            <p className="text-foreground">{brief.differentiator.primary}</p>
          </BriefCard>

          {/* Proof & Credibility */}
          <BriefCard 
            title="Proof & Credibility" 
            delay={0.4} 
            complete={brief.credibility.hasProof}
            warning={!brief.credibility.hasProof}
          >
            {brief.credibility.hasProof ? (
              <>
                {brief.credibility.clientCount && (
                  <p className="text-foreground mb-2">{brief.credibility.clientCount}</p>
                )}
                {brief.credibility.keyResults?.map((result, i) => (
                  <p key={i} className="text-sm text-muted-foreground">• {result}</p>
                ))}
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-amber-400 text-sm mb-3">
                  Missing — add client results to strengthen your page
                </p>
                {onAddProof && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAddProof}
                  >
                    Add proof now
                  </Button>
                )}
              </div>
            )}
          </BriefCard>
        </div>

        {/* Recommended Messaging - Full Width */}
        <BriefCard title="Recommended Messaging" delay={0.5}>
          <p className="text-2xl font-bold text-foreground mb-2">
            {brief.messaging.headline}
          </p>
          <p className="text-lg text-muted-foreground">
            {brief.messaging.subheadline}
          </p>
        </BriefCard>

        {/* Page Structure - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-card/50 border border-border rounded-xl p-6 mt-6"
        >
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Recommended Page Structure
          </h3>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {brief.structure.sections.map((section, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-muted rounded-full text-sm text-foreground">
                  {section}
                </span>
                {i < brief.structure.sections.length - 1 && (
                  <span className="text-muted-foreground">→</span>
                )}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {brief.structure.reasoning}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
        >
          <Button
            variant="outline"
            onClick={onDownloadPDF}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          
          <Button
            onClick={onBuildPage}
            className="bg-gradient-to-r from-primary to-secondary text-primary-foreground"
          >
            Build My Landing Page
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>

      </div>
    </div>
  );
}
