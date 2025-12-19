import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Recommendation } from '@/lib/calculateAISeoScore';
import { getPriorityStyles } from '@/lib/calculateAISeoScore';

interface AISeoRecommendationsProps {
  recommendations: Recommendation[];
  onAutoFix?: (recommendation: Recommendation) => Promise<void>;
  isApplyingFix?: string | null;
}

const categoryIcons: Record<Recommendation['category'], string> = {
  schema: '🏗️',
  faq: '❓',
  authority: '🏆',
  content: '📝',
  queries: '🔍',
};

export function AISeoRecommendations({ 
  recommendations, 
  onAutoFix,
  isApplyingFix 
}: AISeoRecommendationsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  if (recommendations.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-medium text-white">Recommendations</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-slate-300 font-medium">Perfect Score!</p>
          <p className="text-sm text-slate-400 mt-1">
            Your page is fully optimized for AI discoverability.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-medium text-white">Recommendations</h3>
        </div>
        <span className="text-sm text-slate-400">
          {recommendations.length} improvement{recommendations.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="space-y-3">
        {recommendations.map((rec) => {
          const priorityStyles = getPriorityStyles(rec.priority);
          const isExpanded = expandedId === rec.id;
          const isApplying = isApplyingFix === rec.id;
          
          return (
            <motion.div
              key={rec.id}
              layout
              className="bg-slate-900/50 border border-slate-700/30 rounded-lg overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{categoryIcons[rec.category]}</span>
                      <h4 className="font-medium text-white">{rec.title}</h4>
                    </div>
                    <p className="text-sm text-slate-400">{rec.description}</p>
                  </div>
                  
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityStyles.bg} ${priorityStyles.text}`}>
                    {rec.priority}
                  </span>
                </div>
                
                {/* Current vs Suggested values */}
                {(rec.currentValue || rec.suggestedValue) && (
                  <div className="mt-3 space-y-2">
                    {rec.currentValue && (
                      <div className="text-sm">
                        <span className="text-slate-500">Current: </span>
                        <span className="text-slate-300 italic">"{rec.currentValue}"</span>
                      </div>
                    )}
                    {rec.suggestedValue && (
                      <div className="text-sm">
                        <span className="text-cyan-400">Suggested: </span>
                        <span className="text-slate-300">{rec.suggestedValue}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  {rec.autoFixAvailable && onAutoFix && (
                    <Button
                      size="sm"
                      onClick={() => onAutoFix(rec)}
                      disabled={isApplying}
                      className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white border-0"
                    >
                      {isApplying ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Fixing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 mr-1" />
                          Auto-fix
                        </>
                      )}
                    </Button>
                  )}
                  
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                    className="text-sm text-slate-400 hover:text-slate-300 flex items-center gap-1"
                  >
                    Learn more
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Expanded learn more section */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-700/30 bg-slate-900/30"
                  >
                    <div className="p-4 text-sm text-slate-400">
                      {getLearnMoreContent(rec)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function getLearnMoreContent(rec: Recommendation): string {
  const categoryContent: Record<Recommendation['category'], string> = {
    schema: 'Schema markup helps AI assistants understand the structure of your business. It provides context about your entity type, services, location, and credentials in a machine-readable format.',
    faq: 'FAQ sections are highly valued by AI assistants because they directly answer user questions. Each FAQ item creates an opportunity for your content to be cited when users ask similar questions.',
    authority: 'Authority signals like statistics, credentials, and testimonials help AI assistants evaluate your expertise. Specific, verifiable claims are more likely to be cited than vague statements.',
    content: 'Content structure affects how easily AI assistants can extract and cite your information. Direct, answer-first headlines and specific claims improve discoverability.',
    queries: 'Query alignment ensures your page content matches what people actually ask AI assistants. Targeting both informational and transactional queries increases your citation potential.',
  };
  
  return categoryContent[rec.category];
}
