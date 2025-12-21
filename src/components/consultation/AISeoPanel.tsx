import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronDown, 
  ChevronRight,
  CheckCircle, 
  AlertCircle, 
  Target, 
  MessageSquare,
  Building2,
  Sparkles,
  Quote,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { AISeoData } from '@/services/intelligence/types';

interface Props {
  aiSeoData: AISeoData | null;
  isLoading?: boolean;
}

export function AISeoPanel({ aiSeoData, isLoading = false }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMediumQueries, setShowMediumQueries] = useState(false);

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (score >= 60) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const highlightNumbers = (text: string) => {
    // Highlight numbers within the text
    return text.split(/(\d+[\d,.\-+%]*\+?)/g).map((part, i) => {
      if (/^\d/.test(part)) {
        return <span key={i} className="text-cyan-400 font-semibold">{part}</span>;
      }
      return part;
    });
  };

  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  const highPriorityQueries = aiSeoData?.queryTargets.filter(q => q.priority === 'high') || [];
  const mediumPriorityQueries = aiSeoData?.queryTargets.filter(q => q.priority === 'medium') || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm"
    >
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Search className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="font-medium text-white">AI Search Optimization</span>
        </div>
        
        <div className="flex items-center gap-3">
          {isLoading ? (
            <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Analyzing...
            </Badge>
          ) : aiSeoData ? (
            <Badge 
              variant="outline" 
              className={getScoreBadgeColor(aiSeoData.schemaReadiness.score)}
            >
              {aiSeoData.schemaReadiness.score}% Ready
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-slate-700/50 text-slate-400 border-slate-600">
              Not available
            </Badge>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-6">
              {!aiSeoData ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p>AI SEO analysis will appear here after processing</p>
                </div>
              ) : (
                <>
                  {/* Entity Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      Entity
                    </div>
                    <div className="space-y-2 pl-6">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-24">Entity Type</span>
                        <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                          {aiSeoData.entity.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-24">Industry</span>
                        <span className="text-sm text-slate-200">{aiSeoData.entity.industry}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-slate-400 w-24 flex-shrink-0">Description</span>
                        <span className="text-sm text-slate-300">{truncate(aiSeoData.entity.description, 160)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Authority Signals Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Authority Signals
                      <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600 ml-1">
                        {aiSeoData.authoritySignals.length} signals
                      </Badge>
                    </div>
                    <ul className="space-y-2 pl-6">
                      {aiSeoData.authoritySignals.map((signal, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-cyan-400 mt-0.5">•</span>
                          <span className="text-slate-300">{highlightNumbers(signal.optimized)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* FAQ Preview Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <MessageSquare className="w-4 h-4 text-cyan-400" />
                      FAQ Content
                      <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600 ml-1">
                        {aiSeoData.faqItems.length} items
                      </Badge>
                    </div>
                    <div className="space-y-3 pl-6">
                      {aiSeoData.faqItems.slice(0, 3).map((faq, i) => (
                        <div key={i} className="space-y-1">
                          <p className="text-sm font-medium text-slate-100">{faq.question}</p>
                          <p className="text-sm text-slate-400">{truncate(faq.answer, 100)}</p>
                        </div>
                      ))}
                      {aiSeoData.faqItems.length > 3 && (
                        <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                          View all {aiSeoData.faqItems.length} FAQs →
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Target Queries Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <Target className="w-4 h-4 text-cyan-400" />
                      Target Queries
                    </div>
                    <div className="space-y-3 pl-6">
                      {/* High Priority */}
                      {highPriorityQueries.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-medium text-amber-400">High Priority</span>
                          <ul className="space-y-1.5">
                            {highPriorityQueries.map((query, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                <span>{query.intent === 'informational' ? '🔍' : '💰'}</span>
                                <span>{query.query}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Medium Priority - Collapsible */}
                      {mediumPriorityQueries.length > 0 && (
                        <div className="space-y-2">
                          <button 
                            onClick={() => setShowMediumQueries(!showMediumQueries)}
                            className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-300 transition-colors"
                          >
                            {showMediumQueries ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            Medium Priority ({mediumPriorityQueries.length})
                          </button>
                          <AnimatePresence>
                            {showMediumQueries && (
                              <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-1.5 overflow-hidden"
                              >
                                {mediumPriorityQueries.map((query, i) => (
                                  <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                                    <span>{query.intent === 'informational' ? '🔍' : '💰'}</span>
                                    <span>{query.query}</span>
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Schema Readiness Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <CheckCircle className="w-4 h-4 text-cyan-400" />
                      Schema Readiness
                    </div>
                    <div className="pl-6 space-y-3">
                      <div className="flex items-center gap-3">
                        <Progress 
                          value={aiSeoData.schemaReadiness.score} 
                          className="flex-1 h-2 bg-slate-700"
                        />
                        <span className="text-sm font-medium text-slate-100 w-12 text-right">
                          {aiSeoData.schemaReadiness.score}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-xs font-medium text-emerald-400">Complete:</span>
                          <ul className="space-y-1">
                            {aiSeoData.schemaReadiness.complete.map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                                <CheckCircle className="w-3 h-3 text-emerald-400" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <span className="text-xs font-medium text-amber-400">Missing:</span>
                          <ul className="space-y-1">
                            {aiSeoData.schemaReadiness.missing.map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                                <AlertCircle className="w-3 h-3 text-amber-400" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
