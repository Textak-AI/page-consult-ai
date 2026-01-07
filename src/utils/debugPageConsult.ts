/**
 * 🔍 PageConsult Debug Helper
 * 
 * Global debug utilities for tracing the demo → wizard → brief data flow.
 * Access in browser console: window.debugPageConsult
 */

import { supabase } from '@/integrations/supabase/client';

export const debugPageConsult = {
  /**
   * Check demo session data from Supabase
   */
  checkDemoSession: async (sessionId: string) => {
    console.log('🔍 [Debug] Fetching demo session:', sessionId);
    const { data, error } = await supabase
      .from('demo_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();
    
    if (error) {
      console.error('🔍 [Debug] Error fetching demo session:', error);
      return null;
    }
    
    console.log('🔍 [Debug] Demo session data:', data);
    console.log('🔍 [Debug] Extracted intelligence:', data?.extracted_intelligence);
    console.log('🔍 [Debug] Market research:', data?.market_research);
    console.log('🔍 [Debug] Messages count:', Array.isArray(data?.messages) ? data.messages.length : 0);
    console.log('🔍 [Debug] Readiness:', data?.readiness);
    return data;
  },

  /**
   * Log all relevant localStorage keys
   */
  logLocalStorage: () => {
    const keys = [
      'pageconsult_demo_prefill', 
      'pageconsult_session', 
      'pageconsult_session_id',
      'demoIntelligence',
      'demoEmail'
    ];
    console.log('🔍 [Debug] === localStorage contents ===');
    keys.forEach(key => {
      const val = localStorage.getItem(key);
      console.log(`🔍 localStorage[${key}]:`, val ? JSON.parse(val) : null);
    });
  },

  /**
   * Log all relevant sessionStorage keys
   */
  logSessionStorage: () => {
    const keys = [
      'demoIntelligence',
      'demoEmail'
    ];
    console.log('🔍 [Debug] === sessionStorage contents ===');
    keys.forEach(key => {
      const val = sessionStorage.getItem(key);
      try {
        console.log(`🔍 sessionStorage[${key}]:`, val ? JSON.parse(val) : null);
      } catch {
        console.log(`🔍 sessionStorage[${key}]:`, val);
      }
    });
  },

  /**
   * Check consultation data from Supabase by ID
   */
  checkConsultation: async (consultationId: string) => {
    console.log('🔍 [Debug] Fetching consultation:', consultationId);
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', consultationId)
      .single();
    
    if (error) {
      console.error('🔍 [Debug] Error fetching consultation:', error);
      return null;
    }
    
    console.log('🔍 [Debug] Consultation data:', data);
    console.log('🔍 [Debug] Extracted intelligence:', data?.extracted_intelligence);
    console.log('🔍 [Debug] AI SEO data:', data?.ai_seo_data);
    console.log('🔍 [Debug] Industry:', data?.industry);
    console.log('🔍 [Debug] Readiness score:', data?.readiness_score);
    return data;
  },

  /**
   * Check landing page data from Supabase by ID
   */
  checkLandingPage: async (pageId: string) => {
    console.log('🔍 [Debug] Fetching landing page:', pageId);
    const { data, error } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('id', pageId)
      .single();
    
    if (error) {
      console.error('🔍 [Debug] Error fetching landing page:', error);
      return null;
    }
    
    console.log('🔍 [Debug] Landing page data:', data);
    console.log('🔍 [Debug] Sections count:', (data?.sections as any[])?.length);
    console.log('🔍 [Debug] Section types:', (data?.sections as any[])?.map((s: any) => s.type));
    console.log('🔍 [Debug] Consultation data:', data?.consultation_data);
    console.log('🔍 [Debug] Strategy brief preview:', data?.strategy_brief?.substring(0, 200));
    return data;
  },

  /**
   * List recent demo sessions for the current user
   */
  listRecentDemoSessions: async () => {
    console.log('🔍 [Debug] Fetching recent demo sessions...');
    const { data, error } = await supabase
      .from('demo_sessions')
      .select('session_id, created_at, readiness, completed, continued_to_consultation')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('🔍 [Debug] Error fetching demo sessions:', error);
      return null;
    }
    
    console.log('🔍 [Debug] Recent demo sessions:', data);
    return data;
  },

  /**
   * Full diagnostic dump - run all checks
   */
  fullDiagnostic: async () => {
    console.log('🔍 [Debug] ========== FULL DIAGNOSTIC ==========');
    
    // Check storage
    debugPageConsult.logLocalStorage();
    debugPageConsult.logSessionStorage();
    
    // Check if there's a session ID
    const sessionId = localStorage.getItem('pageconsult_session_id');
    if (sessionId) {
      console.log('🔍 [Debug] Found session ID:', sessionId);
      await debugPageConsult.checkDemoSession(sessionId);
    } else {
      console.log('🔍 [Debug] No session ID in localStorage');
    }
    
    // List recent sessions
    await debugPageConsult.listRecentDemoSessions();
    
    console.log('🔍 [Debug] ========== END DIAGNOSTIC ==========');
  }
};

// Attach to window for console access
if (typeof window !== 'undefined') {
  (window as any).debugPageConsult = debugPageConsult;
  console.log('🔍 [Debug] PageConsult debug helpers loaded. Access via window.debugPageConsult');
}

export default debugPageConsult;
