import { useState, useEffect, useRef } from 'react';
import { 
  X, Save, RefreshCw, AlertCircle,
  Building2, Users, Target, Award, MessageSquare, Shield,
  Zap, FileText, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface BriefSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: BriefField[];
}

interface BriefField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'list';
  value: string | string[];
  placeholder?: string;
  hint?: string;
}

interface StrategyBriefEditorProps {
  isOpen: boolean;
  onClose: () => void;
  consultationData: {
    businessName?: string;
    industry?: string;
    industryCategory?: string;
    websiteUrl?: string;
    idealClient?: string;
    audiencePainPoints?: string[];
    audienceGoals?: string[];
    uniqueStrength?: string;
    keyBenefits?: string[];
    competitorDifferentiator?: string;
    authorityMarkers?: string[];
    stats?: Array<{ value: string; label: string }>;
    credentials?: string;
    testimonials?: Array<{ quote: string; author: string; title?: string; company?: string }>;
    clientCount?: string;
    caseStudyHighlight?: string;
    guaranteeOffer?: string;
    faqItems?: Array<{ question: string; answer: string }>;
    riskReversals?: string[];
    primaryCTA?: string;
    secondaryCTA?: string;
    urgencyAngle?: string;
    primaryGoal?: string;
  };
  onSave: (updatedData: any) => Promise<void>;
  onRegenerate: (updatedData: any) => Promise<void>;
}

