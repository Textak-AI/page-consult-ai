import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Megaphone, Users, FlaskConical, Gift, Palette, Minimize2,
  ArrowLeft, Sparkles, Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VariantGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalPageData: any;
  onGenerateVariant: (variantType: string, config: Record<string, any>) => Promise<void>;
}

const VARIANT_TYPES = [
  {
    id: 'ad-campaign',
    icon: Megaphone,
    title: 'Ad Campaign',
    description: 'Shorter, punchier for paid traffic',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20',
  },
  {
    id: 'audience-segment',
    icon: Users,
    title: 'Different Audience',
    description: 'Same offer, new persona',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20',
  },
  {
    id: 'ab-test',
    icon: FlaskConical,
    title: 'A/B Test',
    description: 'Test headlines, CTAs, or structure',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20',
  },
  {
    id: 'promo',
    icon: Gift,
    title: 'Promo / Seasonal',
    description: 'Add urgency or limited-time offer',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20',
  },
  {
    id: 'style-refresh',
    icon: Palette,
    title: 'Style Refresh',
    description: 'New colors, tone, or layout',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20',
  },
  {
    id: 'mini-landing',
    icon: Minimize2,
    title: 'Mini Landing Page',
    description: 'Condensed above-fold version',
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10 hover:bg-teal-500/20 border-teal-500/20',
  },
];

interface QuestionOption {
  value: string;
  label: string;
  default?: boolean;
}

interface Question {
  id: string;
  label: string;
  type: 'select' | 'text' | 'color' | 'multi-select';
  options?: QuestionOption[];
  placeholder?: string;
  showIf?: string;
}

const VARIANT_QUESTIONS: Record<string, Question[]> = {
  'ad-campaign': [
    {
      id: 'traffic-source',
      label: 'Where is the traffic coming from?',
      type: 'select',
      options: [
        { value: 'google', label: 'Google Ads (intent-based)' },
        { value: 'meta', label: 'Meta / Facebook (scroll-stopping)' },
        { value: 'linkedin', label: 'LinkedIn (professional)' },
        { value: 'tiktok', label: 'TikTok (attention-grabbing)' },
        { value: 'email', label: 'Email campaign (warm audience)' },
      ],
    },
    {
      id: 'page-length',
      label: 'How long should the page be?',
      type: 'select',
      options: [
        { value: 'mini', label: 'Mini (hero + CTA only)' },
        { value: 'short', label: 'Short (3-4 sections)' },
        { value: 'medium', label: 'Medium (5-6 sections)' },
      ],
    },
    {
      id: 'message-match',
      label: 'Ad headline to match (optional)',
      type: 'text',
      placeholder: 'Paste your ad headline for message matching',
    },
  ],
  'audience-segment': [
    {
      id: 'new-audience',
      label: 'Who is this variant for?',
      type: 'text',
      placeholder: 'e.g., Enterprise CTOs, Small business owners, Technical founders',
    },
    {
      id: 'tone-shift',
      label: 'How should the tone change?',
      type: 'select',
      options: [
        { value: 'more-technical', label: 'More technical / detailed' },
        { value: 'more-executive', label: 'More executive / ROI-focused' },
        { value: 'more-casual', label: 'More casual / friendly' },
        { value: 'more-urgent', label: 'More urgent / action-oriented' },
        { value: 'same', label: 'Keep the same tone' },
      ],
    },
    {
      id: 'pain-point-focus',
      label: 'Emphasize a specific pain point? (optional)',
      type: 'text',
      placeholder: 'e.g., Budget constraints, Time pressure, Technical complexity',
    },
  ],
  'ab-test': [
    {
      id: 'test-element',
      label: 'What do you want to test?',
      type: 'select',
      options: [
        { value: 'headline', label: 'Headline' },
        { value: 'cta', label: 'CTA text & approach' },
        { value: 'value-prop', label: 'Value proposition angle' },
        { value: 'social-proof', label: 'Social proof approach' },
        { value: 'hero-layout', label: 'Hero section layout' },
      ],
    },
    {
      id: 'test-hypothesis',
      label: "What's your hypothesis? (optional)",
      type: 'text',
      placeholder: 'e.g., A benefit-led headline will convert better than problem-led',
    },
  ],
  'promo': [
    {
      id: 'promo-type',
      label: 'What type of promotion?',
      type: 'select',
      options: [
        { value: 'discount', label: 'Limited time discount' },
        { value: 'bonus', label: 'Bonus / added value' },
        { value: 'launch', label: 'Launch special' },
        { value: 'seasonal', label: 'Seasonal / holiday' },
        { value: 'custom', label: 'Custom offer' },
      ],
    },
    {
      id: 'offer-details',
      label: 'Offer details',
      type: 'text',
      placeholder: 'e.g., 30% off until Dec 31, Free bonus consultation included',
    },
    {
      id: 'urgency-level',
      label: 'Urgency level',
      type: 'select',
      options: [
        { value: 'soft', label: 'Soft (mention deadline)' },
        { value: 'medium', label: 'Medium (emphasize scarcity)' },
        { value: 'strong', label: 'Strong (FOMO messaging)' },
      ],
    },
  ],
  'style-refresh': [
    {
      id: 'style-change',
      label: 'What would you like to change?',
      type: 'select',
      options: [
        { value: 'color-palette', label: 'Color palette' },
        { value: 'industry-style', label: 'Industry style (consulting ↔ SaaS ↔ e-commerce)' },
        { value: 'tone', label: 'Overall tone (confident ↔ friendly ↔ professional)' },
        { value: 'dark-mode', label: 'Toggle dark/light mode' },
        { value: 'layout', label: 'Section layouts' },
      ],
    },
    {
      id: 'target-style',
      label: 'Target style',
      type: 'select',
      options: [
        { value: 'consulting', label: 'Consulting (trust, authority)' },
        { value: 'saas', label: 'SaaS (modern, clean)' },
        { value: 'ecommerce', label: 'E-commerce (vibrant, action)' },
        { value: 'creative', label: 'Creative (bold, unique)' },
      ],
    },
  ],
  'mini-landing': [
    {
      id: 'include-elements',
      label: 'What should be included?',
      type: 'select',
      options: [
        { value: 'hero-only', label: 'Hero with headline + CTA only' },
        { value: 'hero-stat', label: 'Hero + One key stat' },
        { value: 'hero-testimonial', label: 'Hero + Single testimonial' },
        { value: 'hero-trust', label: 'Hero + Trust badges' },
      ],
    },
    {
      id: 'cta-focus',
      label: 'CTA focus',
      type: 'select',
      options: [
        { value: 'same', label: 'Same as original' },
        { value: 'softer', label: 'Softer (learn more)' },
        { value: 'harder', label: 'Harder (buy now)' },
      ],
    },
  ],
};

