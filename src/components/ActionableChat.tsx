"use client";
import React, { useState } from 'react';

type Message = { id: string, author: string, text: string, time: string, isMe: boolean };

export default function ActionableChat() {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', author: 'Ana (Design)', text: 'Pessoal, precisamos ajustar o contraste dos botões primários.', time: '10:00', isMe: false },
    { id: '2', author: 'Rômulo Melo', text: 'Boa! Vou colocar isso no Kanban agora.', time: '10:05', isMe: true }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if(!msg.trim()) return;
    setMessages([...messages, { id: Date.now().toString(), author: 'Rômulo Melo', text: msg, time: 'Agora', isMe: true }]);
    setMsg("");
  };

  return (
    <div className="w-96 border-l border-white/10 bg-black/40 backdrop-blur-xl flex flex-col h-full hidden xl:flex">
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <div>
          <h2 className="font-bold text-white">Chat do Projeto</h2>
          <p className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> 3 online</p>
        </div>
        <button className="text-gray-400 hover:text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'} group`}>
            <span className="text-[10px] text-gray-500 mb-1 ml-1">{m.author} • {m.time}</span>
            <div className={`relative max-w-[85%] rounded-2xl p-3 text-sm shadow-lg ${m.isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white/10 border border-white/5 text-gray-200 rounded-tl-sm'}`}>
              {m.text}
              
              {/* O Diferencial: Actionable Button no Hover */}
              {!m.isMe && (
                <button className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-purple-600 hover:bg-purple-500 text-white text-[10px] px-2 py-1 rounded-full shadow-lg border border-purple-400/50 flex items-center gap-1 transform hover:scale-105">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                  Virou Task
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/10 bg-black/20">
        <form onSubmit={handleSend} className="relative">
          <input 
            type="text" 
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Digite uma mensagem..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
          />
          <button type="submit" className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
        <p className="text-[10px] text-gray-500 text-center mt-2">Dica: Passe o mouse nas mensagens para criar tarefas.</p>
      </div>
    </div>
  );
}
