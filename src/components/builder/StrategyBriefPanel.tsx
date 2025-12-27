import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, ChevronRight, Sparkles, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { StrategyBriefEditor } from '@/components/strategy-brief/StrategyBriefEditor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  brief: string | null;
  businessName?: string;
  consultationData?: any;
  consultationId?: string;
  onDataUpdated?: (data: any) => void;
  onRegenerate?: (data: any) => Promise<void>;
}

export function StrategyBriefPanel({ 
  brief, 
  businessName, 
  consultationData,
  consultationId,
  onDataUpdated,
  onRegenerate 
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  if (!brief) return null;

  const handleSave = async (updatedData: any) => {
    if (!consultationId) {
      toast.error('Cannot save: No consultation ID');
      return;
    }

    try {
      const { error } = await supabase
        .from('consultations')
        .update({
          industry: updatedData.industry,
          target_audience: updatedData.idealClient,
          unique_value: updatedData.uniqueStrength,
          offer: updatedData.primaryCTA,
          audience_pain_points: updatedData.audiencePainPoints,
          audience_goals: updatedData.audienceGoals,
          key_benefits: updatedData.keyBenefits,
          competitor_differentiator: updatedData.competitorDifferentiator,
          authority_markers: updatedData.authorityMarkers,
          credentials: updatedData.credentials,
          client_count: updatedData.clientCount,
          case_study_highlight: updatedData.caseStudyHighlight,
          guarantee_offer: updatedData.guaranteeOffer,
          risk_reversals: updatedData.riskReversals,
          primary_cta: updatedData.primaryCTA,
          secondary_cta: updatedData.secondaryCTA,
          urgency_angle: updatedData.urgencyAngle,
          business_name: updatedData.businessName,
          website_url: updatedData.websiteUrl,
        })
        .eq('id', consultationId);

      if (error) throw error;

      toast.success('Strategy brief saved');
      onDataUpdated?.(updatedData);
    } catch (err) {
      console.error('Failed to save brief:', err);
      toast.error('Failed to save changes');
    }
  };

  const handleRegenerate = async (updatedData: any) => {
    await handleSave(updatedData);
    if (onRegenerate) {
      await onRegenerate(updatedData);
    } else {
      toast.info('Page regeneration not available');
    }
  };

  return (
    <>
      {/* Toggle Button - Fixed position on right edge */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-r from-primary to-accent text-primary-foreground px-3 py-4 rounded-l-xl shadow-lg hover:from-primary/90 hover:to-accent/90 transition-all group"
        whileHover={{ x: -4 }}
        title="View Strategy Brief"
      >
        <div className="flex flex-col items-center gap-2">
          <FileText className="w-5 h-5" />
          <span className="text-xs font-medium [writing-mode:vertical-rl] [text-orientation:mixed]">
            Strategy Brief
          </span>
        </div>
      </motion.button>

      {/* Slide-out Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-xl bg-background border-l border-border shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-border flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Strategy Brief</h2>
                      {businessName && (
                        <p className="text-sm text-muted-foreground">{businessName}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Brief Content */}
              <div className="flex-1 overflow-auto p-6">
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-bold text-foreground mt-0 mb-4">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <div className="flex items-center gap-2 text-lg font-semibold text-foreground mt-6 mb-3 pb-2 border-b border-border">
                          <ChevronRight className="w-4 h-4 text-primary" />
                          {children}
                        </div>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base font-medium text-foreground mt-4 mb-2">{children}</h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-muted-foreground mb-3 leading-relaxed">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="space-y-2 mb-4 ml-4">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="space-y-2 mb-4 ml-4 list-decimal">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-muted-foreground before:content-['•'] before:text-primary before:mr-2">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="text-foreground font-semibold">{children}</strong>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">{children}</code>
                      ),
                    }}
                  >
                    {brief}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Footer with Edit Button */}
              <div className="p-4 border-t border-border flex-shrink-0 bg-muted/30">
                {consultationData && (
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      setIsEditorOpen(true);
                    }}
                    className="w-full mb-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Strategy Brief
                  </Button>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  This brief was generated from your consultation. Use it as a guide while editing your page.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Strategy Brief Editor */}
      {consultationData && (
        <StrategyBriefEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          consultationData={consultationData}
          onSave={handleSave}
          onRegenerate={handleRegenerate}
        />
      )}
    </>
  );
}
