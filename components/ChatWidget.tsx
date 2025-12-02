import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { UserProfile, ChatMessage } from '../types';
import { sendMessageToChatBot } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';

interface ChatWidgetProps {
  userProfile: UserProfile;
  t: any;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ userProfile, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message when opened first time
  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      setMessages([{
        id: 'init',
        role: 'model',
        text: t.chatWelcome,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, t.chatWelcome]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const responseText = await sendMessageToChatBot(userMsg.text, userProfile);
      
      const botMsg: ChatMessage = {
        id: uuidv4(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      <div 
        className={`bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden mb-4 transition-all duration-300 origin-bottom-right pointer-events-auto ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 translate-y-4 pointer-events-none hidden'
        }`}
      >
        {/* Header */}
        <div className="bg-primary p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-full">
              <Bot size={18} />
            </div>
            <span className="font-bold">{t.chatTitle}</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 bg-gray-50 space-y-4 scrollbar-hide">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 border border-green-200 text-green-700">
                  <Bot size={14} />
                </div>
              )}
              <div 
                className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.text}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0 border border-gray-300 text-gray-600">
                  <User size={14} />
                </div>
              )}
            </div>
          ))}
          {loading && (
             <div className="flex justify-start gap-2">
               <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 border border-green-200">
                  <Bot size={14} />
               </div>
               <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center">
                  <Loader2 size={16} className="animate-spin text-gray-400" />
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.chatPlaceholder}
            className="flex-1 bg-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim() || loading}
            className={`p-2 rounded-xl text-white transition-colors ${
                !inputText.trim() || loading ? 'bg-gray-300' : 'bg-primary hover:bg-green-600'
            }`}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-primary to-green-600 rounded-full shadow-lg shadow-green-500/40 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all pointer-events-auto"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};

export default ChatWidget;