export function VariantGeneratorModal({ 
  isOpen, 
  onClose, 
  originalPageData,
  onGenerateVariant 
}: VariantGeneratorModalProps) {
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId);
    setConfig({});
    setStep('configure');
  };

  const handleBack = () => {
    setStep('select');
    setSelectedType(null);
    setConfig({});
  };

  const handleClose = () => {
    setStep('select');
    setSelectedType(null);
    setConfig({});
    onClose();
  };

  const handleGenerate = async () => {
    if (!selectedType) return;
    
    setIsGenerating(true);
    try {
      await onGenerateVariant(selectedType, config);
      handleClose();
    } catch (error) {
      console.error('Failed to generate variant:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedTypeData = VARIANT_TYPES.find(t => t.id === selectedType);
  const questions = selectedType ? VARIANT_QUESTIONS[selectedType] || [] : [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            {step === 'configure' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-6 w-6 -ml-1 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <Sparkles className="w-5 h-5 text-cyan-400" />
            {step === 'select' ? 'Generate Variant' : selectedTypeData?.title}
          </DialogTitle>
        </DialogHeader>

        {step === 'select' ? (
          <div className="grid grid-cols-2 gap-3 py-4">
            {VARIANT_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => handleSelectType(type.id)}
                  className={cn(
                    "flex flex-col items-start gap-2 p-4 rounded-lg border transition-all text-left",
                    type.bgColor
                  )}
                >
                  <Icon className={cn("w-5 h-5", type.color)} />
                  <div>
                    <p className="font-medium text-white text-sm">{type.title}</p>
                    <p className="text-xs text-slate-400">{type.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-5 py-4">
            {questions.map((question) => (
              <div key={question.id} className="space-y-2">
                <Label className="text-sm text-slate-300">{question.label}</Label>
                
                {question.type === 'select' && question.options && (
                  <RadioGroup
                    value={config[question.id] || ''}
                    onValueChange={(value) => setConfig({ ...config, [question.id]: value })}
                    className="space-y-2"
                  >
                    {question.options.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-800/50 transition-colors"
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={`${question.id}-${option.value}`}
                          className="border-slate-500 text-cyan-500"
                        />
                        <Label
                          htmlFor={`${question.id}-${option.value}`}
                          className="text-sm text-slate-300 cursor-pointer flex-1"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                
                {question.type === 'text' && (
                  <Input
                    value={config[question.id] || ''}
                    onChange={(e) => setConfig({ ...config, [question.id]: e.target.value })}
                    placeholder={question.placeholder}
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                  />
                )}
              </div>
            ))}

            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Variant
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
