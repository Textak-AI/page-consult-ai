import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AISeoScoreCard } from './AISeoScoreCard';
import { AISeoRecommendations } from './AISeoRecommendations';
import { calculateAISeoScore, type AISeoScoreResult, type Recommendation } from '@/lib/calculateAISeoScore';
import type { AISeoData } from '@/services/intelligence/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AISeoScoreDashboardProps {
  pageId: string;
  aiSeoData: AISeoData | null;
  pageContent?: {
    headline?: string;
    subheadline?: string;
    hasTestimonials?: boolean;
    testimonialCount?: number;
    sections?: Array<{ type: string; content?: unknown }>;
  };
  onScoreUpdate?: (score: number) => void;
}

export function AISeoScoreDashboard({ 
  pageId, 
  aiSeoData, 
  pageContent,
  onScoreUpdate 
}: AISeoScoreDashboardProps) {
  const [score, setScore] = useState<AISeoScoreResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(true);
  const [isApplyingFix, setIsApplyingFix] = useState<string | null>(null);
  
  const calculateScore = useCallback(() => {
    setIsCalculating(true);
    
    // Calculate score
    const result = calculateAISeoScore(aiSeoData, pageContent);
    setScore(result);
    setIsCalculating(false);
    
    // Persist score to database
    persistScore(pageId, result);
    
    // Notify parent
    onScoreUpdate?.(result.overall);
  }, [aiSeoData, pageContent, pageId, onScoreUpdate]);
  
  useEffect(() => {
    calculateScore();
  }, [calculateScore]);
  
  async function persistScore(id: string, result: AISeoScoreResult) {
    try {
      await supabase
        .from('landing_pages')
        .update({
          ai_seo_score: result.overall,
          ai_seo_breakdown: JSON.parse(JSON.stringify(result.breakdown)),
          ai_seo_last_calculated: new Date().toISOString(),
        })
        .eq('id', id);
    } catch (error) {
      console.error('Failed to persist SEO score:', error);
    }
  }
  
  async function handleAutoFix(recommendation: Recommendation) {
    setIsApplyingFix(recommendation.id);
    
    try {
      // Handle different auto-fix scenarios
      if (recommendation.category === 'faq') {
        await handleFAQAutoFix(recommendation);
      } else if (recommendation.category === 'content') {
        await handleContentAutoFix(recommendation);
      } else if (recommendation.category === 'authority') {
        await handleAuthorityAutoFix(recommendation);
      } else if (recommendation.category === 'queries') {
        await handleQueriesAutoFix(recommendation);
      } else {
        toast({
          title: 'Auto-fix not available',
          description: 'This recommendation requires manual changes.',
          variant: 'destructive',
        });
      }
      
      // Recalculate score after fix
      calculateScore();
      
      toast({
        title: 'Fix applied!',
        description: 'Your AI SEO score has been updated.',
      });
    } catch (error) {
      console.error('Auto-fix failed:', error);
      toast({
        title: 'Auto-fix failed',
        description: 'Please try again or make changes manually.',
        variant: 'destructive',
      });
    } finally {
      setIsApplyingFix(null);
    }
  }
  
  async function handleFAQAutoFix(recommendation: Recommendation) {
    // Call edge function to generate additional FAQs
    const { data, error } = await supabase.functions.invoke('generate-faq-content', {
      body: {
        pageId,
        currentFaqCount: aiSeoData?.faqItems?.length || 0,
        targetCount: 5,
      },
    });
    
    if (error) throw error;
    
    // The edge function should update the page data directly
    // and return the new FAQ items
    return data;
  }
  
  async function handleContentAutoFix(recommendation: Recommendation) {
    // Call edge function to improve content
    const { data, error } = await supabase.functions.invoke('improve-content', {
      body: {
        pageId,
        recommendationId: recommendation.id,
        currentValue: recommendation.currentValue,
        suggestedAction: recommendation.suggestedValue,
      },
    });
    
    if (error) throw error;
    return data;
  }
  
  async function handleAuthorityAutoFix(recommendation: Recommendation) {
    // Call edge function to enhance authority signals
    const { data, error } = await supabase.functions.invoke('enhance-authority', {
      body: {
        pageId,
        recommendationId: recommendation.id,
      },
    });
    
    if (error) throw error;
    return data;
  }
  
  async function handleQueriesAutoFix(recommendation: Recommendation) {
    // Call edge function to generate target queries
    const { data, error } = await supabase.functions.invoke('generate-queries', {
      body: {
        pageId,
      },
    });
    
    if (error) throw error;
    return data;
  }
  
  if (!score) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 h-96" />
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">AI SEO Performance</h2>
          <p className="text-sm text-slate-400">
            How well your page is optimized for AI discovery
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={calculateScore}
          disabled={isCalculating}
          className="border-slate-600 text-slate-300 hover:text-white"
        >
          {isCalculating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Recalculate
        </Button>
      </div>
      
      {/* Score and Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Score Card */}
        <AISeoScoreCard score={score} isLoading={isCalculating} />
        
        {/* Right: Recommendations */}
        <div className="lg:col-span-2">
          <AISeoRecommendations 
            recommendations={score.recommendations}
            onAutoFix={handleAutoFix}
            isApplyingFix={isApplyingFix}
          />
        </div>
      </div>
    </motion.div>
  );
}
