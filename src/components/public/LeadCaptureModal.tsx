import { useState, memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useFormSubmission } from '@/hooks/useFormSubmission';

interface LeadCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publishedPageId: string;
  ctaText?: string;
  companyName?: string;
}

function LeadCaptureModalBase({
  open,
  onOpenChange,
  publishedPageId,
  ctaText = 'Get Started',
  companyName,
}: LeadCaptureModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const { submit, isSubmitting, isSubmitted, error } = useFormSubmission();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    await submit({
      publishedPageId,
      email,
      name: name || undefined,
      phone: phone || undefined,
      company: company || undefined,
      message: message || undefined,
    });
  };

  if (isSubmitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm bg-card border-border">
          <div className="text-center space-y-4 py-6">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
            <h3 className="text-xl font-semibold text-foreground">Thank you!</h3>
            <p className="text-muted-foreground">We'll be in touch shortly.</p>
            <Button onClick={() => onOpenChange(false)} variant="outline">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {ctaText}
          </DialogTitle>
          {companyName && (
            <p className="text-sm text-muted-foreground">
              Contact {companyName}
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lead-name">Name</Label>
            <Input
              id="lead-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-email">Email *</Label>
            <Input
              id="lead-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-phone">Phone</Label>
            <Input
              id="lead-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-company">Company</Label>
            <Input
              id="lead-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Your company"
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-message">Message</Label>
            <Textarea
              id="lead-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your needs..."
              maxLength={5000}
              rows={3}
              className="resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !email}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
            ) : (
              'Submit'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const LeadCaptureModal = memo(LeadCaptureModalBase);
export default LeadCaptureModal;
