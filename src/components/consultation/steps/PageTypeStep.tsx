import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Briefcase, 
  Handshake, 
  Calendar,
  Rocket,
  Check,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageType {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  examples: string;
  comingSoon?: boolean;
}

export type PageTypeId = 
  | 'customer-acquisition' 
  | 'beta-prelaunch'
  | 'investor-relations' 
  | 'recruitment' 
  | 'partner-channel' 
  | 'event-launch';

const PAGE_TYPES: PageType[] = [
  {
    id: 'customer-acquisition',
    icon: Users,
    title: 'Customer Acquisition',
    description: 'Convert visitors into leads or customers',
    examples: 'Product pages, service offerings, lead magnets',
  },
  {
    id: 'beta-prelaunch',
    icon: Rocket,
    title: 'Beta / Pre-Launch',
    description: 'Build hype and capture early adopters',
    examples: 'Waitlists, coming soon, Product Hunt launches',
  },
  {
    id: 'investor-relations',
    icon: TrendingUp,
    title: 'Investor Relations',
    description: 'Attract investors and communicate value',
    examples: 'Funding rounds, public company IR, pitch pages',
  },
  {
    id: 'recruitment',
    icon: Briefcase,
    title: 'Recruitment / Careers',
    description: 'Attract top talent to your company',
    examples: 'Careers page, hiring campaigns',
    comingSoon: true,
  },
  {
    id: 'partner-channel',
    icon: Handshake,
    title: 'Partner / Channel',
    description: 'Recruit partners, resellers, or affiliates',
    examples: 'Partner programs, affiliate signups',
    comingSoon: true,
  },
  {
    id: 'event-launch',
    icon: Calendar,
    title: 'Event / Launch',
    description: 'Drive registrations for events',
    examples: 'Webinars, conferences, product launches',
    comingSoon: true,
  },
];

interface Props {
  value: string | null;
  onChange: (pageType: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function PageTypeStep({ value, onChange, onContinue, onBack }: Props) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          What kind of page are you building?
        </h2>
        <p className="text-slate-400">
          Different goals require different strategies
        </p>
      </div>

      {/* Page Type Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PAGE_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = value === type.id;
          const isDisabled = type.comingSoon;

          return (
            <motion.button
              key={type.id}
              onClick={() => !isDisabled && onChange(type.id)}
              disabled={isDisabled}
              className={cn(
                "relative p-6 rounded-xl border-2 text-left transition-all",
                isSelected
                  ? "border-cyan-500 bg-cyan-500/10"
                  : isDisabled
                  ? "border-slate-700/50 bg-slate-800/30 opacity-60 cursor-not-allowed"
                  : "border-slate-700 hover:border-slate-500 bg-slate-800/50 cursor-pointer"
              )}
              whileHover={!isDisabled ? { scale: 1.02 } : undefined}
              whileTap={!isDisabled ? { scale: 0.98 } : undefined}
            >
              {type.comingSoon && (
                <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-medium bg-slate-700 text-slate-300 rounded-full">
                  Coming Soon
                </span>
              )}
              
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
                {isSelected && <Check className="w-5 h-5 text-cyan-400" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} className="text-slate-400">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={onContinue} disabled={!value} className="bg-cyan-500 hover:bg-cyan-600">
          Continue <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

export { PAGE_TYPES };
