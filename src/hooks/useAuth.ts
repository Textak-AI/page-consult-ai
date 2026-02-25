import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        // onAuthStateChange fires INITIAL_SESSION on setup — use it as the single
        // source of truth so we don't double-trigger with getSession().
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
        initializedRef.current = true;
      }
    );

    // Fallback: if onAuthStateChange hasn't fired within 1s, use getSession
    // This guards against edge cases where the listener might not fire.
    const timeout = setTimeout(() => {
      if (!initializedRef.current) {
        supabase.auth.getSession().then(({ data: { session: s } }) => {
          if (!initializedRef.current) {
            setSession(s);
            setUser(s?.user ?? null);
            setIsLoading(false);
            initializedRef.current = true;
          }
        });
      }
    }, 1000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return { user, session, isLoading };
}