export function StrategyBriefEditor({
  isOpen,
  onClose,
  consultationData,
  onSave,
  onRegenerate,
}: StrategyBriefEditorProps) {
  const [activeSection, setActiveSection] = useState('business');
  const [editedData, setEditedData] = useState(consultationData);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Reset edited data when consultation data changes
  useEffect(() => {
    setEditedData(consultationData);
    setHasChanges(false);
  }, [consultationData]);

  // Track changes
  useEffect(() => {
    const changed = JSON.stringify(editedData) !== JSON.stringify(consultationData);
    setHasChanges(changed);
  }, [editedData, consultationData]);

  const sections: BriefSection[] = [
    {
      id: 'business',
      title: 'Business Info',
      icon: Building2,
      fields: [
        { id: 'businessName', label: 'Business Name', type: 'text', value: editedData.businessName || '', placeholder: 'Acme Corp' },
        { id: 'industry', label: 'Industry', type: 'text', value: editedData.industry || '', placeholder: 'B2B SaaS' },
        { id: 'websiteUrl', label: 'Website URL', type: 'text', value: editedData.websiteUrl || '', placeholder: 'https://example.com' },
      ],
    },
    {
      id: 'audience',
      title: 'Target Audience',
      icon: Users,
      fields: [
        { id: 'idealClient', label: 'Ideal Customer', type: 'textarea', value: editedData.idealClient || '', placeholder: 'Describe your ideal customer...', hint: 'Be specific about role, company size, and characteristics' },
        { id: 'audiencePainPoints', label: 'Pain Points', type: 'list', value: editedData.audiencePainPoints || [], placeholder: 'Add a pain point...' },
        { id: 'audienceGoals', label: 'Goals & Motivations', type: 'list', value: editedData.audienceGoals || [], placeholder: 'Add a goal...' },
      ],
    },
    {
      id: 'value',
      title: 'Value Proposition',
      icon: Target,
      fields: [
        { id: 'uniqueStrength', label: 'Unique Strength', type: 'textarea', value: editedData.uniqueStrength || '', placeholder: 'What makes you different?', hint: 'This becomes the core of your messaging' },
        { id: 'keyBenefits', label: 'Key Benefits', type: 'list', value: editedData.keyBenefits || [], placeholder: 'Add a benefit...' },
        { id: 'competitorDifferentiator', label: 'vs Competitors', type: 'textarea', value: editedData.competitorDifferentiator || '', placeholder: 'How are you different from alternatives?' },
      ],
    },
    {
      id: 'authority',
      title: 'Authority Signals',
      icon: Award,
      fields: [
        { id: 'authorityMarkers', label: 'Credentials & Awards', type: 'list', value: editedData.authorityMarkers || [], placeholder: 'Add credential...' },
        { id: 'credentials', label: 'Expertise Statement', type: 'textarea', value: editedData.credentials || '', placeholder: 'Years of experience, certifications, etc.' },
      ],
    },
    {
      id: 'proof',
      title: 'Social Proof',
      icon: MessageSquare,
      fields: [
        { id: 'clientCount', label: 'Client/User Count', type: 'text', value: editedData.clientCount || '', placeholder: '500+ customers' },
        { id: 'caseStudyHighlight', label: 'Best Result', type: 'textarea', value: editedData.caseStudyHighlight || '', placeholder: 'Describe your best customer outcome...' },
      ],
    },
    {
      id: 'trust',
      title: 'Trust Elements',
      icon: Shield,
      fields: [
        { id: 'guaranteeOffer', label: 'Guarantee', type: 'textarea', value: editedData.guaranteeOffer || '', placeholder: '30-day money-back guarantee...', hint: 'Reduces perceived risk for buyers' },
        { id: 'riskReversals', label: 'Risk Reversals', type: 'list', value: editedData.riskReversals || [], placeholder: 'Add risk reversal...' },
      ],
    },
    {
      id: 'cta',
      title: 'CTA Strategy',
      icon: Zap,
      fields: [
        { id: 'primaryGoal', label: 'Page Goal', type: 'text', value: editedData.primaryGoal || '', placeholder: 'Generate demo requests' },
        { id: 'primaryCTA', label: 'Primary CTA Text', type: 'text', value: editedData.primaryCTA || '', placeholder: 'Start Free Trial' },
        { id: 'secondaryCTA', label: 'Secondary CTA', type: 'text', value: editedData.secondaryCTA || '', placeholder: 'Watch Demo' },
        { id: 'urgencyAngle', label: 'Urgency Angle', type: 'textarea', value: editedData.urgencyAngle || '', placeholder: 'Limited time offer, deadline, scarcity...' },
      ],
    },
  ];

  const handleFieldChange = (fieldId: string, value: string | string[]) => {
    setEditedData(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleAddListItem = (fieldId: string, item: string) => {
    if (!item.trim()) return;
    const currentList = (editedData as any)[fieldId] || [];
    handleFieldChange(fieldId, [...currentList, item.trim()]);
  };

  const handleRemoveListItem = (fieldId: string, index: number) => {
    const currentList = (editedData as any)[fieldId] || [];
    handleFieldChange(fieldId, currentList.filter((_: any, i: number) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editedData);
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerate(editedData);
      onClose();
    } finally {
      setIsRegenerating(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderField = (field: BriefField) => {
    if (field.type === 'text') {
      return (
        <Input
          value={field.value as string}
          onChange={(e) => handleFieldChange(field.id, e.target.value)}
          placeholder={field.placeholder}
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
        />
      );
    }

    if (field.type === 'textarea') {
      return (
        <Textarea
          value={field.value as string}
          onChange={(e) => handleFieldChange(field.id, e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
        />
      );
    }

    if (field.type === 'list') {
      const items = field.value as string[];
      return (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2 group">
              <div className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300">
                {item}
              </div>
              <button
                onClick={() => handleRemoveListItem(field.id, index)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              placeholder={field.placeholder}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddListItem(field.id, (e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
              onClick={(e) => {
                const input = (e.target as HTMLElement).parentElement?.querySelector('input');
                if (input) {
                  handleAddListItem(field.id, input.value);
                  input.value = '';
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-xl bg-slate-900 border-slate-700 p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <SheetTitle className="text-white text-lg">Strategy Brief</SheetTitle>
                <p className="text-xs text-slate-400">Edit your consultation data</p>
              </div>
            </div>
            {hasChanges && (
              <span className="text-xs text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Unsaved changes
              </span>
            )}
          </div>
        </SheetHeader>

        {/* Section Navigation */}
        <div className="px-4 py-3 border-b border-slate-800 flex-shrink-0 overflow-x-auto">
          <div className="flex gap-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                    isActive 
                      ? "bg-purple-500/20 text-purple-300" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {section.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-8">
            {sections.map((section) => {
              const Icon = section.icon;
              
              return (
                <div
                  key={section.id}
                  ref={(el) => (sectionRefs.current[section.id] = el)}
                  className="scroll-mt-4"
                >
                  {/* Section Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-slate-800">
                      <Icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">{section.title}</h3>
                  </div>

                  {/* Fields */}
                  <div className="space-y-4 pl-8">
                    {section.fields.map((field) => (
                      <div key={field.id}>
                        <Label className="text-sm text-slate-300 mb-1.5 block">
                          {field.label}
                        </Label>
                        {field.hint && (
                          <p className="text-xs text-slate-500 mb-2">{field.hint}</p>
                        )}
                        {renderField(field)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-800/50 flex-shrink-0">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex-1 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
            
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white"
            >
              {isRegenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Save & Regenerate
            </Button>
          </div>
          
          <p className="text-xs text-slate-500 text-center mt-3">
            Regenerating will update your page with the new brief data
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
