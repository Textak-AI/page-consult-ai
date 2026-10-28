import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ACTION_COSTS } from '@/hooks/useCredits';
import { cn } from '@/lib/utils';

/** Plain cost line for starting a new page build: first page per account is free, then the normal cost. */
export function PageBuildCost({ className }: { className?: string }) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('user_usage')
        .select('free_page_build_used_at')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      setLabel(data && data.free_page_build_used_at
        ? `Uses ${ACTION_COSTS.page_build} AI actions`
        : 'First page free');
    })();
    return () => { cancelled = true; };
  }, []);

  if (!label) return null;
  return <p className={cn('text-xs text-muted-foreground', className)}>{label}</p>;
}
