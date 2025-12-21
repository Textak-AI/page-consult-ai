import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Pencil, Loader2, FileText, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { BrandBrief } from '@/hooks/useBrandBrief';
import type { ConsultationData } from './StrategicConsultation';

interface CollapsibleBriefPanelProps {
  wizardData: Partial<ConsultationData>;
  brandBrief: BrandBrief | null;
  brandLoading?: boolean;
  onFieldChange?: (key: string, value: string) => void;
  userId?: string | null;
}

interface BriefFieldProps {
  label: string;
  value?: string;
  fieldKey: string;
  onChange?: (key: string, value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  readOnly?: boolean;
}

const BriefField: React.FC<BriefFieldProps> = ({ 
  label, 
  value, 
  fieldKey,
  onChange,
  placeholder = 'Click to add...',
  multiline = false,
  readOnly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (localValue !== value && onChange) {
      onChange(fieldKey, localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      handleBlur();
    }
    if (e.key === 'Escape') {
      setLocalValue(value || '');
      setIsEditing(false);
    }
  };

  if (readOnly) {
    return (
      <div>
        <div className="text-xs text-slate-500 mb-0.5">{label}</div>
        {value ? (
          <div className="text-sm text-slate-300 line-clamp-2">{value}</div>
        ) : (
          <div className="text-sm text-slate-600 italic">Not yet entered</div>
        )}
      </div>
    );
  }

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-500">{label}</span>
        {!isEditing && value && (
          <button
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pencil className="w-3 h-3 text-slate-500 hover:text-slate-300" />
          </button>
        )}
      </div>
      
      {isEditing ? (
        multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full bg-slate-700 border border-cyan-500 rounded px-2 py-1 text-sm text-white resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500"
            rows={3}
            placeholder={placeholder}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full bg-slate-700 border border-cyan-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            placeholder={placeholder}
          />
        )
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className="cursor-pointer hover:bg-slate-700/50 rounded px-2 py-1 -mx-2 transition-colors"
        >
          {value ? (
            <span className="text-sm text-slate-300 line-clamp-2">{value}</span>
          ) : (
            <span className="text-sm text-slate-600 italic">{placeholder}</span>
          )}
        </div>
      )}
    </div>
  );
};

// Auto-save hook
const useAutoSave = (data: Partial<ConsultationData>, userId: string | null | undefined) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');

  const save = useCallback(async (dataToSave: Partial<ConsultationData>) => {
    if (!userId) return;
    
    const dataString = JSON.stringify(dataToSave);
    if (dataString === lastSavedRef.current) return;
    
    setSaveStatus('saving');
    
    try {
      const { data: existingDraft } = await supabase
        .from('consultation_drafts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingDraft) {
        const { error } = await supabase
          .from('consultation_drafts')
          .update({
            wizard_data: dataToSave as any,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('consultation_drafts')
          .insert({
            user_id: userId,
            wizard_data: dataToSave as any,
          });
        if (error) throw error;
      }
      
      lastSavedRef.current = dataString;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveStatus('idle');
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      save(data);
    }, 2000);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, save, userId]);

  const manualSave = () => save(data);

  return { saveStatus, manualSave };
};

const calculateCompleteness = (data: Partial<ConsultationData>): number => {
  const fields = [
    data.idealClient,
    data.clientFrustration,
    data.uniqueStrength,
    data.ctaText,
    data.mainOffer,
    data.concreteProofStory || data.achievements,
  ];
  const filled = fields.filter(f => f?.trim()).length;
  return Math.round((filled / fields.length) * 100);
};

