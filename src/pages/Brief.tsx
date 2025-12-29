import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  Building2, 
  Search, 
  Target, 
  Download, 
  ArrowRight,
  Sparkles,
  Users,
  Lightbulb,
  CheckCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BriefData {
  session_id: string;
  extracted_intelligence: {
    industry?: string;
    audience?: string;
    valueProp?: string;
    competitive?: string;
    goals?: string;
    swagger?: string;
    businessName?: string;
  } | null;
  market_research: {
    positioning?: string;
    messagingDirection?: string;
    competitiveAngle?: string;
    industryInsights?: string[];
    audiencePainPoints?: string[];
    keyDifferentiators?: string[];
  } | null;
  readiness: number | null;
  created_at: string | null;
}

const BriefSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
    <header className="border-b border-white/10 p-6">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Skeleton className="h-8 w-32 bg-slate-700" />
        <Skeleton className="h-5 w-24 bg-slate-700" />
      </div>
    </header>
    <section className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <Skeleton className="w-16 h-16 rounded-full mx-auto mb-6 bg-slate-700" />
        <Skeleton className="h-10 w-80 mx-auto mb-3 bg-slate-700" />
        <Skeleton className="h-5 w-96 mx-auto bg-slate-700" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl mb-8 bg-slate-700" />
      <Skeleton className="h-80 w-full rounded-2xl mb-8 bg-slate-700" />
      <Skeleton className="h-32 w-full rounded-2xl bg-slate-700" />
    </section>
  </div>
);

