import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Edit3, RotateCcw, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { AISeoPanel } from './AISeoPanel';
import type { ConsultationData } from './StrategicConsultation';
import type { AISeoData } from '@/services/intelligence/types';

interface Props {
  brief: string;
  consultationData: ConsultationData;
  aiSeoData?: AISeoData | null;
  onApprove: () => void;
  onEdit: (editedBrief: string) => void;
  onRestart: () => void;
}

export function StrategyBriefReview({ brief, consultationData, aiSeoData, onApprove, onEdit, onRestart }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBrief, setEditedBrief] = useState(brief);

  const handleSaveEdit = () => {
    onEdit(editedBrief);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Your Strategy Brief</h1>
        <p className="text-muted-foreground">
          Review the strategic foundation for your landing page. Edit anything that doesn't feel right.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-6 md:p-8"
      >
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editedBrief}
              onChange={(e) => setEditedBrief(e.target.value)}
              className="w-full h-[500px] bg-background border border-border rounded-xl p-4 text-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} className="bg-primary hover:bg-primary/90">
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-invert prose-slate max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold text-primary mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-medium text-foreground/90 mt-4 mb-2">{children}</h3>,
                p: ({ children }) => <p className="text-muted-foreground mb-3 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside text-muted-foreground space-y-1 mb-4">{children}</ol>,
                li: ({ children }) => <li className="text-muted-foreground">{children}</li>,
                strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">{children}</blockquote>,
              }}
            >
              {brief}
            </ReactMarkdown>
          </div>
        )}
      </motion.div>

      {/* AI SEO Panel */}
      <AISeoPanel aiSeoData={aiSeoData ?? null} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button
          variant="ghost"
          onClick={onRestart}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Start Over
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setIsEditing(true)}
          className="border-border text-foreground hover:bg-muted"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Brief
        </Button>
        
        <Button
          onClick={onApprove}
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-8"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Approve & Generate Page
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
