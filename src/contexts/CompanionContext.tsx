import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { 
  ScreenContext, 
  getScreenFromPath, 
  SCREEN_BEHAVIORS,
  shouldShowProactive,
  markProactiveShown 
} from '@/lib/companionScreenContext';

const STORAGE_KEY = 'pageconsult_companion_history';
const MAX_STORED_MESSAGES = 50;

export interface CompanionMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CompanionState {
  messages: CompanionMessage[];
  isExpanded: boolean;
  isProcessing: boolean;
  hasUnread: boolean;
  currentScreen: ScreenContext;
}

interface CompanionContextValue {
  state: CompanionState;
  sendMessage: (content: string) => Promise<void>;
  expand: () => void;
  collapse: () => void;
  toggle: () => void;
  pushAIMessage: (content: string) => void;
  setCurrentScreen: (screen: ScreenContext) => void;
  clearHistory: () => void;
}

const CompanionContext = createContext<CompanionContextValue | undefined>(undefined);

function loadMessages(): CompanionMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Guard against undefined/null strings that would crash JSON.parse
    if (stored && stored !== 'undefined' && stored !== 'null') {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    }
  } catch (e) {
    console.error('Failed to load companion messages:', e);
  }
  return [];
}

function saveMessages(messages: CompanionMessage[]): void {
  try {
    const toStore = messages.slice(-MAX_STORED_MESSAGES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch (e) {
    console.error('Failed to save companion messages:', e);
  }
}

interface CompanionProviderProps {
  children: ReactNode;
}

export function CompanionProvider({ children }: CompanionProviderProps) {
  const location = useLocation();
  const [messages, setMessages] = useState<CompanionMessage[]>(() => loadMessages());
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenContext>('unknown');
  const [lastScreen, setLastScreen] = useState<ScreenContext | null>(null);

  // Update screen based on route
  useEffect(() => {
    const screen = getScreenFromPath(location.pathname);
    setCurrentScreen(screen);
  }, [location.pathname]);

  // Send proactive message on screen change
  useEffect(() => {
    if (currentScreen === lastScreen) return;
    setLastScreen(currentScreen);

    const behavior = SCREEN_BEHAVIORS[currentScreen];
    
    if (behavior.proactivePrompts.length > 0 && shouldShowProactive()) {
      const prompt = behavior.proactivePrompts[
        Math.floor(Math.random() * behavior.proactivePrompts.length)
      ];
      
      setTimeout(() => {
        pushAIMessage(prompt);
        markProactiveShown();
      }, 500);
    }
  }, [currentScreen, lastScreen]);

  // Persist messages
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // Clear unread when expanded
  useEffect(() => {
    if (isExpanded && hasUnread) {
      setHasUnread(false);
    }
  }, [isExpanded, hasUnread]);

  const pushAIMessage = useCallback((content: string) => {
    const message: CompanionMessage = {
      id: uuidv4(),
      role: 'assistant',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
    if (!isExpanded) {
      setHasUnread(true);
    }
  }, [isExpanded]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: CompanionMessage = {
      id: uuidv4(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // For now, provide a mock response
      // TODO: Connect to actual AI endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const responses = [
        "I hear you. Tell me more about that.",
        "That's a great point. What else should we consider?",
        "Interesting — how does that connect to your main offer?",
        "Got it. What's the one thing that makes you different from competitors?",
        "Let's dig into that. What result do your clients typically see?"
      ];
      
      const aiResponse = responses[Math.floor(Math.random() * responses.length)];
      pushAIMessage(aiResponse);
    } catch (error) {
      console.error('Error sending message:', error);
      pushAIMessage("Sorry, I had trouble processing that. Can you try again?");
    } finally {
      setIsProcessing(false);
    }
  }, [pushAIMessage]);

  const expand = useCallback(() => {
    setIsExpanded(true);
    setHasUnread(false);
  }, []);

  const collapse = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const toggle = useCallback(() => {
    if (isExpanded) {
      collapse();
    } else {
      expand();
    }
  }, [isExpanded, expand, collapse]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const state: CompanionState = {
    messages,
    isExpanded,
    isProcessing,
    hasUnread,
    currentScreen
  };

  const value: CompanionContextValue = {
    state,
    sendMessage,
    expand,
    collapse,
    toggle,
    pushAIMessage,
    setCurrentScreen,
    clearHistory
  };

  return (
    <CompanionContext.Provider value={value}>
      {children}
    </CompanionContext.Provider>
  );
}

export function useCompanion(): CompanionContextValue {
  const context = useContext(CompanionContext);
  if (!context) {
    throw new Error('useCompanion must be used within a CompanionProvider');
  }
  return context;
}
