import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Target, 
  Search, 
  Users,
  Unlock
} from 'lucide-react';
import { useIntelligence } from '@/contexts/IntelligenceContext';
import { IntelligenceProfileDemo } from '@/components/consultation/IntelligenceProfileDemo';
import { ObjectionKillerPanel } from '@/components/consultation/ObjectionKillerPanel';
import MarketResearchPanel from '@/components/landing/MarketResearchPanel';
import { calculateIntelligenceScore } from '@/lib/intelligenceScoreCalculator';

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

  return (
    <div className="flex flex-col h-full">
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

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto"
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
              <div className="p-4">
                {/* Show unlock button if dismissed without email */}
                {state.emailDismissed && !state.emailCaptured && !state.market.isLoading && state.extracted.industry && (
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
    </div>
  );
}
