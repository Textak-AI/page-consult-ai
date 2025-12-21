import { Link } from 'react-router-dom';
import { Check, Palette, Type, MessageSquare } from 'lucide-react';
import type { BrandBrief } from '@/hooks/useBrandBrief';
import type { ConsultationData } from './StrategicConsultation';

interface BriefPanelProps {
  wizardData: Partial<ConsultationData>;
  brandBrief: BrandBrief | null;
  brandLoading?: boolean;
}

const BriefField: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div>
    <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
    {value ? (
      <div className="text-sm text-foreground/80 line-clamp-2">{value}</div>
    ) : (
      <div className="text-sm text-muted-foreground/50 italic">Not yet entered</div>
    )}
  </div>
);

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

export function BriefPanel({ wizardData, brandBrief, brandLoading }: BriefPanelProps) {
  const completeness = calculateCompleteness(wizardData);
  
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
            {(brandBrief as any).logo_url && (
              <img 
                src={(brandBrief as any).logo_url} 
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
        <h3 className="text-sm font-medium text-foreground mb-4">Page Details</h3>
        
        <div className="space-y-3">
          <BriefField 
            label="Business" 
            value={wizardData.businessName} 
          />
          <BriefField 
            label="Industry" 
            value={wizardData.industry} 
          />
          <BriefField 
            label="Audience" 
            value={wizardData.idealClient} 
          />
          <BriefField 
            label="Problem" 
            value={wizardData.clientFrustration} 
          />
          <BriefField 
            label="Solution" 
            value={wizardData.uniqueStrength} 
          />
          <BriefField 
            label="Offer" 
            value={wizardData.mainOffer} 
          />
          <BriefField 
            label="CTA" 
            value={wizardData.ctaText} 
          />
          <BriefField 
            label="Proof" 
            value={wizardData.concreteProofStory || wizardData.achievements} 
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
