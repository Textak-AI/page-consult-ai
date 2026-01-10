import { cn } from '@/lib/utils';
import { Palette, BarChart3, Code, Megaphone, GraduationCap, Briefcase } from 'lucide-react';
import type { IndustryVariant } from '@/lib/industryDetection';

interface SubOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant: IndustryVariant;
}

const PROFESSIONAL_SERVICES_OPTIONS: SubOption[] = [
  { id: 'creative', label: 'Creative / Design Agency', icon: <Palette className="w-4 h-4" />, variant: 'creative' },
  { id: 'marketing', label: 'Marketing / Advertising', icon: <Megaphone className="w-4 h-4" />, variant: 'creative' },
  { id: 'consulting', label: 'Management Consulting', icon: <BarChart3 className="w-4 h-4" />, variant: 'consulting' },
  { id: 'dev', label: 'Dev / Tech Agency', icon: <Code className="w-4 h-4" />, variant: 'consulting' },
  { id: 'coaching', label: 'Coaching / Training', icon: <GraduationCap className="w-4 h-4" />, variant: 'consulting' },
  { id: 'other', label: 'Other Services', icon: <Briefcase className="w-4 h-4" />, variant: 'consulting' },
];

interface IndustryConfirmationCardProps {
  detectedCategory: string;
  onSelect: (variant: IndustryVariant, displayName: string) => void;
  className?: string;
}

export const IndustryConfirmationCard = ({ 
  detectedCategory, 
  onSelect,
  className 
}: IndustryConfirmationCardProps) => {
  // Only show for categories with important subcategories
  // Match on variant names or display names
  const isProfessionalServices = 
    detectedCategory === 'Professional Services' ||
    detectedCategory === 'consulting' ||
    detectedCategory === 'creative' ||
    detectedCategory === 'Consulting' ||
    detectedCategory === 'Creative Agency';

  if (!isProfessionalServices) {
    return null;
  }

  return (
    <div className={cn(
      "bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 mt-3",
      className
    )}>
      <p className="text-sm text-slate-300 mb-3">
        I want to get your design style right. Which best describes you?
      </p>

      <div className="grid grid-cols-2 gap-2">
        {PROFESSIONAL_SERVICES_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.variant, option.label)}
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-sm",
              "bg-slate-800/80 border border-slate-700/50",
              "hover:border-cyan-500/50 hover:bg-cyan-500/10",
              "transition-all duration-150"
            )}
          >
            <span className="text-slate-400">{option.icon}</span>
            <span className="text-slate-200">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