export function CollapsibleBriefPanel({ 
  wizardData, 
  brandBrief, 
  brandLoading, 
  onFieldChange, 
  userId 
}: CollapsibleBriefPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasAutoCollapsed, setHasAutoCollapsed] = useState(false);
  
  const completeness = calculateCompleteness(wizardData);
  const { saveStatus, manualSave } = useAutoSave(wizardData, userId);
  const isEditable = !!onFieldChange;

  // Auto-collapse after 3 seconds on first load
  useEffect(() => {
    if (!hasAutoCollapsed) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
        setHasAutoCollapsed(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasAutoCollapsed]);

  return (
    <>
      {/* Collapsed Tab */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={() => setIsExpanded(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-40
                       bg-slate-800 border border-slate-700 border-r-0
                       rounded-l-lg px-2 py-4 
                       hover:bg-slate-700 transition-colors
                       flex flex-col items-center gap-2
                       shadow-lg"
          >
            <FileText className="w-5 h-5 text-cyan-400" />
            <span 
              className="text-xs text-slate-300"
              style={{ writingMode: 'vertical-rl' }}
            >
              Your Brief
            </span>
            {brandBrief?.logo_url && (
              <div className="w-2 h-2 rounded-full bg-emerald-500" title="Brand loaded" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[380px] z-50
                       bg-slate-900/95 backdrop-blur border-l border-slate-700
                       flex flex-col shadow-2xl"
          >
            {/* Header with collapse button */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">Your Brief</h2>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Brand Section */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  {brandBrief ? (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm">
                      <Check className="w-4 h-4" />
                      Brand Loaded
                    </div>
                  ) : brandLoading ? (
                    <div className="text-sm text-slate-400">Loading brand...</div>
                  ) : (
                    <div className="text-sm text-slate-400">No brand configured</div>
                  )}
                  <Link 
                    to="/brand-setup" 
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Edit
                  </Link>
                </div>
                
                {brandBrief && (
                  <>
                    {brandBrief.logo_url && (
                      <div className="mb-3">
                        <img 
                          src={brandBrief.logo_url} 
                          alt="Logo" 
                          className="h-8 object-contain"
                        />
                      </div>
                    )}
                    
                    {brandBrief.website_url && (
                      <p className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
                        <span className="text-slate-300">🌐</span>
                        <a 
                          href={brandBrief.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-white transition-colors truncate"
                        >
                          {brandBrief.website_url.replace(/^https?:\/\//, '')}
                        </a>
                      </p>
                    )}
                    
                    {brandBrief.colors?.primary?.hex && (
                      <div className="flex gap-2 mb-3">
                        {Object.entries(brandBrief.colors).map(([key, color]) => (
                          color?.hex && (
                            <div
                              key={key}
                              className="w-6 h-6 rounded border border-slate-600"
                              style={{ backgroundColor: color.hex }}
                              title={`${key}: ${color.hex}`}
                            />
                          )
                        ))}
                      </div>
                    )}
                    
                    {brandBrief.voice_tone?.personality && brandBrief.voice_tone.personality.length > 0 && (
                      <p className="text-xs text-slate-400">
                        Voice: {brandBrief.voice_tone.personality.slice(0, 2).join(', ')}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Page Details Section */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Page Details</h3>
                  
                  {isEditable && (
                    <div className="flex items-center gap-2">
                      {saveStatus === 'saving' && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Saving...
                        </span>
                      )}
                      {saveStatus === 'saved' && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Saved
                        </span>
                      )}
                      <button
                        onClick={manualSave}
                        className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <BriefField 
                    label="Business" 
                    value={wizardData.businessName} 
                    fieldKey="businessName"
                    onChange={onFieldChange}
                    placeholder="Your business name"
                    readOnly={!isEditable}
                  />
                  <BriefField 
                    label="Industry" 
                    value={wizardData.industry} 
                    fieldKey="industry"
                    onChange={onFieldChange}
                    placeholder="Your industry"
                    readOnly={!isEditable}
                  />
                  <BriefField 
                    label="Audience" 
                    value={wizardData.idealClient} 
                    fieldKey="idealClient"
                    onChange={onFieldChange}
                    placeholder="Who is this page for?"
                    readOnly={!isEditable}
                  />
                  <BriefField 
                    label="Problem" 
                    value={wizardData.clientFrustration} 
                    fieldKey="clientFrustration"
                    onChange={onFieldChange}
                    placeholder="What problem do you solve?"
                    multiline
                    readOnly={!isEditable}
                  />
                  <BriefField 
                    label="Solution" 
                    value={wizardData.uniqueStrength} 
                    fieldKey="uniqueStrength"
                    onChange={onFieldChange}
                    placeholder="Your unique value"
                    readOnly={!isEditable}
                  />
                  <BriefField 
                    label="Offer" 
                    value={wizardData.mainOffer} 
                    fieldKey="mainOffer"
                    onChange={onFieldChange}
                    placeholder="Your main offer"
                    readOnly={!isEditable}
                  />
                  <BriefField 
                    label="CTA" 
                    value={wizardData.ctaText} 
                    fieldKey="ctaText"
                    onChange={onFieldChange}
                    placeholder="e.g., Schedule Demo"
                    readOnly={!isEditable}
                  />
                  <BriefField 
                    label="Proof" 
                    value={wizardData.concreteProofStory || wizardData.achievements} 
                    fieldKey="concreteProofStory"
                    onChange={onFieldChange}
                    placeholder="A specific result or case study"
                    multiline
                    readOnly={!isEditable}
                  />
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-2">
                  Brief Completeness
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">{completeness}%</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop when expanded on mobile (click to close) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}