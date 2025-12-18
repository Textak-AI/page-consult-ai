import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Send, Loader2, Bot, User } from "lucide-react";
import iconmark from "@/assets/iconmark-darkmode.svg";
import { getAuthHeaders } from "@/lib/authHelpers";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

const INITIAL_MESSAGE = "Hey — I'm your AI Associate at PageConsult. Before I dig into your market and prepare for our consultation, tell me a bit about what brings you here today.";

export default function Wizard() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: INITIAL_MESSAGE }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/signup");
        return;
      }
      setUserId(session.user.id);
    };
    checkAuth();
  }, [navigate]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const headers = await getAuthHeaders();
      
      // Build conversation history for the AI
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/intake-chat`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ messages: conversationHistory })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Check if AI indicates research phase is starting
      if (data.message.toLowerCase().includes("dig into your market") || 
          data.message.toLowerCase().includes("analyze your industry") ||
          data.message.toLowerCase().includes("research brief")) {
        // Give user a moment to read, then navigate to generation
        setTimeout(() => {
          // Extract collected info from conversation for the generate page
          const collectedInfo = extractInfoFromConversation([...messages, userMessage, assistantMessage]);
          navigate("/generate", { 
            state: { 
              consultationData: collectedInfo,
              fromWizard: true 
            } 
          });
        }, 3000);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Extract structured info from conversation
  const extractInfoFromConversation = (msgs: Message[]): Record<string, string> => {
    // This will be enhanced - for now pass the full conversation
    const userMessages = msgs.filter(m => m.role === "user").map(m => m.content);
    return {
      conversationHistory: JSON.stringify(msgs),
      rawUserInput: userMessages.join(" | ")
    };
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1f] via-[#1a1332] to-[#0f0a1f] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <img src={iconmark} alt="PageConsult" className="h-8 w-8" />
          <span className="text-lg font-semibold text-white">PageConsult AI</span>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                message.role === "assistant" 
                  ? "bg-gradient-to-br from-cyan-500 to-purple-600" 
                  : "bg-gradient-to-br from-purple-500 to-pink-600"
              }`}>
                {message.role === "assistant" ? (
                  <Bot className="w-5 h-5 text-white" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[75%] ${message.role === "user" ? "text-right" : ""}`}>
                <div className={`inline-block rounded-2xl px-5 py-3 ${
                  message.role === "assistant"
                    ? "bg-white/10 backdrop-blur-sm text-white/90 rounded-tl-sm"
                    : "bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-tr-sm"
                }`}>
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-sm px-5 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex gap-3 items-center">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl py-6 px-4 text-[15px] focus-visible:ring-cyan-500/50"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="h-12 w-12 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-center text-white/40 text-xs mt-3">
            Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}
