import { useState, useCallback } from 'react';

interface FormSubmissionData {
  publishedPageId: string;
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  message?: string;
  customFields?: Record<string, any>;
}

interface UseFormSubmissionReturn {
  submit: (data: FormSubmissionData) => Promise<boolean>;
  isSubmitting: boolean;
  isSubmitted: boolean;
  error: string | null;
  reset: () => void;
}

export function useFormSubmission(): UseFormSubmissionReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (data: FormSubmissionData): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Extract UTM params from URL
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get('utm_source') || undefined;
      const utmMedium = params.get('utm_medium') || undefined;
      const utmCampaign = params.get('utm_campaign') || undefined;

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/submit-form`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          sourceUrl: window.location.href,
          utmSource,
          utmMedium,
          utmCampaign,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Submission failed');
      }

      setIsSubmitted(true);
      return true;
    } catch (err: any) {
      console.error('Form submission error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setIsSubmitted(false);
    setError(null);
  }, []);

  return { submit, isSubmitting, isSubmitted, error, reset };
}
