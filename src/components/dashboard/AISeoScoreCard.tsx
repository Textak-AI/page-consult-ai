import { motion } from 'framer-motion';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { AISeoScoreResult, AISeoScoreBreakdown } from '@/lib/calculateAISeoScore';
import { getScoreColor } from '@/lib/calculateAISeoScore';

interface AISeoScoreCardProps {
  score: AISeoScoreResult;
  isLoading?: boolean;
}

const categoryLabels: Record<keyof AISeoScoreBreakdown, string> = {
  schema: 'Schema Markup',
  faq: 'FAQ Content',
  authoritySignals: 'Authority Signals',
  contentStructure: 'Content Structure',
  queryAlignment: 'Query Alignment',
};

export function AISeoScoreCard({ score, isLoading = false }: AISeoScoreCardProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const colors = getScoreColor(score.overall);
  
  // Calculate SVG circle properties
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score.overall / 100) * circumference;
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Search className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-medium text-white">AI Discoverability</h3>
      </div>
      
      {/* Circular Progress Ring */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <svg className="w-36 h-36 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-slate-700"
            />
            {/* Progress circle */}
            <motion.circle
              cx="72"
              cy="72"
              r={radius}
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: isLoading ? circumference : strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                strokeDasharray: circumference,
              }}
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className={`stop-color: ${colors.text.replace('text-', '')}`} stopColor={score.overall >= 80 ? '#22d3ee' : score.overall >= 50 ? '#fbbf24' : '#f87171'} />
                <stop offset="100%" stopColor={score.overall >= 80 ? '#06b6d4' : score.overall >= 50 ? '#f59e0b' : '#ef4444'} />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Score number in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 w-12 bg-slate-600 rounded" />
              </div>
            ) : (
              <>
                <motion.span 
                  className={`text-3xl font-bold ${colors.text}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {score.overall}
                </motion.span>
                <span className="text-sm text-slate-400">/100</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <p className="text-center text-slate-400 text-sm mb-6">AI Discoverability Score</p>
      
      {/* Category Breakdown */}
      <div className="space-y-3">
        {(Object.entries(score.breakdown) as [keyof AISeoScoreBreakdown, typeof score.breakdown.schema][]).map(([key, category]) => {
          const percentage = (category.score / category.max) * 100;
          const isExpanded = expandedCategory === key;
          const catColors = getScoreColor(percentage);
          
          return (
            <div key={key}>
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : key)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-300">{categoryLabels[key]}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${catColors.text}`}>
                      {category.score}/{category.max}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${catColors.gradient} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
              </button>
              
              {/* Expanded details */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 pl-2 border-l-2 border-slate-700"
                >
                  <p className="text-sm text-slate-400">{category.details}</p>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
