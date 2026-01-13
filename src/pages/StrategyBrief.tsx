import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Edit2, Check, X } from 'lucide-react';
import { updateFlowState } from '@/services/flowEngine';

interface StrategyBriefData {
  positioning?: string;
  targetAudience?: string;
  industry?: string;
  headlines?: {
    primary?: string;
    supporting?: string;
  };
  valueProps?: string;
  proofPoints?: string[];
  objectionHandlers?: string[];
  ctaStrategy?: {
    primary?: string;
    secondary?: string;
  };
  cardNotes?: Record<string, string>;
}

interface ConsultationData {
  id: string;
  strategy_brief?: StrategyBriefData;
  flow_state?: string;
}

export default function StrategyBrief() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [consultation, setConsultation] = useState<ConsultationData | null>(null);
  const [brief, setBrief] = useState<StrategyBriefData | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const consultationId = searchParams.get('consultationId');

  useEffect(() => {
    loadBrief();
  }, [consultationId]);

  async function loadBrief() {
    if (!consultationId) {
      navigate('/demo');
      return;
    }

    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', consultationId)
      .single();

    if (error || !data) {
      navigate('/demo');
      return;
    }

    setConsultation(data as ConsultationData);
    setBrief(data.strategy_brief as StrategyBriefData);
    setLoading(false);
  }

  function startEditing(field: string, currentValue: string) {
    setEditingField(field);
    setEditValue(currentValue || '');
  }

  async function saveEdit() {
    if (!editingField || !brief) return;

    setSaving(true);

    const updatedBrief = { ...brief };
    
    // Handle nested fields
    if (editingField.includes('.')) {
      const [parent, child] = editingField.split('.');
      const parentObj = (updatedBrief as Record<string, unknown>)[parent] as Record<string, unknown> || {};
      (updatedBrief as Record<string, unknown>)[parent] = { ...parentObj, [child]: editValue };
    } else {
      (updatedBrief as Record<string, unknown>)[editingField] = editValue;
    }

    setBrief(updatedBrief);

    // Save to database
    await supabase
      .from('consultations')
      .update({ strategy_brief: updatedBrief })
      .eq('id', consultationId);

    setEditingField(null);
    setEditValue('');
    setSaving(false);
  }

  function cancelEdit() {
    setEditingField(null);
    setEditValue('');
  }

  async function handleContinue() {
    await updateFlowState(consultationId!, 'brief_generated', 'brief_approved');
    navigate(`/huddle?type=pre_page&consultationId=${consultationId}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center text-white">
        <p>No brief found. <button onClick={() => navigate('/demo')} className="text-purple-400 hover:underline">Start over</button></p>
      </div>
    );
  }

  const EditableField = ({ label, field, value }: { label: string; field: string; value: string }) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">{label}</label>
        {editingField !== field && (
          <button 
            onClick={() => startEditing(field, value)}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>
      {editingField === field ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 bg-[#1a1a2e] border border-purple-500 rounded px-3 py-2 text-white focus:outline-none"
            autoFocus
          />
          <button onClick={saveEdit} disabled={saving} className="text-green-400 hover:text-green-300 p-2">
            <Check className="w-5 h-5" />
          </button>
          <button onClick={cancelEdit} className="text-red-400 hover:text-red-300 p-2">
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <p className="text-white text-lg">{value || <span className="text-gray-500 italic">Not set</span>}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Strategy Brief</h1>
          <p className="text-gray-400">Review and refine before we build your page</p>
        </div>

        {/* Brief Content */}
        <div className="bg-[#1a1a2e] rounded-xl p-8 border border-gray-700/50 mb-8">
          <EditableField label="Positioning" field="positioning" value={brief.positioning || ''} />
          <EditableField label="Target Audience" field="targetAudience" value={brief.targetAudience || ''} />
          <EditableField label="Industry" field="industry" value={brief.industry || ''} />
          <EditableField label="Primary Headline" field="headlines.primary" value={brief.headlines?.primary || ''} />
          <EditableField label="Supporting Headline" field="headlines.supporting" value={brief.headlines?.supporting || ''} />

          {/* Proof Points */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-400 uppercase tracking-wider block mb-2">
              Proof Points
            </label>
            <div className="space-y-2">
              {Array.isArray(brief.proofPoints) && brief.proofPoints.map((point: string, i: number) => (
                <p key={i} className="text-white">• {point}</p>
              ))}
            </div>
          </div>

          {/* CTA Strategy */}
          <div className="grid grid-cols-2 gap-4">
            <EditableField label="Primary CTA" field="ctaStrategy.primary" value={brief.ctaStrategy?.primary || ''} />
            <EditableField label="Secondary CTA" field="ctaStrategy.secondary" value={brief.ctaStrategy?.secondary || ''} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/huddle?type=pre_brief&consultationId=${consultationId}`)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Huddle
          </button>
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg text-white font-medium hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-500/25"
          >
            Continue to Page Generation →
          </button>
        </div>
      </div>
    </div>
  );
}
