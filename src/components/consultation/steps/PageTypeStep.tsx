import { Users, TrendingUp, Briefcase, Handshake, Calendar, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PageType = 
  | 'customer-acquisition' 
  | 'investor-relations' 
  | 'recruitment' 
  | 'partner-channel' 
  | 'event-launch';

export interface PageTypeConfig {
  id: PageType;
  icon: typeof Users;
  title: string;
  description: string;
  examples: string;
  sections: string[];
}

export const PAGE_TYPES: PageTypeConfig[] = [
  {
    id: 'customer-acquisition',
    icon: Users,
    title: 'Customer Acquisition',
    description: 'Convert visitors into leads or customers',
    examples: 'Product launches, service offerings, lead magnets',
    sections: ['hero', 'problem-solution', 'features', 'social-proof', 'pricing', 'faq', 'cta'],
  },
  {
    id: 'investor-relations',
    icon: TrendingUp,
    title: 'Investor Relations',
    description: 'Attract investors and communicate company value',
    examples: 'Funding rounds, public company IR, pitch pages',
    sections: ['hero-ir', 'investment-thesis', 'problem-opportunity', 'solution', 'traction', 'market-size', 'team', 'financials', 'catalysts', 'ir-contact', 'disclaimers'],
  },
  {
    id: 'recruitment',
    icon: Briefcase,
    title: 'Recruitment / Careers',
    description: 'Attract top talent to your company',
    examples: 'Careers page, hiring campaigns, employer branding',
    sections: ['hero-careers', 'culture', 'benefits', 'team-highlights', 'openings', 'application-cta'],
  },
  {
    id: 'partner-channel',
    icon: Handshake,
    title: 'Partner / Channel',
    description: 'Recruit partners, resellers, or affiliates',
    examples: 'Partner programs, affiliate signups, channel sales',
    sections: ['hero-partner', 'partner-benefits', 'program-tiers', 'success-stories', 'partner-cta'],
  },
  {
    id: 'event-launch',
    icon: Calendar,
    title: 'Event / Launch',
    description: 'Drive registrations for events or launches',
    examples: 'Webinars, conferences, product launches, waitlists',
    sections: ['hero-event', 'event-details', 'speakers', 'agenda', 'registration-cta'],
  },
];

interface PageTypeStepProps {
  selectedType: PageType | undefined;
  onSelect: (type: PageType) => void;
}

export function PageTypeStep({ selectedType, onSelect }: PageTypeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">What Type of Page Are You Building?</h2>
        <p className="text-slate-400">This determines the structure and messaging strategy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PAGE_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;

          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={cn(
                "p-6 rounded-xl border-2 text-left transition-all",
                isSelected
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-slate-700 hover:border-slate-500 bg-slate-800/50"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-lg",
                  isSelected ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-700 text-slate-400"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{type.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{type.description}</p>
                  <p className="text-xs text-slate-500 mt-2">e.g., {type.examples}</p>
                </div>
                {isSelected && (
                  <Check className="w-5 h-5 text-cyan-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
