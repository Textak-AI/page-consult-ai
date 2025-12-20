import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

export interface TeamMember {
  role: string;
  name: string;
  credentials: string;
  linkedIn?: string;
}

export interface Advisor {
  name: string;
  affiliation: string;
  relevance: string;
}

export interface TeamAdvisorsData {
  leadership: TeamMember[];
  advisors: Advisor[];
  boardMembers?: string;
  combinedExperience?: string;
}

interface TeamAdvisorsStepProps {
  data: Partial<TeamAdvisorsData>;
  onChange: (updates: Partial<TeamAdvisorsData>) => void;
}

const DEFAULT_LEADERSHIP: TeamMember[] = [
  { role: 'CEO', name: '', credentials: '', linkedIn: '' },
  { role: 'CTO/CSO', name: '', credentials: '', linkedIn: '' },
  { role: 'CFO', name: '', credentials: '', linkedIn: '' },
];

export function TeamAdvisorsStep({ data, onChange }: TeamAdvisorsStepProps) {
  const leadership = data.leadership || DEFAULT_LEADERSHIP;
  const advisors = data.advisors || [];

  const updateLeadership = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...leadership];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ leadership: updated });
  };

  const addLeadershipMember = () => {
    onChange({ leadership: [...leadership, { role: '', name: '', credentials: '', linkedIn: '' }] });
  };

  const removeLeadershipMember = (index: number) => {
    const updated = [...leadership];
    updated.splice(index, 1);
    onChange({ leadership: updated });
  };

  const addAdvisor = () => {
    onChange({ advisors: [...advisors, { name: '', affiliation: '', relevance: '' }] });
  };

  const updateAdvisor = (index: number, field: keyof Advisor, value: string) => {
    const updated = [...advisors];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ advisors: updated });
  };

  const removeAdvisor = (index: number) => {
    const updated = [...advisors];
    updated.splice(index, 1);
    onChange({ advisors: updated });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Team & Advisors</h2>
        <p className="text-slate-400">Showcase your leadership and advisory board.</p>
      </div>

      <div className="space-y-6">
        {/* Leadership Team */}
        <div>
          <Label className="text-slate-400 text-base font-medium">Leadership Team</Label>
          <div className="space-y-4 mt-3">
            {leadership.map((member, index) => (
              <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <Input
                    placeholder="Role (e.g., CEO, CTO)"
                    value={member.role}
                    onChange={(e) => updateLeadership(index, 'role', e.target.value)}
                    className="w-40 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                  />
                  {index >= 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLeadershipMember(index)}
                      className="text-slate-400 hover:text-red-400 hover:bg-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Full Name"
                    value={member.name}
                    onChange={(e) => updateLeadership(index, 'name', e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                  />
                  <Input
                    placeholder="LinkedIn URL"
                    value={member.linkedIn || ''}
                    onChange={(e) => updateLeadership(index, 'linkedIn', e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                <Input
                  placeholder="Credentials / Background (e.g., Former VP at Google, 15 years in biotech)"
                  value={member.credentials}
                  onChange={(e) => updateLeadership(index, 'credentials', e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={addLeadershipMember}
              className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </div>
        </div>

        {/* Advisory Board */}
        <div>
          <Label className="text-slate-400 text-base font-medium">Advisory Board</Label>
          <div className="space-y-3 mt-3">
            {advisors.map((advisor, index) => (
              <div key={index} className="flex gap-3 items-start">
                <Input
                  placeholder="Name"
                  value={advisor.name}
                  onChange={(e) => updateAdvisor(index, 'name', e.target.value)}
                  className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
                <Input
                  placeholder="Affiliation"
                  value={advisor.affiliation}
                  onChange={(e) => updateAdvisor(index, 'affiliation', e.target.value)}
                  className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
                <Input
                  placeholder="Relevance"
                  value={advisor.relevance}
                  onChange={(e) => updateAdvisor(index, 'relevance', e.target.value)}
                  className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAdvisor(index)}
                  className="text-slate-400 hover:text-red-400 hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={addAdvisor}
              className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Advisor
            </Button>
          </div>
        </div>

        {/* Board of Directors */}
        <div>
          <Label htmlFor="boardMembers" className="text-slate-400">
            Board of Directors (if applicable)
          </Label>
          <Textarea
            id="boardMembers"
            placeholder="List board members and their affiliations..."
            value={data.boardMembers || ''}
            onChange={(e) => onChange({ boardMembers: e.target.value })}
            className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[80px]"
          />
        </div>

        {/* Combined Experience */}
        <div>
          <Label htmlFor="combinedExperience" className="text-slate-400">
            Combined team experience highlight
          </Label>
          <Input
            id="combinedExperience"
            placeholder="e.g., 100+ years combined experience in biotech, 3 successful exits"
            value={data.combinedExperience || ''}
            onChange={(e) => onChange({ combinedExperience: e.target.value })}
            className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
          />
        </div>
      </div>
    </div>
  );
}
