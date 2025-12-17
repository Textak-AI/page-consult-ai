import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FlaskConical, Sparkles, ArrowRight, Brain, Zap } from "lucide-react";

const industries = [
  "Professional Services",
  "Home Services",
  "Health & Wellness",
  "Technology",
  "Real Estate",
  "Education",
  "Food & Beverage",
  "Events & Entertainment",
];

const goals = [
  "Generate Leads",
  "Book Consultations",
  "Sell Products",
  "Build Email List",
  "Showcase Portfolio",
];

export default function DevTest() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    industry: "Events & Entertainment",
    goal: "Generate Leads",
    audience: "Wedding planners looking for reliable DJs",
    service: "Wedding DJ services",
  });
  
  const [intelligenceResult, setIntelligenceResult] = useState<any>(null);
  const [intelligenceError, setIntelligenceError] = useState<string | null>(null);
  const [intelligenceLoading, setIntelligenceLoading] = useState(false);
  
  const [contentResult, setContentResult] = useState<any>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [contentLoading, setContentLoading] = useState(false);

  const [fullPipelineLoading, setFullPipelineLoading] = useState(false);

  const testIntelligencePipeline = async () => {
    setIntelligenceLoading(true);
    setIntelligenceError(null);
    setIntelligenceResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('market-intelligence', {
        body: {
          industry: formData.industry,
          targetAudience: formData.audience,
          serviceType: formData.service,
        },
      });
      
      if (error) throw error;
      setIntelligenceResult(data);
      return data;
    } catch (err: any) {
      setIntelligenceError(err.message || 'Unknown error');
      return null;
    } finally {
      setIntelligenceLoading(false);
    }
  };

  // Transform market research into intelligence context for content generation
  const buildIntelligenceContext = (research: any) => {
    if (!research?.research) return null;
    
    const { claims, painPoints, demographics, competitors } = research.research;
    
    // Extract statistics from claims
    const statistics = (claims || [])
      .filter((c: any) => c.category === 'statistic')
      .slice(0, 5)
      .map((c: any) => ({
        claim: c.claim,
        source: c.source || 'Industry Research',
        confidence: c.confidence || 'medium'
      }));
    
    return {
      persona: {
        name: "The Overwhelmed Planner", // Default until persona synthesis
        primaryPain: painPoints?.[0] || "Finding reliable vendors",
        primaryDesire: "Peace of mind on the big day",
        keyObjections: [
          "How do I know they'll show up?",
          "What if the music is wrong?",
          "Is this worth the cost?"
        ],
        languagePatterns: [
          "I need someone reliable",
          "My clients expect perfection",
          "I can't afford mistakes"
        ],
        emotionalTriggers: [
          "stress of event planning",
          "reputation on the line",
          "client satisfaction"
        ],
        demographics: demographics || {}
      },
      market: {
        topPainPoints: painPoints?.slice(0, 5) || [],
        keyStatistics: statistics,
        competitorGaps: competitors?.[0]?.marketGaps || [],
        audienceLanguage: demographics?.decisionFactors || []
      },
      rawResearch: research.research
    };
  };

  const testContentGeneration = async (useIntelligence = false) => {
    setContentLoading(true);
    setContentError(null);
    setContentResult(null);
    
    try {
      // Build intelligence context if we have research data
      let intelligenceContext = null;
      if (useIntelligence && intelligenceResult?.research) {
        intelligenceContext = buildIntelligenceContext(intelligenceResult);
        console.log('🧠 Using intelligence context:', intelligenceContext);
      }
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          action: 'generate_content',
          consultationData: {
            industry: formData.industry,
            serviceType: formData.service,
            goal: formData.goal,
            targetAudience: formData.audience,
            challenge: "Finding reliable, professional service",
            uniqueValue: "Years of experience and customer satisfaction",
          },
          intelligenceContext,
        },
      });
      
      if (error) throw error;
      setContentResult(data);
    } catch (err: any) {
      setContentError(err.message || 'Unknown error');
    } finally {
      setContentLoading(false);
    }
  };

  // Run full pipeline: Intelligence -> Content Generation
  const testFullPipeline = async () => {
    setFullPipelineLoading(true);
    setContentError(null);
    setContentResult(null);
    
    try {
      // Step 1: Get intelligence
      const intelligenceData = await testIntelligencePipeline();
      
      if (!intelligenceData?.research) {
        throw new Error('Intelligence pipeline failed');
      }
      
      // Step 2: Generate content with intelligence
      await testContentGeneration(true);
    } catch (err: any) {
      setContentError(err.message || 'Full pipeline failed');
    } finally {
      setFullPipelineLoading(false);
    }
  };

  const goToGeneratePage = () => {
    // Build properly structured intelligence data if available
    let intelligenceData = null;
    
    if (intelligenceResult?.research) {
      const research = intelligenceResult.research;
      
      // Map to PersonaIntelligence structure
      intelligenceData = {
        id: 'dev-intelligence-' + Date.now(),
        consultationId: 'dev-consultation-' + Date.now(),
        userId: 'dev-user',
        industry: formData.industry,
        targetAudience: formData.audience,
        serviceType: formData.service,
        
        // Market research data
        marketResearch: {
          claims: research.claims || [],
          demographics: research.demographics || {},
          competitors: research.competitors || [],
          painPoints: research.painPoints || [],
          trends: research.trends || [],
          researchedAt: research.researchedAt || new Date().toISOString(),
          sources: research.sources || []
        },
        
        // Synthesized persona
        synthesizedPersona: {
          name: "The Overwhelmed Planner",
          demographics: {
            primaryAge: research.demographics?.ageRange || "25-45",
            income: research.demographics?.income || "$50,000-$150,000",
            location: "Urban/Suburban",
            occupation: "Event Professional"
          },
          psychographics: {
            values: ["reliability", "professionalism", "peace of mind"],
            fears: ["vendor no-shows", "unhappy clients", "event disasters"],
            aspirations: ["flawless events", "repeat business", "industry recognition"],
            decisionStyle: "Research-driven, seeks recommendations",
            trustSignals: ["reviews", "referrals", "experience"]
          },
          languagePatterns: [
            "I need someone reliable",
            "My clients expect perfection",
            "I can't afford mistakes",
            "Looking for a professional who gets it"
          ],
          painPoints: (research.painPoints || []).slice(0, 5).map((p: string) => ({
            pain: p,
            intensity: "high" as const,
            trigger: "Event planning stress",
            languageUsed: [p]
          })),
          desires: [
            {
              desire: "Peace of mind on the big day",
              priority: "must_have" as const,
              emotionalBenefit: "Relief from vendor stress"
            },
            {
              desire: "Professional who handles everything",
              priority: "must_have" as const,
              emotionalBenefit: "Confidence in vendor choice"
            }
          ],
          objections: [
            {
              objection: "How do I know they'll show up?",
              likelihood: "common" as const,
              counterArgument: "Backup equipment and contingency plans"
            },
            {
              objection: "Is this worth the cost?",
              likelihood: "common" as const,
              counterArgument: "Value of professional experience and equipment"
            }
          ],
          buyingJourney: []
        },
        
        researchSources: research.sources || [],
        confidenceScore: 0.85,
        researchStatus: 'complete' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };
    }

    const consultationData = {
      id: "dev-test-" + Date.now(),
      industry: formData.industry,
      specificService: formData.service,
      goal: formData.goal,
      targetAudience: formData.audience,
      challenge: "Finding reliable, professional service",
      uniqueValue: "Years of experience and customer satisfaction",
      timestamp: new Date().toISOString(),
    };
    
    navigate('/generate', { 
      state: { 
        consultationData,
        intelligenceData,
        landingPageBestPractices: intelligenceResult?.landingPageBestPractices || null,
        devMode: true
      } 
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FlaskConical className="h-8 w-8 text-cyan-500" />
            Dev Test Page
          </h1>
          <p className="text-muted-foreground">
            Test the intelligence pipeline and content generation without going through the wizard.
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Test Data</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select 
                value={formData.industry} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, industry: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(ind => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goal">Goal</Label>
              <Select 
                value={formData.goal} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, goal: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {goals.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Input 
                id="audience"
                value={formData.audience}
                onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service">Service</Label>
              <Input 
                id="service"
                value={formData.service}
                onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <Button 
            onClick={testIntelligencePipeline}
            disabled={intelligenceLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {intelligenceLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FlaskConical className="h-4 w-4 mr-2" />
            )}
            1. Test Intelligence
          </Button>
          
          <Button 
            onClick={() => testContentGeneration(!!intelligenceResult)}
            disabled={contentLoading}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {contentLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            2. Test Content {intelligenceResult ? '(with intelligence)' : '(no intelligence)'}
          </Button>

          <Button 
            onClick={testFullPipeline}
            disabled={fullPipelineLoading}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
          >
            {fullPipelineLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Full Pipeline (1+2)
          </Button>
          
          <Button 
            onClick={goToGeneratePage}
            variant="outline"
          >
            Go to Generate Page
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Intelligence Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Intelligence Pipeline Result</h2>
            {intelligenceResult && (
              <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded">
                {intelligenceResult.research?.claims?.length || 0} claims, {intelligenceResult.research?.painPoints?.length || 0} pain points
              </span>
            )}
          </div>
          
          {intelligenceError && (
            <div className="bg-red-950/50 border border-red-500 rounded-lg p-4 text-red-400">
              <strong>Error:</strong> {intelligenceError}
            </div>
          )}
          
          {intelligenceResult && (
            <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 overflow-auto max-h-96 text-sm text-slate-300">
              {JSON.stringify(intelligenceResult, null, 2)}
            </pre>
          )}
          
          {!intelligenceResult && !intelligenceError && !intelligenceLoading && (
            <p className="text-muted-foreground text-sm">
              Click "Test Intelligence" to see results
            </p>
          )}
        </div>

        {/* Content Generation Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Content Generation Result</h2>
            {contentResult?.content && (
              <span className="text-xs bg-cyan-900/50 text-cyan-400 px-2 py-1 rounded flex items-center gap-1">
                <Brain className="h-3 w-3" />
                {contentResult.content.statistics?.length || 0} stats included
              </span>
            )}
          </div>
          
          {contentError && (
            <div className="bg-red-950/50 border border-red-500 rounded-lg p-4 text-red-400">
              <strong>Error:</strong> {contentError}
            </div>
          )}
          
          {contentResult && (
            <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 overflow-auto max-h-96 text-sm text-slate-300">
              {JSON.stringify(contentResult, null, 2)}
            </pre>
          )}
          
          {!contentResult && !contentError && !contentLoading && (
            <p className="text-muted-foreground text-sm">
              Click "Test Content" to see results
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
