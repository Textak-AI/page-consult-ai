import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface InvestorProfileData {
  investorTypes: string[];
  companyStage: string;
  tickerSymbol?: string;
  investmentAsk: string;
  amountRaising?: string;
  investmentThesis: string;
}

const INVESTOR_TYPES = [
  { id: 'accredited', label: 'Accredited Individual Investors' },
  { id: 'vc-pe', label: 'Venture Capital / PE' },
  { id: 'institutional', label: 'Institutional Investors' },
  { id: 'retail', label: 'Retail Investors (public company)' },
];

const COMPANY_STAGES = [
  { id: 'pre-seed', label: 'Pre-seed / Seed' },
  { id: 'series-a-b', label: 'Series A-B' },
  { id: 'growth', label: 'Growth Stage' },
  { id: 'public', label: 'Public (provide ticker symbol)' },
];

const INVESTMENT_ASKS = [
  { id: 'equity-round', label: 'Equity investment round' },
  { id: 'public-awareness', label: 'Awareness for public stock' },
  { id: 'strategic-partnership', label: 'Strategic partnership with investment component' },
];

interface InvestorProfileStepProps {
  data: Partial<InvestorProfileData>;
  onChange: (updates: Partial<InvestorProfileData>) => void;
}

export function InvestorProfileStep({ data, onChange }: InvestorProfileStepProps) {
  const toggleInvestorType = (typeId: string) => {
    const current = data.investorTypes || [];
    const updated = current.includes(typeId)
      ? current.filter(t => t !== typeId)
      : [...current, typeId];
    onChange({ investorTypes: updated });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Investor Profile</h2>
        <p className="text-slate-400">Tell us about your target investors and funding goals.</p>
      </div>

      <div className="space-y-5">
        {/* Investor Types */}
        <div>
          <Label className="text-slate-400">What type of investors are you targeting? *</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {INVESTOR_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => toggleInvestorType(type.id)}
                className={cn(
                  "p-3 rounded-lg border-2 text-left transition-all text-sm",
                  data.investorTypes?.includes(type.id)
                    ? "border-cyan-500 bg-cyan-500/10 text-white"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-500 text-slate-300"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Company Stage */}
        <div>
          <Label className="text-slate-400">What stage is your company? *</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {COMPANY_STAGES.map((stage) => (
              <button
                key={stage.id}
                onClick={() => onChange({ companyStage: stage.id })}
                className={cn(
                  "p-3 rounded-lg border-2 text-left transition-all text-sm",
                  data.companyStage === stage.id
                    ? "border-cyan-500 bg-cyan-500/10 text-white"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-500 text-slate-300"
                )}
              >
                {stage.label}
              </button>
            ))}
          </div>
          {data.companyStage === 'public' && (
            <Input
              placeholder="Enter ticker symbol (e.g., NASDAQ: ACME)"
              value={data.tickerSymbol || ''}
              onChange={(e) => onChange({ tickerSymbol: e.target.value })}
              className="mt-3 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
            />
          )}
        </div>

        {/* Investment Ask */}
        <div>
          <Label className="text-slate-400">What's the primary investment ask? *</Label>
          <div className="grid grid-cols-1 gap-3 mt-2">
            {INVESTMENT_ASKS.map((ask) => (
              <button
                key={ask.id}
                onClick={() => onChange({ investmentAsk: ask.id })}
                className={cn(
                  "p-3 rounded-lg border-2 text-left transition-all text-sm",
                  data.investmentAsk === ask.id
                    ? "border-cyan-500 bg-cyan-500/10 text-white"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-500 text-slate-300"
                )}
              >
                {ask.label}
              </button>
            ))}
          </div>
          {data.investmentAsk === 'equity-round' && (
            <Input
              placeholder="Amount raising (e.g., $5M Series A)"
              value={data.amountRaising || ''}
              onChange={(e) => onChange({ amountRaising: e.target.value })}
              className="mt-3 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
            />
          )}
        </div>

        {/* Investment Thesis */}
        <div>
          <Label htmlFor="investmentThesis" className="text-slate-400">
            One-line investment thesis *
          </Label>
          <Textarea
            id="investmentThesis"
            placeholder="e.g., First-mover in a $50B market with breakthrough technology and FDA fast-track designation"
            value={data.investmentThesis || ''}
            onChange={(e) => onChange({ investmentThesis: e.target.value })}
            className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[80px]"
          />
        </div>
      </div>
    </div>
  );
}
