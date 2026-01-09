import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Target, 
  Search, 
  Users,
  Unlock,
  Gift,
  Building,
  ExternalLink,
  Sparkles,
  Award,
  Calendar,
  MapPin,
  Loader2,
  Palette,
  Type,
  FileText,
  ArrowRight
} from 'lucide-react';
import { useIntelligence } from '@/contexts/IntelligenceContext';
import { IntelligenceProfileDemo } from '@/components/consultation/IntelligenceProfileDemo';
import { ObjectionKillerPanel } from '@/components/consultation/ObjectionKillerPanel';
import MarketResearchPanel from '@/components/landing/MarketResearchPanel';
import { calculateIntelligenceScore } from '@/lib/intelligenceScoreCalculator';
import { Button } from '@/components/ui/button';
import { BriefReviewModal } from './BriefReviewModal';
import type { BriefData } from '@/types/brief-validation';

interface Tab {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  hasNewData: boolean;
  isAvailable: boolean;
}

interface IntelligenceTabsProps {
  onContinue: () => void;
  onReopenEmailGate: () => void;
}

export function IntelligenceTabs({ onContinue, onReopenEmailGate }: IntelligenceTabsProps) {
  const { 
    state, 
    shouldShowObjectionPanel, 
    shouldShowResearchPanel,
    confirmIndustrySelection
  } = useIntelligence();
  
  const [activeTab, setActiveTab] = useState('intelligence');
  const [seenTabs, setSeenTabs] = useState<Set<string>>(new Set(['intelligence']));
  const [newDataTabs, setNewDataTabs] = useState<Set<string>>(new Set());
  const [showBriefReview, setShowBriefReview] = useState(false);

  const score = calculateIntelligenceScore(state.extracted);
  
  const hasMarketResearchData = state.emailCaptured && 
    (state.market.isLoading || state.market.marketSize || state.market.industryInsights.length > 0);

  // 📋 Log objections data when panel is available
  useEffect(() => {
    if (shouldShowObjectionPanel && state.predictedObjections?.length > 0) {
      console.log('📋 [IntelPanel] Objections data:', {
        count: state.predictedObjections?.length || 0,
        objections: state.predictedObjections?.map((o: any) => ({
          objection: typeof o === 'string' ? o.substring(0, 50) : o?.objection?.substring(0, 50),
          hasResponse: typeof o === 'object' ? !!o?.response : false,
        })),
      });
    }
  }, [shouldShowObjectionPanel, state.predictedObjections]);

  // 📊 Log research data when available
  useEffect(() => {
    if (hasMarketResearchData) {
      console.log('📊 [IntelPanel] Research data:', {
        industryInsights: state.market?.industryInsights?.length || 0,
        commonObjections: state.market?.commonObjections?.length || 0,
        marketSize: state.market?.marketSize,
        hasBuyerPersona: !!state.market?.buyerPersona,
      });
    }
  }, [hasMarketResearchData, state.market]);

  // Define tabs
  const tabs: Tab[] = [
    {
      id: 'intelligence',
      label: 'Intelligence Profile',
      shortLabel: 'Intel',
      icon: BarChart3,
      hasNewData: false,
      isAvailable: true,
    },
    {
      id: 'objections',
      label: 'Objection Killer',
      shortLabel: 'Objections',
      icon: Target,
      hasNewData: newDataTabs.has('objections') && !seenTabs.has('objections'),
      isAvailable: shouldShowObjectionPanel,
    },
    {
      id: 'research',
      label: 'Market Research',
      shortLabel: 'Research',
      icon: Search,
      hasNewData: newDataTabs.has('research') && !seenTabs.has('research'),
      isAvailable: !!(hasMarketResearchData || (state.emailDismissed && !state.emailCaptured && state.extracted.industry)),
    },
    {
      id: 'personas',
      label: 'Buyer Personas',
      shortLabel: 'Personas',
      icon: Users,
      hasNewData: newDataTabs.has('personas') && !seenTabs.has('personas'),
      isAvailable: false,
    },
  ];

  // Track when new objections become available
  useEffect(() => {
    if (shouldShowObjectionPanel && !seenTabs.has('objections')) {
      setNewDataTabs(prev => new Set([...prev, 'objections']));
    }
  }, [shouldShowObjectionPanel, seenTabs]);

  // Track when new research becomes available
  useEffect(() => {
    if (hasMarketResearchData && !seenTabs.has('research')) {
      setNewDataTabs(prev => new Set([...prev, 'research']));
    }
  }, [hasMarketResearchData, seenTabs]);

  // Mark tab as seen when clicked
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setSeenTabs(prev => new Set([...prev, tabId]));
  };

  // Filter to only available tabs
  const availableTabs = tabs.filter(tab => tab.isAvailable);
  const unavailableTabs = tabs.filter(tab => !tab.isAvailable);

  const canGenerate = score.totalScore >= 70;

  return (
    <div className="flex flex-col h-full relative">
      {/* Tab Bar - more breathing room */}
      <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-white/5 bg-slate-900/50 overflow-x-auto">
        {availableTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const hasNew = tab.hasNewData;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-200 whitespace-nowrap flex-shrink-0
                ${isActive 
                  ? 'bg-slate-700 text-white' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }
              `}
            >
              {/* Glow effect for new data */}
              {hasNew && (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-cyan-500/20"
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
              
              {/* Icon */}
              <Icon className="w-4 h-4 relative z-10" />
              
              {/* Label (hidden on very small screens) */}
              <span className="hidden sm:inline relative z-10">{tab.shortLabel}</span>
              
              {/* "New" badge */}
              {hasNew && (
                <span className="relative z-10 flex items-center gap-1">
                  <motion.span
                    className="w-2 h-2 bg-cyan-400 rounded-full"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.7, 1]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity 
                    }}
                  />
                </span>
              )}
            </button>
          );
        })}
        
        {/* Coming Soon tabs (grayed out) - only personas shows "Soon" */}
        {unavailableTabs.map((tab) => {
          const Icon = tab.icon;
          const showSoonLabel = tab.id === 'personas'; // Only show "Soon" for personas
          return (
            <div
              key={tab.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 cursor-not-allowed whitespace-nowrap flex-shrink-0"
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.shortLabel}</span>
              {showSoonLabel && (
                <span className="text-[10px] uppercase tracking-wide text-slate-700">Soon</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Tab Content - single scroll container */}
      <div className="flex-1 overflow-y-auto pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-full"
          >
            {activeTab === 'intelligence' && (
              <IntelligenceProfileDemo 
                score={score}
                industryDetection={state.industryDetection}
                aestheticMode={state.aestheticMode}
                marketResearch={state.emailCaptured ? state.market : null}
                onContinue={onContinue}
                onIndustryCorrection={confirmIndustrySelection}
                isThinking={state.isProcessing}
                className="h-auto border-0 rounded-none"
              />
            )}
            
            {activeTab === 'objections' && (
              <div className="p-4">
                <ObjectionKillerPanel 
                  objections={state.predictedObjections}
                  isLoading={false}
                />
              </div>
            )}
            
            {activeTab === 'research' && (
              <div className="p-4 space-y-4">
                {/* Founders Pricing Banner */}
                {state.foundersPricingUnlocked && (
                  <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-300">
                        50% Founders Discount Unlocked
                      </span>
                    </div>
                  </div>
                )}

                {/* Company Research Card */}
                {state.companyResearch && (
                  <div className="space-y-4">
                    {/* Header with logo */}
                    <div className="flex items-center gap-3">
                      {state.extractedLogo ? (
                        <img 
                          src={state.extractedLogo} 
                          alt={state.companyResearch.companyName}
                          className="w-10 h-10 rounded-lg object-contain bg-white p-1"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                          <Building className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-white">
                          {state.companyResearch.companyName}
                        </div>
                        {state.businessCard?.website && (
                          <a 
                            href={state.businessCard.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            {new URL(state.businessCard.website).hostname.replace('www.', '')}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    
                    {/* Confidence indicator */}
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        state.companyResearch.confidence === 'high' ? 'bg-emerald-400' :
                        state.companyResearch.confidence === 'medium' ? 'bg-amber-400' :
                        'bg-slate-500'
                      }`} />
                      <span className="text-xs text-slate-500">
                        {state.companyResearch.confidence === 'high' ? 'High confidence research' :
                         state.companyResearch.confidence === 'medium' ? 'Moderate confidence' :
                         'Limited data available'}
                      </span>
                    </div>
                    
                    {/* Description */}
                    {state.companyResearch.description && (
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="text-xs text-slate-500 mb-1">About</div>
                        <p className="text-sm text-slate-300">{state.companyResearch.description}</p>
                      </div>
                    )}
                    
                    {/* Services */}
                    {state.companyResearch.services && state.companyResearch.services.length > 0 && (
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="text-xs text-slate-500 mb-2">Services</div>
                        <div className="flex flex-wrap gap-2">
                          {state.companyResearch.services.map((service: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Target Market */}
                    {state.companyResearch.targetMarket && (
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="text-xs text-slate-500 mb-1">Target Market</div>
                        <p className="text-sm text-slate-300">{state.companyResearch.targetMarket}</p>
                      </div>
                    )}
                    
                    {/* Differentiators */}
                    {state.companyResearch.differentiators && state.companyResearch.differentiators.length > 0 && (
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="text-xs text-slate-500 mb-2">Differentiators</div>
                        <ul className="text-sm text-slate-300 space-y-1.5">
                          {state.companyResearch.differentiators.map((diff: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <Sparkles className="w-3 h-3 text-amber-400 mt-1 shrink-0" />
                              {diff}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Founded / Location */}
                    {(state.companyResearch.founded || state.companyResearch.location) && (
                      <div className="flex gap-4 text-xs text-slate-400">
                        {state.companyResearch.founded && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Founded {state.companyResearch.founded}
                          </div>
                        )}
                        {state.companyResearch.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {state.companyResearch.location}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Public Proof Points */}
                    {state.companyResearch.publicProof && state.companyResearch.publicProof.length > 0 && (
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="text-xs text-slate-500 mb-2">Credentials & Proof</div>
                        <ul className="text-sm text-slate-300 space-y-1.5">
                          {state.companyResearch.publicProof.map((proof: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <Award className="w-3 h-3 text-cyan-400 mt-1 shrink-0" />
                              {proof}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Extracted Brand Colors */}
                    {state.extractedBrand?.colors?.all && state.extractedBrand.colors.all.length > 0 && (
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Palette className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-500">Brand Colors</span>
                        </div>
                        <div className="flex gap-2">
                          {state.extractedBrand.colors.all.slice(0, 5).map((color: string, i: number) => (
                            <div 
                              key={i} 
                              className="w-8 h-8 rounded-lg border border-slate-600 shadow-sm"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Extracted Fonts */}
                    {state.extractedBrand?.fonts?.heading && (
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                          <Type className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-500">Typography</span>
                        </div>
                        <p className="text-sm text-slate-300">
                          {state.extractedBrand.fonts.heading}
                          {state.extractedBrand.fonts.body && state.extractedBrand.fonts.body !== state.extractedBrand.fonts.heading && (
                            <span className="text-slate-500"> / {state.extractedBrand.fonts.body}</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Loading state */}
                {state.isResearchingCompany && (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-cyan-400" />
                    <p className="text-sm text-slate-400">Researching your business...</p>
                  </div>
                )}

                {/* Show unlock button if dismissed without email */}
                {state.emailDismissed && !state.emailCaptured && !state.market.isLoading && state.extracted.industry && !state.companyResearch && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 bg-cyan-500/10 rounded-full mb-4">
                      <Search className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Market Research</h3>
                    <p className="text-slate-400 text-sm mb-6 max-w-xs">
                      Get detailed insights about your target market, buyer personas, and industry trends.
                    </p>
                    <button
                      onClick={onReopenEmailGate}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 border border-cyan-500/40 text-cyan-400 rounded-lg hover:bg-cyan-500/10 hover:border-cyan-400/60 transition-all text-sm font-medium"
                    >
                      <Unlock className="w-4 h-4" />
                      Unlock Market Research
                    </button>
                  </div>
                )}

                {/* Empty state before any research */}
                {!state.companyResearch && !state.isResearchingCompany && !state.emailDismissed && !state.emailCaptured && (
                  <div className="text-center py-8 text-slate-500">
                    <Building className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Share your business card to unlock personalized research</p>
                  </div>
                )}
                
                {/* Show loading or results if email captured */}
                {hasMarketResearchData && (
                  <MarketResearchPanel 
                    market={state.market}
                    industry={state.extracted.industry}
                  />
                )}
              </div>
            )}
            
            {activeTab === 'personas' && (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="p-4 bg-slate-700/50 rounded-full mb-4">
                  <Users className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-400 mb-2">Buyer Personas</h3>
                <p className="text-slate-500 text-sm">Coming soon</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky CTA area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 space-y-3">
        {/* Progress indicator when not ready */}
        {!canGenerate && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Progress to unlock</span>
              <span className="text-cyan-400 font-medium">{score.totalScore}/70</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (score.totalScore / 70) * 100)}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Generate Brief button */}
        <Button
          onClick={() => setShowBriefReview(true)}
          disabled={!canGenerate}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Generate Your Brief
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Brief Review Modal */}
      <BriefReviewModal
        isOpen={showBriefReview}
        onClose={() => setShowBriefReview(false)}
        onGenerate={(briefData: BriefData) => {
          setShowBriefReview(false);
          console.log('Generating with brief data:', briefData);
          onContinue();
        }}
      />
    </div>
  );
}
