import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Edit3, RotateCcw, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
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
        <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-cyan-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Your Strategy Brief</h1>
        <p className="text-slate-400">
          Review the strategic foundation for your landing page. Edit anything that doesn't feel right.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8"
      >
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editedBrief}
              onChange={(e) => setEditedBrief(e.target.value)}
              className="w-full h-[500px] bg-slate-900 border border-slate-600 rounded-xl p-4 text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsEditing(false)} className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white">
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-cyan-400 mt-0 mb-6">{children}</h1>
                ),
                h2: ({ children }) => (
                  <div className="flex items-center gap-3 mt-8 mb-4 first:mt-0">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-cyan-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white m-0">{children}</h2>
                  </div>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-medium text-slate-200 mt-5 mb-2 pl-11">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-slate-400 mb-3 leading-relaxed pl-11">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-2 mb-4 pl-11">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="space-y-2 mb-4 pl-11 list-decimal list-inside">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-slate-400 flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span>{children}</span>
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="text-white font-semibold">{children}</strong>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-cyan-500 pl-4 ml-11 italic text-slate-400 my-4 bg-cyan-500/5 py-3 pr-4 rounded-r-lg">
                    {children}
                  </blockquote>
                ),
                // Hide code blocks - they're not useful for reviewing
                pre: () => null,
                code: ({ className, children, ...props }) => {
                  const isInline = !className;
                  if (isInline) {
                    return <code className="bg-slate-800 px-1.5 py-0.5 rounded text-sm text-cyan-300" {...props}>{children}</code>;
                  }
                  // Hide block-level code
                  return null;
                },
                // Add visual separators between major sections
                hr: () => (
                  <div className="my-6 border-t border-slate-700" />
                ),
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
          variant="outline"
          onClick={onRestart}
          className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Start Over
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setIsEditing(true)}
          className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Brief
        </Button>
        
        <Button
          onClick={onApprove}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Approve & Generate Page
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
