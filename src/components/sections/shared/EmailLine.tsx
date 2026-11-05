import { useState } from 'react';
import { toast } from 'sonner';
import { useFormSubmission } from '@/hooks/useFormSubmission';
import { usePublishedPage } from '@/contexts/PublishedPageContext';

interface Props {
  /** The line above the field, in the owner's register ("Get a note when something new is out."). */
  prompt: string;
  buttonText?: string;
  primaryColor: string;
  textColor: string;
  pill?: boolean;
  /** Stored with the lead so the owner can tell a "keep me posted" from a contact request. */
  intent?: string;
}

/**
 * One email field and one button. For a page whose main ask leaves the page (a pre-save, a
 * shop, a booking link), this is how the page still collects an address. Submits to the same
 * leads path as the contact form; in the editor it only explains what it will do.
 */
export function EmailLine({ prompt, buttonText = 'Keep me posted', primaryColor, textColor, pill = true, intent = 'updates' }: Props) {
  const { publishedPageId, previewMode } = usePublishedPage();
  const [email, setEmail] = useState('');
  const { submit, isSubmitting, isSubmitted, error } = useFormSubmission();
  const radius = pill ? '999px' : 'var(--archetype-card-radius, 8px)';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!publishedPageId) {
      toast(previewMode ? 'On your live page, this adds the address to your leads.' : 'On your live page, this adds the address to your leads.');
      return;
    }
    if (!email.trim()) return;
    await submit({ publishedPageId, email: email.trim(), customFields: { intent } });
  };

  if (isSubmitted) {
    return (
      <p data-email-line="done" className="text-sm" style={{ color: textColor }}>
        Got it. You're on the list.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} data-email-line className="w-full max-w-md space-y-2" noValidate={false}>
      <label htmlFor="pc-email-line" className="block text-sm" style={{ color: textColor, opacity: 0.85 }}>{prompt}</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="pc-email-line"
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={255}
          className="flex-1 px-4 py-3 text-sm outline-none"
          style={{ borderRadius: radius, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: textColor }}
        />
        <button
          type="submit"
          data-email-line-submit
          disabled={isSubmitting}
          className="px-5 py-3 text-sm font-medium transition-opacity disabled:opacity-60"
          style={{ borderRadius: radius, backgroundColor: 'transparent', color: textColor, border: `1px solid ${primaryColor}` }}
        >
          {isSubmitting ? 'Sending…' : buttonText}
        </button>
      </div>
      {error && <p className="text-xs" style={{ color: textColor, opacity: 0.8 }}>{error}</p>}
    </form>
  );
}
