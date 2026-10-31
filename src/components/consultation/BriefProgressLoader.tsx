/**
 * Loading screen while the strategy brief is written.
 * Lists the steps that actually run (see src/lib/progress/honestSteps) with no
 * fake timers, counters or claimed analysis.
 */

import { Loader2 } from 'lucide-react';
import { BRIEF_GENERATION_STEPS } from '@/lib/progress/honestSteps';

export function BriefProgressLoader() {
  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center px-4">
      <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
      <h2 className="text-xl font-semibold text-white mt-6 text-center">
        Writing your strategy brief
      </h2>
      <p className="text-slate-400 text-sm mt-2 text-center">
        Everything in it comes from your answers.
      </p>
      <ul className="mt-6 space-y-2 text-sm text-slate-400">
        {BRIEF_GENERATION_STEPS.map((step) => (
          <li key={step} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60" />
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BriefProgressLoader;
