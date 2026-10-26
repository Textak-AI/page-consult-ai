import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getPostLoginRedirect } from '@/lib/authRedirect';
import { hasRecoveryLink, validateRecoveryPassword } from '@/lib/passwordRecovery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Capture before the auth client removes recovery credentials from the URL.
const arrivedWithRecoveryLink = hasRecoveryLink(window.location.href);

export default function ResetPassword() {
  const navigate = useNavigate();
  const recoveryRef = useRef(arrivedWithRecoveryLink || hasRecoveryLink(window.location.href));
  const [state, setState] = useState<'checking' | 'ready' | 'invalid'>('checking');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function validateSession() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (active) setState(recoveryRef.current && data.user && !error ? 'ready' : 'invalid');
      } catch {
        if (active) setState('invalid');
      }
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        recoveryRef.current = true;
        // Do not await auth calls inside the auth listener's lock.
        setTimeout(() => { if (active) void validateSession(); }, 0);
      } else if (event === 'SIGNED_OUT' && active) {
        setState('invalid');
      }
    });
    void validateSession();
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (saving || state !== 'ready') return;
    const validationError = validateRecoveryPassword(password, confirmation);
    setError(validationError);
    if (validationError) return;
    setSaving(true);
    try {
      const { data: verified, error: sessionError } = await supabase.auth.getUser();
      if (sessionError || !verified.user) { setState('invalid'); return; }
      // Recovery sessions are already signed in; no current_password is required.
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        if (updateError.status === 401 || updateError.status === 403) setState('invalid');
        else setError(updateError.message);
        return;
      }
      navigate(getPostLoginRedirect(), { replace: true });
    } catch {
      setError('Could not update your password. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
    <div className="w-full max-w-md">
      <div className="flex justify-center mb-8">
        <img src="/logo/whiteAsset_3combimark_darkmode.svg" alt="PageConsult AI" className="h-12 w-auto" />
      </div>
      <div className="bg-card/80 backdrop-blur-xl border border-border rounded-lg p-8 shadow-lg">
        {state === 'checking' ? <div role="status" className="flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" />Checking reset link…</div> :
          state === 'invalid' ? <div className="space-y-5">
            <h1 className="text-2xl font-bold">Reset link expired or invalid</h1>
            <p className="text-muted-foreground">This password reset link is invalid or has expired. Request a new link to continue.</p>
            <Button className="w-full" onClick={() => navigate('/signup?mode=login&reset=true')}>Request a new reset link</Button>
          </div> : <form onSubmit={handleSubmit} className="space-y-5">
            <KeyRound className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Set a new password</h1>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input id="new-password" type="password" autoComplete="new-password" minLength={6} required disabled={saving} value={password} onChange={event => setPassword(event.target.value)} />
              <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input id="confirm-password" type="password" autoComplete="new-password" minLength={6} required disabled={saving} value={confirmation} onChange={event => setConfirmation(event.target.value)} />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full gap-2" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save new password</Button>
          </form>}
        <Button variant="ghost" className="w-full mt-5 gap-2 text-muted-foreground" disabled={saving} onClick={() => navigate('/signup?mode=login')}><ArrowLeft className="h-4 w-4" />Back to sign in</Button>
      </div>
    </div>
  </div>;
}