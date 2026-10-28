import { useEffect, useState } from 'react';
import { auditLogo, judgeLogoUrl } from '@/lib/logoAudit';

/**
 * Render-time logo guard: returns the URL while it is plausible and null once the
 * audit rejects it (broken link, favicon-sized, blank, social image), so logo slots
 * collapse instead of showing a broken image or a placeholder box.
 */
export function useUsableLogo(url: string | null | undefined): string | null {
  const quickOk = judgeLogoUrl(url).ok;
  const [bad, setBad] = useState<string | null>(null);
  useEffect(() => {
    if (!url || !quickOk) return;
    let live = true;
    auditLogo(url).then((v) => {
      if (live && !v.ok) setBad(url);
    });
    return () => {
      live = false;
    };
  }, [url, quickOk]);
  if (!url || !quickOk || bad === url) return null;
  return url;
}
