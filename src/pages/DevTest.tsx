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
import { Loader2, FlaskConical, Sparkles, ArrowRight } from "lucide-react";

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
    industry: "Professional Services",
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
    } catch (err: any) {
      setIntelligenceError(err.message || 'Unknown error');
    } finally {
      setIntelligenceLoading(false);
    }
  };

  const testContentGeneration = async () => {
    setContentLoading(true);
    setContentError(null);
    setContentResult(null);
    
    try {
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
          intelligenceContext: null,
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

  const goToGeneratePage = () => {
    const consultationData = {
      industry: formData.industry,
      specificService: formData.service,
      goal: formData.goal,
      targetAudience: formData.audience,
      challenge: "Finding reliable, professional service",
      uniqueValue: "Years of experience and customer satisfaction",
      timestamp: new Date().toISOString(),
    };
    
    navigate('/generate', { 
      state: { consultationData } 
    });
  };

  // Note: In a real production deployment, you might want to hide this page
  // For now, keeping it accessible for testing purposes

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
        <div className="flex gap-4">
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
            Test Intelligence Pipeline
          </Button>
          
          <Button 
            onClick={testContentGeneration}
            disabled={contentLoading}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {contentLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Test Content Generation
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
          <h2 className="text-lg font-semibold text-foreground">Intelligence Pipeline Result</h2>
          
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
              Click "Test Intelligence Pipeline" to see results
            </p>
          )}
        </div>

        {/* Content Generation Results */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Content Generation Result</h2>
          
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
              Click "Test Content Generation" to see results
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
