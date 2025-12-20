import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface InvestmentOpportunityData {
  availableMaterials: string[];
  irEmail?: string;
  irPhone?: string;
  schedulerLink?: string;
  secFilingsLink?: string;
  pressReleasesLink?: string;
}

const MATERIAL_OPTIONS = [
  { id: 'investor-deck', label: 'Investor Deck / Presentation' },
  { id: 'financials', label: 'Financial Statements' },
  { id: 'white-paper', label: 'Technical White Paper' },
  { id: 'one-pager', label: 'One-Pager Summary' },
  { id: 'data-room', label: 'Virtual Data Room Access' },
];

interface InvestmentOpportunityStepProps {
  data: Partial<InvestmentOpportunityData>;
  onChange: (updates: Partial<InvestmentOpportunityData>) => void;
}

export function InvestmentOpportunityStep({ data, onChange }: InvestmentOpportunityStepProps) {
  const toggleMaterial = (materialId: string) => {
    const current = data.availableMaterials || [];
    const updated = current.includes(materialId)
      ? current.filter(m => m !== materialId)
      : [...current, materialId];
    onChange({ availableMaterials: updated });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Investment Opportunity</h2>
        <p className="text-slate-400">Materials and contact information for investors.</p>
      </div>

      <div className="space-y-5">
        {/* Available Materials */}
        <div>
          <Label className="text-slate-400">What materials can investors request?</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {MATERIAL_OPTIONS.map((material) => (
              <button
                key={material.id}
                onClick={() => toggleMaterial(material.id)}
                className={cn(
                  "p-3 rounded-lg border-2 text-left transition-all text-sm",
                  data.availableMaterials?.includes(material.id)
                    ? "border-cyan-500 bg-cyan-500/10 text-white"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-500 text-slate-300"
                )}
              >
                {material.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <Label className="text-slate-400">How should investors contact you?</Label>
          
          <div>
            <Label className="text-xs text-slate-500">IR Email *</Label>
            <Input
              type="email"
              placeholder="investors@company.com"
              value={data.irEmail || ''}
              onChange={(e) => onChange({ irEmail: e.target.value })}
              className="mt-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
          
          <div>
            <Label className="text-xs text-slate-500">IR Phone</Label>
            <Input
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={data.irPhone || ''}
              onChange={(e) => onChange({ irPhone: e.target.value })}
              className="mt-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
          
          <div>
            <Label className="text-xs text-slate-500">Meeting Scheduler Link</Label>
            <Input
              type="url"
              placeholder="https://calendly.com/yourcompany/investor-meeting"
              value={data.schedulerLink || ''}
              onChange={(e) => onChange({ schedulerLink: e.target.value })}
              className="mt-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
          
          <div>
            <Label className="text-xs text-slate-500">SEC Filings Link (if public)</Label>
            <Input
              type="url"
              placeholder="https://www.sec.gov/cgi-bin/browse-edgar?..."
              value={data.secFilingsLink || ''}
              onChange={(e) => onChange({ secFilingsLink: e.target.value })}
              className="mt-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
          
          <div>
            <Label className="text-xs text-slate-500">Press Releases / News Link</Label>
            <Input
              type="url"
              placeholder="https://yourcompany.com/news"
              value={data.pressReleasesLink || ''}
              onChange={(e) => onChange({ pressReleasesLink: e.target.value })}
              className="mt-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
