import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, INITIAL_MESSAGE, generateCoachResponse } from '@/lib/testimonialCoachResponses';

interface TestimonialCoachProps {
  businessName: string;
  industry: string;
  isOpen: boolean;
  onClose: () => void;
  onApplyEmail?: (subject: string, body: string) => void;
}

export function TestimonialCoach({ 
  businessName, 
  industry, 
  isOpen, 
  onClose,
  onApplyEmail 
}: TestimonialCoachProps) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Generate coach response
    setTimeout(() => {
      const coachResponse = generateCoachResponse(messageText, businessName, industry, messages);
      setMessages(prev => [...prev, coachResponse]);
      setIsTyping(false);

      // Handle actions
      if (coachResponse.action?.type === 'generate-email' && coachResponse.action.data?.apply && onApplyEmail) {
        // Find the most recent email data
        const emailMessages = [...messages, userMessage, coachResponse].filter(m => m.action?.data?.body);
        const lastEmailMessage = emailMessages[emailMessages.length - 1];
        if (lastEmailMessage?.action?.data) {
          onApplyEmail(lastEmailMessage.action.data.subject, lastEmailMessage.action.data.body);
        }
      }
    }, 800 + Math.random() * 400);
  }, [input, businessName, industry, messages, onApplyEmail]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed bottom-4 right-4 z-50"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {isMinimized ? (
          <motion.button
            onClick={() => setIsMinimized(false)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        ) : (
          <motion.div 
            className="w-96 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden"
            layout
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Testimonial Coach</h3>
                  <p className="text-xs text-white/80">Let's get you some social proof</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 hover:bg-white/20 rounded transition-colors"
                >
                  <Minimize2 className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-amber-500 text-white rounded-br-md'
                        : 'bg-slate-700 text-slate-200 rounded-bl-md'
                    }`}
                  >
                    <div 
                      className="text-sm prose prose-sm prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: message.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br />')
                      }}
                    />
                  </div>
                </motion.div>
              ))}
              
              {/* Quick reply suggestions */}
              {messages.length > 0 && messages[messages.length - 1].role === 'coach' && 
               messages[messages.length - 1].suggestions && !isTyping && (
                <motion.div 
                  className="flex flex-wrap gap-2 justify-start"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {messages[messages.length - 1].suggestions!.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(suggestion)}
                      className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 
                                 px-3 py-1.5 rounded-full transition-colors border border-slate-600"
                    >
                      {suggestion}
                    </button>
                  ))}
                </motion.div>
              )}
              
              {isTyping && (
                <motion.div 
                  className="flex justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="bg-slate-700 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-1">
                      <motion.span 
                        className="w-2 h-2 bg-slate-400 rounded-full"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      />
                      <motion.span 
                        className="w-2 h-2 bg-slate-400 rounded-full"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.span 
                        className="w-2 h-2 bg-slate-400 rounded-full"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-700 bg-slate-800">
              <div className="flex items-center gap-2">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tell me about your clients..."
                  className="bg-slate-700 border-slate-600 text-white text-sm resize-none min-h-[40px] max-h-24 placeholder:text-slate-500"
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <Button 
                  onClick={() => handleSend()}
                  className="bg-amber-500 hover:bg-amber-600 shrink-0"
                  size="icon"
                  disabled={!input.trim() || isTyping}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
