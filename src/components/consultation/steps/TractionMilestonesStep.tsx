import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface TractionMilestonesData {
  milestones: string[];
  catalysts: Array<{ description: string; expectedDate: string }>;
  tam?: string;
  sam?: string;
  som?: string;
  keyMetrics?: string;
}

const MILESTONE_OPTIONS = [
  { id: 'fda-designations', label: 'FDA designations (Orphan Drug, Fast Track, etc.)' },
  { id: 'patents', label: 'Patents filed/granted' },
  { id: 'clinical-trials', label: 'Clinical trial stages' },
  { id: 'revenue-milestones', label: 'Revenue milestones' },
  { id: 'partnerships', label: 'Key partnerships' },
  { id: 'team-hires', label: 'Key team hires' },
  { id: 'product-launches', label: 'Product launches' },
  { id: 'customer-wins', label: 'Major customer wins' },
];

interface TractionMilestonesStepProps {
  data: Partial<TractionMilestonesData>;
  onChange: (updates: Partial<TractionMilestonesData>) => void;
}

export function TractionMilestonesStep({ data, onChange }: TractionMilestonesStepProps) {
  const toggleMilestone = (milestoneId: string) => {
    const current = data.milestones || [];
    const updated = current.includes(milestoneId)
      ? current.filter(m => m !== milestoneId)
      : [...current, milestoneId];
    onChange({ milestones: updated });
  };

  const addCatalyst = () => {
    const current = data.catalysts || [];
    onChange({ catalysts: [...current, { description: '', expectedDate: '' }] });
  };

  const updateCatalyst = (index: number, field: 'description' | 'expectedDate', value: string) => {
    const current = [...(data.catalysts || [])];
    current[index] = { ...current[index], [field]: value };
    onChange({ catalysts: current });
  };

  const removeCatalyst = (index: number) => {
    const current = [...(data.catalysts || [])];
    current.splice(index, 1);
    onChange({ catalysts: current });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Traction & Milestones</h2>
        <p className="text-slate-400">Showcase your achievements and upcoming catalysts.</p>
      </div>

      <div className="space-y-5">
        {/* Key Milestones */}
        <div>
          <Label className="text-slate-400">Key milestones achieved (select all that apply)</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {MILESTONE_OPTIONS.map((milestone) => (
              <button
                key={milestone.id}
                onClick={() => toggleMilestone(milestone.id)}
                className={cn(
                  "p-3 rounded-lg border-2 text-left transition-all text-sm",
                  data.milestones?.includes(milestone.id)
                    ? "border-cyan-500 bg-cyan-500/10 text-white"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-500 text-slate-300"
                )}
              >
                {milestone.label}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div>
          <Label htmlFor="keyMetrics" className="text-slate-400">
            Key metrics / numbers to highlight
          </Label>
          <Textarea
            id="keyMetrics"
            placeholder="e.g., $2M ARR, 150% YoY growth, 50+ enterprise customers, 95% retention rate"
            value={data.keyMetrics || ''}
            onChange={(e) => onChange({ keyMetrics: e.target.value })}
            className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[80px]"
          />
        </div>

        {/* Upcoming Catalysts */}
        <div>
          <Label className="text-slate-400">Upcoming catalysts (next 12 months)</Label>
          <div className="space-y-3 mt-2">
            {(data.catalysts || []).map((catalyst, index) => (
              <div key={index} className="flex gap-3 items-start">
                <Input
                  placeholder="Catalyst description"
                  value={catalyst.description}
                  onChange={(e) => updateCatalyst(index, 'description', e.target.value)}
                  className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
                <Input
                  type="text"
                  placeholder="Expected date"
                  value={catalyst.expectedDate}
                  onChange={(e) => updateCatalyst(index, 'expectedDate', e.target.value)}
                  className="w-40 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCatalyst(index)}
                  className="text-slate-400 hover:text-red-400 hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={addCatalyst}
              className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Catalyst
            </Button>
          </div>
        </div>

        {/* Market Size */}
        <div className="space-y-3">
          <Label className="text-slate-400">Market size</Label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-slate-500">TAM (Total Addressable)</Label>
              <Input
                placeholder="e.g., $50B"
                value={data.tam || ''}
                onChange={(e) => onChange({ tam: e.target.value })}
                className="mt-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500">SAM (Serviceable)</Label>
              <Input
                placeholder="e.g., $10B"
                value={data.sam || ''}
                onChange={(e) => onChange({ sam: e.target.value })}
                className="mt-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500">SOM (Obtainable)</Label>
              <Input
                placeholder="e.g., $500M"
                value={data.som || ''}
                onChange={(e) => onChange({ som: e.target.value })}
                className="mt-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
