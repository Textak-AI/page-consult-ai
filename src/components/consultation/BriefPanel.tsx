import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Check, Pencil, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { BrandBrief } from '@/hooks/useBrandBrief';
import type { ConsultationData } from './StrategicConsultation';

interface BriefPanelProps {
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
        <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
        {value ? (
          <div className="text-sm text-foreground/80 line-clamp-2">{value}</div>
        ) : (
          <div className="text-sm text-muted-foreground/50 italic">Not yet entered</div>
        )}
      </div>
    );
  }

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        {!isEditing && value && (
          <button
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pencil className="w-3 h-3 text-muted-foreground hover:text-foreground" />
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
            className="w-full bg-muted border border-primary rounded px-2 py-1 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
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
            className="w-full bg-muted border border-primary rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder={placeholder}
          />
        )
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className="cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2 transition-colors"
        >
          {value ? (
            <span className="text-sm text-foreground/80 line-clamp-2">{value}</span>
          ) : (
            <span className="text-sm text-muted-foreground/50 italic">{placeholder}</span>
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
    if (dataString === lastSavedRef.current) return; // No changes
    
    setSaveStatus('saving');
    
    try {
      // Check if draft exists
      const { data: existingDraft } = await supabase
        .from('consultation_drafts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingDraft) {
        // Update existing
        const { error } = await supabase
          .from('consultation_drafts')
          .update({
            wizard_data: dataToSave as any,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        // Insert new
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
      
      // Reset to idle after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
      
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveStatus('idle');
    }
  }, [userId]);

  // Auto-save on data change (debounced)
  useEffect(() => {
    if (!userId) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      save(data);
    }, 2000); // Save 2 seconds after last change
    
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

export function BriefPanel({ wizardData, brandBrief, brandLoading, onFieldChange, userId }: BriefPanelProps) {
  const completeness = calculateCompleteness(wizardData);
  const { saveStatus, manualSave } = useAutoSave(wizardData, userId);
  const isEditable = !!onFieldChange;
  
  return (
    <div className="space-y-6">
      {/* Brand Section */}
      <div className="bg-background/50 rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between mb-3">
          {brandBrief ? (
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <Check className="w-4 h-4" />
              Brand Loaded
            </div>
          ) : brandLoading ? (
            <div className="text-sm text-muted-foreground">Loading brand...</div>
          ) : (
            <div className="text-sm text-muted-foreground">No brand configured</div>
          )}
          <Link 
            to="/settings/brand" 
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Edit
          </Link>
        </div>
        
        {brandBrief && (
          <>
            {/* Logo */}
            {brandBrief.logo_url && (
              <img 
                src={brandBrief.logo_url} 
                alt="Logo" 
                className="h-8 object-contain mb-3"
              />
            )}
            
            {/* Colors */}
            {brandBrief.colors?.primary?.hex && (
              <div className="flex gap-2 mb-3">
                {Object.entries(brandBrief.colors).map(([key, color]) => (
                  color?.hex && (
                    <div
                      key={key}
                      className="w-6 h-6 rounded border border-border"
                      style={{ backgroundColor: color.hex }}
                      title={`${key}: ${color.hex}`}
                    />
                  )
                ))}
              </div>
            )}
            
            {/* Voice traits */}
            {brandBrief.voice_tone?.personality && brandBrief.voice_tone.personality.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Voice: {brandBrief.voice_tone.personality.slice(0, 2).join(', ')}
              </p>
            )}
          </>
        )}
      </div>

      {/* Page Details Section */}
      <div className="bg-background/50 rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">Page Details</h3>
          
          {/* Save Status */}
          {isEditable && (
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
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
                className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors"
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
        <div className="text-xs text-muted-foreground mb-2">
          Brief Completeness
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-300"
            style={{ width: `${completeness}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1">{completeness}%</div>
      </div>
    </div>
  );
}
