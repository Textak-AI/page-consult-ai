import { useNavigate } from 'react-router-dom';
import { MessageSquare, ClipboardList, ArrowRight, Check } from 'lucide-react';

export default function WizardChoice() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            How would you like to build?
          </h1>
          <p className="text-lg text-slate-400">
            Choose the experience that fits your style
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/wizard/chat')}
            className="group p-8 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-left hover:bg-slate-800 hover:border-purple-500/50 transition-all duration-200"
          >
            <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
              <MessageSquare className="w-7 h-7 text-purple-400" />
            </div>
            
            <h2 className="text-2xl font-semibold text-white mb-2">Guided Conversation</h2>
            <p className="text-slate-400 mb-6">Tell me about your business and I'll ask smart follow-ups</p>
            
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-purple-400" />
                Natural dialogue
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-purple-400" />
                AI-guided flow
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-purple-400" />
                ~5-8 minutes
              </div>
            </div>
            
            <p className="text-xs text-slate-500 mb-4">Best for: Quick start, discovery mode</p>
            
            <div className="flex items-center gap-2 text-purple-400 font-medium group-hover:gap-3 transition-all">
              Start Conversation
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => navigate('/wizard/form')}
            className="group p-8 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-left hover:bg-slate-800 hover:border-cyan-500/50 transition-all duration-200"
          >
            <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6">
              <ClipboardList className="w-7 h-7 text-cyan-400" />
            </div>
            
            <h2 className="text-2xl font-semibold text-white mb-2">Step-by-Step Form</h2>
            <p className="text-slate-400 mb-6">Fill in each field with full control over every detail</p>
            
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-cyan-400" />
                See all fields upfront
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-cyan-400" />
                Jump between steps
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-cyan-400" />
                ~8-12 minutes
              </div>
            </div>
            
            <p className="text-xs text-slate-500 mb-4">Best for: Detailed control, completeness</p>
            
            <div className="flex items-center gap-2 text-cyan-400 font-medium group-hover:gap-3 transition-all">
              Start Form
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          Both paths create the same high-quality landing page.
          <br />
          You can switch methods anytime—your progress is saved.
        </p>
      </div>
    </div>
  );
}
