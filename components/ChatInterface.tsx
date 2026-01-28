import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, Loader2, Square, Check, X, PanelRightClose } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onCancelAi: () => void;
  onApplyChanges: (messageId: string) => void;
  onDiscardChanges: (messageId: string) => void;
  isLoading: boolean;
  onClose?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  onCancelAi,
  onApplyChanges,
  onDiscardChanges,
  isLoading,
  onClose
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 backdrop-blur-sm flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-600" />
            AI Asistent
          </h2>
          <p className="text-xs text-slate-500">Pitajte me da generišem raspored ili dodam radnike.</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-slate-200/50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors" title="Sakrij chat">
            <PanelRightClose size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center mt-10 p-6 bg-indigo-50 rounded-xl border border-indigo-100">
            <Sparkles className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
            <h3 className="font-medium text-indigo-900 mb-1">Kako mogu pomoći?</h3>
            <p className="text-xs text-indigo-700 leading-relaxed">
              Pokušajte reći:<br/>
              <span className="font-bold">"Generiši raspored za ovu nedjelju"</span><br/>
              "Dodaj Marka u popodnevnu u ponedjeljak"<br/>
              "Neka Jelena bude na kasi u srijedu"<br/>
              "Obriši sve smjene za vikend"
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] p-3 rounded-2xl text-sm leading-relaxed relative shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : `bg-white text-slate-800 rounded-bl-sm border ${
                      msg.status === 'pending' ? 'border-indigo-300 ring-2 ring-indigo-50' : 'border-slate-200'
                    }`
              }`}
            >
              {msg.text}

              {msg.role === 'model' && msg.status === 'pending' && (
                <div className="mt-4 pt-3 border-t border-indigo-100 flex gap-2">
                  <button 
                    onClick={() => onApplyChanges(msg.id)}
                    className="flex-1 bg-indigo-600 text-white text-[10px] font-black uppercase py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 active:scale-[0.98]"
                  >
                    <Check size={14} /> Primijeni
                  </button>
                  <button 
                    onClick={() => onDiscardChanges(msg.id)}
                    className="flex-1 bg-white text-slate-500 text-[10px] font-black uppercase py-2.5 rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 hover:bg-slate-50 transition active:scale-[0.98]"
                  >
                    <X size={14} /> Odbaci
                  </button>
                </div>
              )}

              {msg.role === 'model' && msg.status === 'applied' && (
                <div className="mt-2 text-[10px] font-black text-emerald-600 flex items-center gap-1 uppercase tracking-widest">
                  <Check size={12} /> Primijenjeno u raspored
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-slate-100 p-3 rounded-xl rounded-bl-none border border-slate-200 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                    <span className="text-xs text-slate-500 font-medium">Razmišljam...</span>
                    <button 
                      onClick={onCancelAi}
                      className="ml-2 p-1 bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition border border-red-100"
                      title="Prekini rad"
                    >
                      <Square size={12} fill="currentColor" />
                    </button>
                </div>
            </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Napišite zahtjev..."
            className="w-full pl-4 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm hover:shadow-md"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;