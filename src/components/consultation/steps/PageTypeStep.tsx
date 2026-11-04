import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Briefcase, 
  Handshake, 
  Calendar,
  Rocket,
  Check
} from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          What kind of page are you building?
        </h2>
        <p className="text-slate-400">
          Different goals require different strategies
        </p>
      </div>

      {/* Page types you can build today: one row, so the step fits without scrolling */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PAGE_TYPES.filter(t => !t.comingSoon).map((type) => {
          const Icon = type.icon;
          const isSelected = value === type.id;

          return (
            <motion.button
              key={type.id}
              onClick={() => onChange(type.id)}
              className={cn(
                "relative p-4 rounded-xl border-2 text-left transition-all cursor-pointer",
                isSelected ? "border-cyan-500 bg-cyan-500/10" : "border-slate-700 hover:border-slate-500 bg-slate-800/60"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className={cn("p-2 rounded-lg", isSelected ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-700 text-slate-300")}>
                  <Icon className="w-5 h-5" />
                </div>
                {isSelected && <Check className="w-5 h-5 text-cyan-400" />}
              </div>
              <h3 className="font-semibold text-white mt-3">{type.title}</h3>
              <p className="text-sm text-slate-300 mt-1">{type.description}</p>
              <p className="text-xs text-slate-400 mt-2">e.g., {type.examples}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Coming soon: a line, not three disabled cards */}
      <p className="text-xs text-slate-400 text-center">
        Coming soon: {PAGE_TYPES.filter(t => t.comingSoon).map(t => t.title).join(', ')}.
      </p>

    </div>
  );
}

export { PAGE_TYPES };
