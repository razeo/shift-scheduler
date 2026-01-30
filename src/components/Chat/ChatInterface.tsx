import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Check, Trash2, Bot, User, Loader2 } from 'lucide-react';
import { ChatMessage } from '../../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onCancelAi: () => void;
  onApplyChanges: (messageId: string) => void;
  onDiscardChanges: (messageId: string) => void;
  isLoading: boolean;
  onClose: () => void;
}

export function ChatInterface({
  messages,
  onSendMessage,
  onCancelAi,
  onApplyChanges,
  onDiscardChanges,
  isLoading,
  onClose,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('sr-RS', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-primary-600" />
          <h3 className="font-semibold text-slate-800">AI Asistent</h3>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 py-8">
            <Bot size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Započni razgovor sa AI asistentom</p>
            <p className="text-xs mt-1">Pitaj me da kreiram raspored!</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${message.role === 'user' ? 'chat-message-user' : 'chat-message-model'}`}
          >
            <div className="flex items-start gap-2">
              {message.role === 'user' ? (
                <User size={16} className="mt-1 opacity-70" />
              ) : (
                <Bot size={16} className="mt-1 opacity-70" />
              )}
              <div className="flex-1">
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                
                {/* Actions for model responses with pending changes */}
                {message.role === 'model' && message.status === 'pending' && (
                  <div className="flex gap-2 mt-3 pt-2 border-t border-slate-200/50">
                    <button
                      onClick={() => onApplyChanges(message.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 transition-colors"
                    >
                      <Check size={14} /> Primijeni
                    </button>
                    <button
                      onClick={() => onDiscardChanges(message.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={14} /> Odbaci
                    </button>
                  </div>
                )}

                {/* Status indicator */}
                {message.status === 'applied' && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                    <Check size={12} /> Primijenjeno
                  </div>
                )}
                {message.status === 'discarded' && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-red-500">
                    <Trash2 size={12} /> Odbaceno
                  </div>
                )}
                
                <p className="text-[10px] opacity-50 mt-1">{formatTime(message.timestamp)}</p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="chat-message chat-message-model">
            <div className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Razmišljam...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="chat-input-container">
        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Opisite raspored koji zelite..."
            className="chat-input"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="chat-send-btn"
          >
            <Send size={18} />
          </button>
        </div>
        
        {isLoading && (
          <button
            type="button"
            onClick={onCancelAi}
            className="mt-2 text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <X size={12} /> Prekini
          </button>
        )}
      </form>
    </div>
  );
}

export default ChatInterface;
