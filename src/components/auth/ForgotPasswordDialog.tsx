import { useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { requestPasswordRecovery } from '@/lib/passwordRecovery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function ForgotPasswordDialog({ email, disabled = false, initiallyOpen = false }: {
  email: string; disabled?: boolean; initiallyOpen?: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const [resetEmail, setResetEmail] = useState(email);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    event.stopPropagation(); // Portal form must not submit the surrounding signup form.
    if (sending) return;
    setSending(true);
    await requestPasswordRecovery(supabase.auth, resetEmail, window.location.origin);
    setSending(false);
    setSent(true);
  }

  return <>
    <Button type="button" variant="link" disabled={disabled} className="h-auto p-0 text-sm text-primary" onClick={() => {
      setResetEmail(email); setSent(false); setOpen(true);
    }}>Forgot password?</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle>{sent ? 'Check your email' : 'Reset your password'}</DialogTitle>
          <DialogDescription>{sent
            ? 'If an account exists for that email, you’ll receive a password reset link. Check your inbox and spam folder.'
            : 'Enter your account email to request a password reset link.'}</DialogDescription>
        </DialogHeader>
        {sent ? <Button variant="outline" onClick={() => setOpen(false)}>Back to sign in</Button> :
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input id="reset-email" type="email" autoComplete="email" value={resetEmail} onChange={event => setResetEmail(event.target.value)} required disabled={sending} />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}Send reset link
            </Button>
          </form>}
      </DialogContent>
    </Dialog>
  </>;
}