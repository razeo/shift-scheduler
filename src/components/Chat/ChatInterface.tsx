import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../../types';

export interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onCancelAi: () => void;
  onApplyChanges: (messageId: string) => void;
  onDiscardChanges: (messageId: string) => void;
  isLoading: boolean;
  onClose: () => void;
  error?: string | null;
  onClearError?: () => void;
}

export function ChatInterface({
  messages,
  onSendMessage,
  onCancelAi,
  onApplyChanges,
  onDiscardChanges,
  isLoading,
  onClose,
  error = null,
  onClearError = () => {},
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
    <div className="flex flex-col h-full bg-slate-50" role="region" aria-label="AI Chat">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Bot size={20} className="text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">RestoHub AI</h2>
            <p className="text-xs text-slate-500">
              {isLoading ? 'Razmišljam...' : 'Spreman'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Zatvori chat"
        >
          <X size={20} />
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div 
          className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
          role="alert"
        >
          <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button 
            onClick={onClearError}
            className="ml-auto text-red-500 hover:text-red-700"
            aria-label="Zatvori grešku"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin"
        role="log" 
        aria-live="polite"
        aria-label="Poruke"
      >
        {messages.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Bot size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm">Pitaj me da kreiram raspored!</p>
            <p className="text-xs mt-1">npr. "Napravi raspored za ovu sedmicu"</p>
            <p className="text-xs mt-4 text-primary-600">
              💡 Besplatno uz Groq API
            </p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-slate-200 text-slate-600'
              }`}
              aria-hidden="true"
            >
              {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            {/* Message Bubble */}
            <div 
              className={`max-w-[80%] rounded-2xl p-3 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : 'bg-white border border-slate-200 rounded-bl-md'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <span 
                className={`text-[10px] mt-1 block ${
                  message.role === 'user' ? 'text-primary-200' : 'text-slate-400'
                }`}
              >
                {formatTime(message.timestamp)}
              </span>
              
              {/* Status for AI messages */}
              {message.role === 'model' && message.status && (
                <div className="mt-2 flex gap-2">
                  {message.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onApplyChanges(message.id)}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        aria-label="Primijeni promjene"
                      >
                        ✓ Primijeni
                      </button>
                      <button
                        onClick={() => onDiscardChanges(message.id)}
                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        aria-label="Odbaci promjene"
                      >
                        ✕ Odbaci
                      </button>
                    </>
                  )}
                  {message.status === 'applied' && (
                    <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg">
                      ✓ Primijenjeno
                    </span>
                  )}
                  {message.status === 'discarded' && (
                    <span className="px-3 py-1 text-xs bg-slate-100 text-slate-500 rounded-lg">
                      Odbaceno
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <Bot size={16} className="text-slate-500" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Razmišljam...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSubmit}
        className="p-4 border-t border-slate-200 bg-white"
      >
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Unesite zahtjev za raspored..."
              className="input resize-none min-h-[44px] max-h-32 pr-12"
              rows={1}
              disabled={isLoading}
              aria-label="Poruka"
            />
          </div>
          <button
            type="button"
            onClick={onCancelAi}
            disabled={!isLoading}
            className="p-2 text-slate-500 hover:text-slate-700 disabled:opacity-30 transition-colors"
            aria-label="Prekini"
          >
            <X size={20} />
          </button>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn btn-primary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Pošalji poruku"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
