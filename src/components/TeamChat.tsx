"use client";
import { useEffect, useRef, useState } from 'react';
import { Hash, Send, ListPlus, CheckCheck } from 'lucide-react';
import { errorText, initials, type Member, type Message, type Task } from '@/lib/taskflow';

export default function TeamChat({ messages, tasks, members, userId, connected, canLoadMore, onLoadMore, onSend, onCreate, onOpen }: { messages: Message[]; tasks: Task[]; members: Member[]; userId: string; connected: boolean; canLoadMore: boolean; onLoadMore: () => void; onSend: (content: string) => Promise<void>; onCreate: (message: Message) => void; onOpen: (task: Task) => void }) {
  const [text, setText] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const end = useRef<HTMLDivElement>(null); const scroll = useRef<HTMLDivElement>(null); const atBottom = useRef(true);
  const lastId = messages.at(-1)?.id;
  useEffect(() => { if (atBottom.current) end.current?.scrollIntoView({ block: 'nearest' }); }, [lastId]);
  return <section className="team-chat" aria-label="Chat do projeto"><header><Hash size={19} /><div><h2>Chat da equipe</h2><small>{connected ? 'Em tempo real' : 'Conectando...'}</small></div></header>
    <div className="messages" ref={scroll} onScroll={() => { const el = scroll.current!; atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; }}>
      {canLoadMore && <button className="text-button load-more" onClick={onLoadMore}>Mensagens anteriores</button>}
      {!messages.length && <div className="empty-chat"><Hash size={30} /><h3>Comece a conversa</h3></div>}
      {messages.map(message => {
        const name = members.find(m => m.user_id === message.author_id)?.tf_profiles.display_name || 'Membro';
        const task = tasks.find(t => t.source_message_id === message.id);
        return <article key={message.id} className={`message ${message.author_id === userId ? 'own' : ''}`}><span className="avatar small">{initials(name)}</span><div className="message-body"><div className="message-by"><strong>{name}</strong><time dateTime={message.created_at} title={new Date(message.created_at).toLocaleString('pt-BR')}>{new Date(message.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</time></div><p>{message.content}</p><button className={`message-task ${task ? 'linked' : ''}`} onClick={() => task ? onOpen(task) : onCreate(message)}>{task ? <CheckCheck size={14} /> : <ListPlus size={14} />}{task ? `Abrir tarefa${task.archived ? ' arquivada' : ''}` : 'Criar tarefa'}</button></div></article>;
      })}<div ref={end} />
    </div>
    <form className="chat-compose" onSubmit={async e => { e.preventDefault(); if (!text.trim() || busy) return; setBusy(true); setError(''); try { await onSend(text.trim()); setText(''); atBottom.current = true; } catch (e) { setError(errorText(e)); } finally { setBusy(false); } }}><textarea aria-label="Mensagem para a equipe" placeholder="Mensagem para a equipe..." maxLength={8000} required value={text} onChange={e => setText(e.target.value)} rows={3} /><div className="compose-bottom"><small>{text.length > 7500 ? `${text.length}/8000` : '# projeto'}</small><button className="primary icon-button" type="submit" title="Enviar mensagem" aria-label="Enviar mensagem" disabled={busy || !text.trim()}><Send size={17} /></button></div>{error && <p className="error-text" role="alert">{error}</p>}</form>
  </section>;
}
