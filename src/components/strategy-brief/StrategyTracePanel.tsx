import { editedSections, type StrategyTrace } from '@/lib/strategyTrace';

/**
 * "How this page was built": a read-only view of the page's stored strategy
 * trace. Every sentence it shows is either one of the fixed labels below or a
 * string from the trace itself (owner quotes, recorded decisions), so it can
 * never claim more than the build did (benchmark R8, tested).
 */
export const TRACE_UI = {
  title: 'How this page was built',
  intro: 'From your answers to the page, step by step. Quotes are your own words.',
  none: 'This page was built before we kept a record of how. Pages built from now on have one.',
  thin: 'Your answers were short, so these choices are leanings rather than firm calls.',
  buyer: 'Your buyer',
  choices: 'Six messaging choices, scored from your answers',
  opening: 'How the page opens',
  design: 'The look',
  brand: 'Your brand colour on buttons and accents',
  sections: 'Section by section',
  from: 'From your answers',
  noSource: 'Written from your brief; no single answer matches it closely.',
  edited: 'Edited by you',
  editedNote: 'You changed this after it was built, so it reflects your edit, not the original strategy.',
  waiting: 'Waiting on your answers',
} as const;

export function StrategyTracePanel({ trace, sections }: { trace?: StrategyTrace | null; sections?: Array<{ type: string; content?: unknown }> }) {
  if (!trace || trace.version !== 1) {
    return <section aria-label={TRACE_UI.title} className="py-6"><h2 className="text-xl font-semibold mb-2">{TRACE_UI.title}</h2><p className="text-sm opacity-70">{TRACE_UI.none}</p></section>;
  }
  const edited = editedSections(trace, sections || []);
  return (
    <section aria-label={TRACE_UI.title} className="py-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">{TRACE_UI.title}</h2>
        <p className="text-sm opacity-70">{TRACE_UI.intro}</p>
        {trace.evidence === 'thin' && <p className="mt-2 text-sm opacity-80">{TRACE_UI.thin}</p>}
      </div>

      {trace.buyer && (
        <div>
          <h3 className="text-sm font-semibold opacity-70 mb-1">{TRACE_UI.buyer}</h3>
          <p>{trace.buyer.label}</p>
          <h3 className="text-sm font-semibold opacity-70 mt-4 mb-2">{TRACE_UI.choices}</h3>
          <dl className="grid grid-cols-1 gap-2">
            {trace.buyer.choices.map((c) => (
              <div key={c.question} className="flex flex-wrap justify-between gap-x-4 text-sm">
                <dt className="opacity-70">{c.question}</dt><dd className="font-medium">{c.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {trace.opening && (
        <div>
          <h3 className="text-sm font-semibold opacity-70 mb-1">{TRACE_UI.opening}</h3>
          <p>{trace.opening.label}</p>
          <p className="text-sm opacity-70">{trace.opening.because}</p>
        </div>
      )}

      {(trace.design.label || trace.design.brandColor) && (
        <div>
          <h3 className="text-sm font-semibold opacity-70 mb-1">{TRACE_UI.design}</h3>
          {trace.design.label && <p>{trace.design.label}</p>}
          {trace.design.because && <p className="text-sm opacity-70">{trace.design.because}</p>}
          {trace.design.brandColor && (
            <p className="mt-1 flex items-center gap-2 text-sm">
              <span aria-hidden="true" className="inline-block h-4 w-4 rounded" style={{ background: trace.design.brandColor }} />
              <span>{TRACE_UI.brand}</span><code className="opacity-70">{trace.design.brandColor}</code>
            </p>
          )}
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold opacity-70 mb-2">{TRACE_UI.sections}</h3>
        <ol className="space-y-4">
          {trace.sections.map((s) => (
            <li key={`${s.index}-${s.type}`} className="rounded-lg border border-white/10 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{s.name}</span>
                {s.design.surface && <span className="text-xs opacity-60">{s.design.surface}</span>}
                {edited.has(s.index) && <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">{TRACE_UI.edited}</span>}
              </div>
              {edited.has(s.index) && <p className="mt-1 text-xs opacity-70">{TRACE_UI.editedNote}</p>}
              {s.decisions.length > 0 && <ul className="mt-2 space-y-1 text-sm">{s.decisions.map((d, i) => <li key={i}>{d}</li>)}</ul>}
              <p className="mt-2 text-xs font-semibold opacity-60">{TRACE_UI.from}</p>
              {s.sources.length > 0
                ? <ul className="mt-1 space-y-2 text-sm">{s.sources.map((src) => <li key={src.field}><span className="opacity-70">{src.label}: </span><q>{src.quote}</q></li>)}</ul>
                : <p className="mt-1 text-sm opacity-70">{TRACE_UI.noSource}</p>}
            </li>
          ))}
        </ol>
      </div>

      {trace.waiting.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold opacity-70 mb-2">{TRACE_UI.waiting}</h3>
          <ul className="space-y-1 text-sm">{trace.waiting.map((w) => <li key={w.section}><span className="font-medium">{w.name}: </span>{w.needs}</li>)}</ul>
        </div>
      )}
    </section>
  );
}