const Brief = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [briefData, setBriefData] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchBrief = async () => {
      if (!sessionId) {
        setError("No session ID provided");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('demo_sessions')
          .select('session_id, extracted_intelligence, market_research, readiness, created_at')
          .eq('session_id', sessionId)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching brief:', fetchError);
          setError("Failed to load your strategy brief");
          setLoading(false);
          return;
        }

        if (!data) {
          setError("Strategy brief not found");
          setLoading(false);
          return;
        }

        setBriefData(data as BriefData);
        
        // Mark brief as viewed
        await supabase
          .from('demo_sessions')
          .update({ 
            completed: true,
            brief_viewed_at: new Date().toISOString()
          })
          .eq('session_id', sessionId);
          
      } catch (err) {
        console.error('Error:', err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchBrief();
  }, [sessionId]);

  const handleContinueToBrandSetup = () => {
    console.log('📋 [Brief] Session ID from useParams:', sessionId);
    console.log('📋 [Brief] Navigating to:', `/brand-intake?session=${sessionId}`);
    
    if (!sessionId) {
      console.error('❌ [Brief] No session ID available!');
      navigate('/');
      return;
    }
    
    navigate(`/brand-intake?session=${sessionId}`);
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download
    console.log('Download PDF clicked');
  };

  if (loading) return <BriefSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">{error}</h1>
          <p className="text-slate-400 mb-6">
            We couldn't find your strategy brief. Please start a new consultation.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-400 transition-colors"
          >
            Start New Consultation
          </button>
        </div>
      </div>
    );
  }

  const intel = briefData?.extracted_intelligence || {};
  const research = briefData?.market_research || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-white/10 p-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">PageConsult AI</span>
          </div>
          <span className="text-cyan-400 text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Strategy Brief
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/30">
            <Sparkles className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your Strategy Brief is Ready
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Based on our consultation and market research, here's your 
            strategic foundation for a high-converting landing page.
          </p>
          {briefData?.readiness && (
            <div className="mt-6 inline-flex items-center gap-2 bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20">
              <span className="text-cyan-400 font-medium">{briefData.readiness}% Strategy Complete</span>
            </div>
          )}
        </div>

        {/* Business Overview Card */}
        <div className="bg-slate-800/50 rounded-2xl border border-white/10 p-8 mb-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-cyan-400" />
            </div>
            Business Overview
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {intel.businessName && (
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider font-medium">Company</label>
                <p className="text-white mt-1 text-lg">{intel.businessName}</p>
              </div>
            )}
            {intel.industry && (
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider font-medium">Industry</label>
                <p className="text-white mt-1 text-lg">{intel.industry}</p>
              </div>
            )}
            {intel.audience && (
              <div className="md:col-span-2">
                <label className="text-xs text-slate-500 uppercase tracking-wider font-medium">Target Audience</label>
                <p className="text-white mt-1">{intel.audience}</p>
              </div>
            )}
            {intel.valueProp && (
              <div className="md:col-span-2">
                <label className="text-xs text-slate-500 uppercase tracking-wider font-medium">Value Proposition</label>
                <p className="text-white mt-1">{intel.valueProp}</p>
              </div>
            )}
          </div>
        </div>

        {/* Market Intelligence Card */}
        {(research.positioning || research.messagingDirection || research.competitiveAngle || research.industryInsights) && (
          <div className="bg-slate-800/50 rounded-2xl border border-white/10 p-8 mb-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-purple-400" />
              </div>
              Market Intelligence
            </h2>

            <div className="space-y-6">
              {/* Positioning */}
              {(research.positioning || intel.competitive) && (
                <div className="bg-slate-700/30 rounded-xl p-5 border border-white/5">
                  <h3 className="text-cyan-400 font-medium mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Your Positioning
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {research.positioning || intel.competitive}
                  </p>
                </div>
              )}

              {/* Messaging Direction */}
              {research.messagingDirection && (
                <div className="bg-slate-700/30 rounded-xl p-5 border border-white/5">
                  <h3 className="text-cyan-400 font-medium mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Messaging Direction
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {research.messagingDirection}
                  </p>
                </div>
              )}

              {/* Competitive Angle */}
              {research.competitiveAngle && (
                <div className="bg-slate-700/30 rounded-xl p-5 border border-white/5">
                  <h3 className="text-cyan-400 font-medium mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Competitive Angle
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {research.competitiveAngle}
                  </p>
                </div>
              )}

              {/* Industry Insights */}
              {research.industryInsights && research.industryInsights.length > 0 && (
                <div className="bg-slate-700/30 rounded-xl p-5 border border-white/5">
                  <h3 className="text-cyan-400 font-medium mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Industry Insights
                  </h3>
                  <ul className="space-y-3">
                    {research.industryInsights.map((insight, i) => (
                      <li key={i} className="text-slate-300 flex items-start gap-3">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Goals Card */}
        {(intel.goals || intel.swagger) && (
          <div className="bg-slate-800/50 rounded-2xl border border-white/10 p-8 mb-12 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-400" />
              </div>
              Page Goals & Voice
            </h2>
            <div className="flex flex-wrap gap-4">
              {intel.goals && (
                <div className="bg-green-500/10 rounded-lg px-5 py-3 border border-green-500/20">
                  <span className="text-green-400 font-medium text-sm uppercase tracking-wider">Primary Goal</span>
                  <p className="text-white mt-1">{intel.goals}</p>
                </div>
              )}
              {intel.swagger && (
                <div className="bg-purple-500/10 rounded-lg px-5 py-3 border border-purple-500/20">
                  <span className="text-purple-400 font-medium text-sm uppercase tracking-wider">Brand Voice</span>
                  <p className="text-white mt-1">{intel.swagger}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl border border-white/10 p-10">
          <h3 className="text-2xl font-semibold text-white mb-3">
            Ready to build your page?
          </h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Next, we'll collect your brand assets — logo, colors, and any 
            brand guidelines — to ensure your page looks and feels like you.
          </p>
          <button
            onClick={handleContinueToBrandSetup}
            className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 
                       text-white font-semibold rounded-xl text-lg
                       hover:from-cyan-400 hover:to-purple-400 transition-all
                       shadow-lg shadow-cyan-500/25 inline-flex items-center gap-3"
          >
            Continue to Brand Setup
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-slate-500 text-sm mt-4">
            Takes about 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 p-6 mt-12">
        <div className="max-w-4xl mx-auto flex justify-between items-center text-sm text-slate-500">
          <span>PageConsult AI</span>
          <button 
            onClick={handleDownloadPDF}
            className="hover:text-white transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Brief as PDF
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Brief;
