import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

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

const SESSION_TOKEN_KEY = 'pageconsult_session_token';

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
    // Check for existing session token
    let token = localStorage.getItem(SESSION_TOKEN_KEY);
    
    if (!token) {
      // Generate new session token
      token = uuidv4();
      localStorage.setItem(SESSION_TOKEN_KEY, token);
      
      // Create new session in database
      const { data, error } = await supabase
        .from('consultation_sessions')
        .insert({
          session_token: token,
          current_step: 'consultation',
          status: 'in_progress'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating session:', error);
        return;
      }
      
      setSessionToken(token);
      setSessionId(data.id);
    } else {
      // Load existing session
      setSessionToken(token);
      const sessionData = await loadSessionFromDb(token);
      
      if (sessionData) {
        setSessionId(sessionData.id);
        setUserEmailState(sessionData.user_email);
        setCurrentStep(sessionData.current_step);
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
    
    setIsSaving(true);
    
    const { error } = await supabase
      .from('consultation_sessions')
      .update({
        ...updates,
        last_active: new Date().toISOString()
      })
      .eq('session_token', sessionToken);
    
    if (error) {
      console.error('Error saving session:', error);
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

  const clearSession = () => {
    localStorage.removeItem(SESSION_TOKEN_KEY);
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
