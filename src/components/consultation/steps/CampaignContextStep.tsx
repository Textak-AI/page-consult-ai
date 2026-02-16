import { Mail, Target, Calendar, Download, RefreshCw, Video, GitBranch, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type PagePurpose = 
  | 'outbound-campaign' 
  | 'service-spotlight' 
  | 'event-conference' 
  | 'lead-magnet' 
  | 'retargeting' 
  | 'webinar-registration' 
  | 'ab-test' 
  | 'primary-site';

export type TrafficSource = 
  | 'cold-email' 
  | 'linkedin-outreach' 
  | 'paid-ads' 
  | 'organic' 
  | 'referral' 
  | 'retargeting' 
  | 'conference' 
  | 'direct';

export interface CampaignContextData {
  pagePurpose?: PagePurpose;
  trafficSource?: TrafficSource;
  campaignTrigger?: string;
  campaignAudienceSegment?: string;
  spotlightService?: string;
  eventGoal?: string;
  hasExistingWebsite?: boolean;
}

const PAGE_PURPOSE_OPTIONS = [
  { 
    value: 'outbound-campaign' as PagePurpose, 
    label: 'Outbound Campaign', 
    description: 'Landing page for cold email or LinkedIn outreach',
    Icon: Mail,
  },
  { 
    value: 'service-spotlight' as PagePurpose, 
    label: 'Service Spotlight', 
    description: 'Promote one specific offering in depth',
    Icon: Target,
  },
  { 
    value: 'event-conference' as PagePurpose, 
    label: 'Event or Conference', 
    description: 'Drive registrations or booth visits',
    Icon: Calendar,
  },
  { 
    value: 'lead-magnet' as PagePurpose, 
    label: 'Lead Magnet / Download', 
    description: 'Capture emails with a valuable resource',
    Icon: Download,
  },
  { 
    value: 'retargeting' as PagePurpose, 
    label: 'Retargeting / Warm Audience', 
    description: 'Page for people who already know you',
    Icon: RefreshCw,
  },
  { 
    value: 'webinar-registration' as PagePurpose, 
    label: 'Webinar or Event Registration', 
    description: 'Drive signups for an online event',
    Icon: Video,
  },
  { 
    value: 'ab-test' as PagePurpose, 
    label: 'A/B Messaging Test', 
    description: 'Test new messaging angles',
    Icon: GitBranch,
  },
  { 
    value: 'primary-site' as PagePurpose, 
    label: 'Primary Web Presence', 
    description: "I don't have a website yet — build it all",
    Icon: Globe,
  },
];

interface CampaignContextStepProps {
  data: CampaignContextData;
  websiteUrl?: string;
  onChange: (updates: Partial<CampaignContextData>) => void;
}

export function CampaignContextStep({ data, websiteUrl, onChange }: CampaignContextStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">What's This Page For?</h2>
        <p className="text-slate-400">
          Understanding the purpose helps us build a page that fits your campaign, 
          not just your brand.
        </p>
      </div>

      {/* Website context acknowledgment */}
      {websiteUrl && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-sm text-gray-300">
          <span className="text-cyan-400 font-medium">We found your website:</span>{' '}
          {websiteUrl} — so this landing page isn't replacing your 
          site. It's serving a specific strategic purpose.
        </div>
      )}

      {/* Page Purpose Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-300">
          What's driving the need for this page?
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PAGE_PURPOSE_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ pagePurpose: option.value })}
              className={`text-left p-4 rounded-xl border transition-all ${
                data.pagePurpose === option.value
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <option.Icon className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-white">{option.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{option.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conditional follow-ups */}
      {data.pagePurpose === 'outbound-campaign' && (
        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-sm font-medium text-gray-300">
              Who are you targeting with this campaign?
            </Label>
            <Input
              type="text"
              placeholder="e.g., VP of Market Access at Top 20 Pharma companies"
              value={data.campaignAudienceSegment || ''}
              onChange={(e) => onChange({ campaignAudienceSegment: e.target.value })}
              className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-300">
              How will they reach this page?
            </Label>
            <Select 
              value={data.trafficSource || ''} 
              onValueChange={(v) => onChange({ trafficSource: v as TrafficSource })}
            >
              <SelectTrigger className="mt-2 bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Select traffic source..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cold-email">Cold email</SelectItem>
                <SelectItem value="linkedin-outreach">LinkedIn outreach</SelectItem>
                <SelectItem value="paid-ads">Paid ads (Google/LinkedIn)</SelectItem>
                <SelectItem value="direct">Direct mail / QR code</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {data.pagePurpose === 'event-conference' && (
        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-sm font-medium text-gray-300">
              Which event or conference?
            </Label>
            <Input
              type="text"
              placeholder="e.g., NASP Annual Meeting 2026"
              value={data.campaignTrigger || ''}
              onChange={(e) => onChange({ campaignTrigger: e.target.value })}
              className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-300">
              What's the goal?
            </Label>
            <Select 
              value={data.eventGoal || ''} 
              onValueChange={(v) => onChange({ eventGoal: v })}
            >
              <SelectTrigger className="mt-2 bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Select goal..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="booth-visits">Drive booth visits</SelectItem>
                <SelectItem value="meeting-bookings">Book meetings at the event</SelectItem>
                <SelectItem value="post-event-followup">Post-event follow-up page</SelectItem>
                <SelectItem value="registration">Drive event registration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {data.pagePurpose === 'service-spotlight' && (
        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-sm font-medium text-gray-300">
              Which specific service or product are we spotlighting?
            </Label>
            <Input
              type="text"
              placeholder="e.g., Cloud Script™ Patient Access Platform"
              value={data.spotlightService || ''}
              onChange={(e) => onChange({ spotlightService: e.target.value })}
              className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
        </div>
      )}

      {data.pagePurpose === 'retargeting' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-sm text-gray-300 mt-2">
          <span className="text-cyan-400 font-medium">Smart move.</span>{' '}
          Since visitors already know you, we'll skip the long intro and go 
          straight to your strongest offer. The page will be shorter and more direct.
        </div>
      )}

      {data.pagePurpose === 'primary-site' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-sm text-gray-300 mt-2">
          <span className="text-cyan-400 font-medium">Great — we'll build comprehensive.</span>{' '}
          This page will serve as your main web presence, covering your full 
          story, services, proof, and a strong call-to-action.
        </div>
      )}

      {data.pagePurpose === 'lead-magnet' && (
        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-sm font-medium text-gray-300">
              What's the downloadable resource?
            </Label>
            <Input
              type="text"
              placeholder="e.g., 2026 Market Access Playbook for Specialty Pharma"
              value={data.campaignTrigger || ''}
              onChange={(e) => onChange({ campaignTrigger: e.target.value })}
              className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
        </div>
      )}

      {data.pagePurpose === 'webinar-registration' && (
        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-sm font-medium text-gray-300">
              What's the webinar or event topic?
            </Label>
            <Input
              type="text"
              placeholder="e.g., How Top 20 Pharma Firms Cut Time-to-Market by 40%"
              value={data.campaignTrigger || ''}
              onChange={(e) => onChange({ campaignTrigger: e.target.value })}
              className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
