"use client";
import { useState } from 'react';
import { Archive, MessageSquare, Plus, Send, Save, CornerDownRight } from 'lucide-react';
import { errorText, priorities, statuses, type Task, type TaskDraft, type Message, type Comment, type Member, type Priority, type Status } from '@/lib/taskflow';
import Dialog from './Dialog';

export default function TaskEditor({ task, source, parent, tasks, comments, members, onClose, onSave, onArchive, onComment, onSubtask, onOpen }: {
  task?: Task; source?: Message; parent?: Task; tasks: Task[]; comments: Comment[]; members: Member[];
  onClose: () => void; onSave: (draft: TaskDraft) => Promise<void>; onArchive?: () => Promise<void>;
  onComment: (content: string) => Promise<void>; onSubtask: (task: Task) => void; onOpen: (task: Task) => void;
}) {
  const [draft, setDraft] = useState<TaskDraft>(() => ({ title: task?.title || source?.content.slice(0, 240) || '', description: task?.description || source?.content || '', status: task?.status || 'TODO', priority: task?.priority || 'MEDIUM', assignee_id: task?.assignee_id || null, due_date: task?.due_date || null, parent_id: task?.parent_id || parent?.id || null }));
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [comment, setComment] = useState('');
  const change = <K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) => setDraft(old => ({ ...old, [key]: value }));
  async function perform(action: () => Promise<void>) { if (busy) return; setBusy(true); setError(''); try { await action(); } catch (e) { setError(errorText(e)); } finally { setBusy(false); } }
  const subtasks = task ? tasks.filter(t => t.parent_id === task.id && !t.archived) : [];
  const thread = comments.filter(c => c.task_id === task?.id);
  return <Dialog title={task ? 'Detalhes da tarefa' : source ? 'Criar tarefa da conversa' : parent ? 'Nova subtarefa' : 'Nova tarefa'} onClose={onClose} wide><div className="dialog-body">
    {source && <blockquote className="source-message"><MessageSquare size={16} /><div><strong>Mensagem de origem</strong><p>{source.content}</p></div></blockquote>}
    {parent && <p className="parent-label"><CornerDownRight size={15} />{parent.title}</p>}
    <form onSubmit={e => { e.preventDefault(); if (draft.title.trim()) void perform(() => onSave({ ...draft, title: draft.title.trim() })); }}>
      <label>Titulo<input autoFocus required maxLength={240} value={draft.title} onChange={e => change('title', e.target.value)} placeholder="O que precisa ser feito?" /></label>
      <label>Descricao<textarea rows={4} maxLength={20000} value={draft.description} onChange={e => change('description', e.target.value)} placeholder="Detalhes da tarefa" /></label>
      <div className="form-grid"><label>Status<select value={draft.status} onChange={e => change('status', e.target.value as Status)}>{Object.entries(statuses).map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select></label><label>Prioridade<select value={draft.priority} onChange={e => change('priority', e.target.value as Priority)}>{Object.entries(priorities).map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select></label><label>Responsavel<select value={draft.assignee_id || ''} onChange={e => change('assignee_id', e.target.value || null)}><option value="">Sem responsavel</option>{members.map(m => <option key={m.user_id} value={m.user_id}>{m.tf_profiles.display_name}</option>)}</select></label><label>Prazo<input type="date" value={draft.due_date || ''} onChange={e => change('due_date', e.target.value || null)} /></label></div>
      {error && <p className="error-text" role="alert">{error}</p>}
      <footer>{onArchive && <button type="button" className="secondary archive-action" disabled={busy} onClick={() => void perform(onArchive)}><Archive size={16} />{task?.archived ? 'Restaurar' : 'Arquivar'}</button>}<button type="button" className="secondary" onClick={onClose}>Cancelar</button><button className="primary" disabled={busy || !draft.title.trim()}><Save size={16} />{busy ? 'Salvando...' : task ? 'Salvar' : 'Criar tarefa'}</button></footer>
    </form>
    {task && <>
      {!task.parent_id && <section className="task-subsection"><div className="section-title"><h3>Subtarefas <span className="count">{subtasks.length}</span></h3><button className="icon-button" title="Nova subtarefa" aria-label="Nova subtarefa" onClick={() => onSubtask(task)}><Plus size={17} /></button></div>{subtasks.map(t => <button key={t.id} className="subtask-row" onClick={() => onOpen(t)}><span className={`status-dot ${t.status}`} />{t.title}</button>)}</section>}
      <section className="task-subsection"><h3>Comentarios</h3>{thread.map(c => <article className="task-comment" key={c.id}><strong>{members.find(m => m.user_id === c.author_id)?.tf_profiles.display_name || 'Membro'}</strong><time>{new Date(c.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</time><p>{c.content}</p></article>)}<form className="comment-compose" onSubmit={e => { e.preventDefault(); if (comment.trim()) void perform(async () => { await onComment(comment.trim()); setComment(''); }); }}><textarea aria-label="Novo comentario" value={comment} maxLength={8000} rows={2} required placeholder="Adicionar comentario..." onChange={e => setComment(e.target.value)} /><button disabled={busy || !comment.trim()} className="primary icon-button" title="Enviar comentario" aria-label="Enviar comentario"><Send size={17} /></button></form></section>
    </>}
  </div></Dialog>;
}
