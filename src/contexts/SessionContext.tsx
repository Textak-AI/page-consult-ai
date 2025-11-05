import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { emailSchema, sessionTokenSchema } from '@/lib/validationSchemas';
import { z } from 'zod';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

type SessionContextType = {
  sessionToken: string | null;
  sessionId: string | null;
  userEmail: string | null;
  currentStep: string;
  saveSession: (data: Partial<SessionData>) => Promise<void>;
  setUserEmail: (email: string) => Promise<void>;
  loadSession: () => Promise<SessionData | null>;
  clearSession: () => void;
};

type SessionData = {
  consultation_answers: any;
  approved_sections: any;
  current_step: string;
  status: string;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userEmail, setUserEmailState] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('consultation');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      // Try to get existing session from httpOnly cookie via edge function
      const response = await fetch(`${SUPABASE_URL}/functions/v1/get-session`, {
        method: 'GET',
        credentials: 'include', // Important: includes cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessionToken(data.session_token);
        setSessionId(data.session_id);
        setUserEmailState(data.user_email);
        setCurrentStep(data.current_step);
        return;
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log('No existing session found, creating new one');
      }
    }

    // No existing session, create a new one
    const token = uuidv4();

    // Get current user if authenticated
    const { data: { session: authSession } } = await supabase.auth.getSession();

    // Create new session in database
    const { data, error } = await supabase
      .from('consultation_sessions')
      .insert({
        session_token: token,
        current_step: 'consultation',
        status: 'in_progress',
        user_id: authSession?.user?.id || null
      })
      .select()
      .single();

    if (error) {
      if (import.meta.env.DEV) {
        console.error('Error creating session:', error);
      }
      toast({
        title: "⚠️ Session error",
        description: "Could not create session. Please refresh the page.",
        variant: "destructive",
        duration: 5000
      });
      return;
    }

    // Set session token and ID immediately (works without cookie)
    setSessionToken(token);
    setSessionId(data.id);

    // Try to set the session cookie via edge function (optional enhancement)
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/set-session-cookie`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_token: token }),
      });

      if (!response.ok) {
        // Log but don't fail - session works without cookie
        if (import.meta.env.DEV) {
          console.warn('Cookie setting failed, but session created successfully');
        }
      }
    } catch (error) {
      // Cookie is optional - session already works via state
      if (import.meta.env.DEV) {
        console.warn('Could not set session cookie (non-critical):', error);
      }
    }
  };

  const loadSessionFromDb = async (token: string) => {
    const { data, error } = await supabase
      .from('consultation_sessions')
      .select('*')
      .eq('session_token', token)
      .eq('status', 'in_progress')
      .maybeSingle();
    
    if (error) {
      console.error('Error loading session:', error);
      return null;
    }
    
    return data;
  };

  const saveSession = async (updates: Partial<SessionData>) => {
    if (!sessionToken || isSaving) return;
    
    // Priority 1 Security Fix: Validate session token format
    try {
      sessionTokenSchema.parse(sessionToken);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Invalid session token:', error);
      }
      toast({
        title: "⚠️ Invalid session",
        description: "Please refresh the page to start a new session.",
        variant: "destructive",
        duration: 3000
      });
      return;
    }
    
    setIsSaving(true);
    
    const { error } = await supabase
      .from('consultation_sessions')
      .update({
        ...updates,
        last_active: new Date().toISOString()
      })
      .eq('session_token', sessionToken);
    
    if (error) {
      if (import.meta.env.DEV) {
        console.error('Error saving session:', error);
      }
      toast({
        title: "⚠️ Connection issue",
        description: "Changes not saved. Please check your connection.",
        variant: "destructive",
        duration: 3000
      });
    } else {
      // Show subtle success toast
      toast({
        title: "✓ Saved",
        duration: 2000,
        className: "bg-green-50 border-green-200 text-green-900"
      });
    }
    
    setIsSaving(false);
  };

  const setUserEmail = async (email: string) => {
    if (!sessionToken) return;
    
    // Priority 1 Security Fix: Validate email format
    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid email",
          description: error.errors[0].message,
          variant: "destructive",
          duration: 3000
        });
      }
      return;
    }
    
    const { error } = await supabase
      .from('consultation_sessions')
      .update({ user_email: email })
      .eq('session_token', sessionToken);
    
    if (!error) {
      setUserEmailState(email);
    }
  };

  const loadSession = async (): Promise<SessionData | null> => {
    if (!sessionToken) return null;
    
    const data = await loadSessionFromDb(sessionToken);
    return data ? {
      consultation_answers: data.consultation_answers,
      approved_sections: data.approved_sections,
      current_step: data.current_step,
      status: data.status
    } : null;
  };

  const clearSession = async () => {
    // Clear the httpOnly cookie via edge function
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/clear-session-cookie`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error clearing session cookie:', error);
      }
    }

    setSessionToken(null);
    setSessionId(null);
    setUserEmailState(null);
    setCurrentStep('consultation');
  };

  return (
    <SessionContext.Provider value={{
      sessionToken,
      sessionId,
      userEmail,
      currentStep,
      saveSession,
      setUserEmail,
      loadSession,
      clearSession
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
