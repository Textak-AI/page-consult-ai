import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  HOW_IT_WORKS,
  firstNameOf,
  needsOnboarding,
  normalizeWebsite,
  onboardingErrors,
  type OnboardingAnswers,
} from '@/lib/onboarding';

/**
 * Customer onboarding, shown once after signup: who you are, then how it works,
 * then straight into the wizard (with the website step already reading the site
 * when one was given).
 */
export default function Welcome() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState<1 | 2>(1);
  const [answers, setAnswers] = useState<OnboardingAnswers>({ name: '', businessName: '', website: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof OnboardingAnswers, string>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signup', { replace: true, state: { redirectTo: '/welcome' } });
        return;
      }
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, company_name, website, onboarded_at')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelled) return;
      if (!needsOnboarding(profile, !!error)) {
        navigate('/wizard/form', { replace: true });
        return;
      }
      setUserId(user.id);
      setAnswers({
        name: profile?.full_name || user.user_metadata?.full_name || '',
        businessName: profile?.company_name || '',
        website: profile?.website || '',
      });
      setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const set = (key: keyof OnboardingAnswers) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers((a) => ({ ...a, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    const found = onboardingErrors(answers);
    setErrors(found);
    if (Object.keys(found).length === 0) setStep(2);
  };

  const start = async () => {
    if (!userId) return;
    setSaving(true);
    const name = answers.name.trim();
    const businessName = answers.businessName.trim();
    const websiteUrl = normalizeWebsite(answers.website);
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, full_name: name, company_name: businessName, website: websiteUrl, onboarded_at: new Date().toISOString() });
    if (error) console.error('👋 [Welcome] Profile save failed; continuing to the wizard:', error.message);
    // The greeting reads the auth profile name first, so keep it in step.
    await supabase.auth.updateUser({ data: { full_name: name } }).catch(() => undefined);
    navigate('/wizard/form', { replace: true, state: { onboarding: { businessName, websiteUrl } } });
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <header className="border-b border-white/10 px-4 py-5 sm:px-6">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <img src="/brand/pageconsult-lockup.svg" alt="PageConsult" className="h-7 w-auto" />
          <span className="text-sm text-slate-400">Step {step} of 2</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-10 sm:px-6 sm:py-14">
        {step === 1 ? (
          <form onSubmit={next} noValidate>
            <h1 className="text-3xl font-semibold tracking-tight">Welcome to PageConsult</h1>
            <p className="mt-3 text-slate-300">Before we start, tell us who we're building for.</p>

            <div className="mt-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ob-name">Your name</Label>
                <Input id="ob-name" autoFocus autoComplete="name" value={answers.name} onChange={set('name')}
                  aria-invalid={!!errors.name} className="bg-white/5 border-white/15 text-white" />
                {errors.name && <p className="text-sm text-red-300">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ob-business">Business name</Label>
                <Input id="ob-business" autoComplete="organization" value={answers.businessName} onChange={set('businessName')}
                  aria-invalid={!!errors.businessName} className="bg-white/5 border-white/15 text-white" />
                {errors.businessName && <p className="text-sm text-red-300">{errors.businessName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ob-website">Website <span className="text-slate-400 font-normal">(optional)</span></Label>
                <Input id="ob-website" inputMode="url" autoComplete="url" placeholder="yourbusiness.com" value={answers.website} onChange={set('website')}
                  aria-invalid={!!errors.website} className="bg-white/5 border-white/15 text-white placeholder:text-slate-500" />
                {errors.website
                  ? <p className="text-sm text-red-300">{errors.website}</p>
                  : <p className="text-sm text-slate-400">If you have one, we'll read it first so you type less.</p>}
              </div>
            </div>

            <Button type="submit" size="lg" className="mt-10 w-full sm:w-auto">
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        ) : (
          <section>
            <h1 className="text-3xl font-semibold tracking-tight">
              {firstNameOf(answers.name) ? `Here's how it works, ${firstNameOf(answers.name)}` : "Here's how it works"}
            </h1>
            <ol className="mt-8 space-y-6">
              {HOW_IT_WORKS.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-400/40 text-sm font-semibold text-cyan-300">{i + 1}</span>
                  <div>
                    <h2 className="font-semibold">{s.title}</h2>
                    <p className="mt-1 text-slate-300">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              <Button type="button" variant="ghost" onClick={() => setStep(1)} className="text-slate-300">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="button" size="lg" onClick={start} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {normalizeWebsite(answers.website) ? 'Start with my website' : 'Start'}
                {!saving && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
