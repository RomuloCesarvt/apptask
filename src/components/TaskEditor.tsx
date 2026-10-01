"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Archive, CalendarDays, CheckCircle2, CornerDownRight, MessageSquare, Plus, Send, X } from 'lucide-react';
import {
  displayDate,
  errorText,
  initials,
  priorities,
  statuses,
  type Comment,
  type Member,
  type Message,
  type Task,
  type TaskDraft,
} from '@/lib/taskflow';
import TaskAttachments from './TaskAttachments';
import TimeTracker from './TimeTracker';

type Props = {
  task?: Task;
  source?: Message;
  parent?: Task;
  initialDueDate?: string;
  tasks: Task[];
  comments: Comment[];
  members: Member[];
  userId: string;
  onClose: () => void;
  onSave: (draft: TaskDraft) => Promise<void>;
  onArchive?: () => Promise<void>;
  onComment: (content: string) => Promise<void>;
  onSubtask: (task: Task) => void;
  onOpen: (task: Task) => void;
};

export default function TaskEditor({
  task,
  source,
  parent,
  initialDueDate,
  tasks,
  comments,
  members,
  userId,
  onClose,
  onSave,
  onArchive,
  onComment,
  onSubtask,
  onOpen,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<TaskDraft>({
    title: task?.title || source?.content.slice(0, 240) || '',
    description: task?.description || source?.content || '',
    status: task?.status || 'TODO',
    priority: task?.priority || 'MEDIUM',
    assignee_id: task?.assignee_id || null,
    due_date: task?.due_date || initialDueDate || null,
    parent_id: task?.parent_id || parent?.id || null,
  });
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  const taskComments = useMemo(
    () => comments.filter(item => item.task_id === task?.id),
    [comments, task?.id],
  );
  const subtasks = useMemo(
    () => tasks.filter(item => item.parent_id === task?.id && !item.archived),
    [tasks, task?.id],
  );
  const parentTask = parent || tasks.find(item => item.id === task?.parent_id);

  async function perform(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (caught) {
      setError(errorText(caught));
    } finally {
      setBusy(false);
    }
  }

  async function submitComment() {
    const content = comment.trim();
    if (!content || !task) return;
    await perform(async () => {
      await onComment(content);
      setComment('');
    });
  }

  return (
    <dialog ref={dialogRef} className="task-modal" onCancel={onClose}>
      <header className="task-modal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={`status-dot ${draft.status}`} />
          <span>{task ? `Tarefa criada em ${displayDate(task.created_at.slice(0, 10))}` : 'Nova tarefa'}</span>
          {task && <TimeTracker task={task} userId={userId} />}
        </div>
        <button className="icon-button" type="button" aria-label="Fechar tarefa" title="Fechar" onClick={onClose}>
          <X size={19} />
        </button>
      </header>

      <div className="task-modal-content">
        <form
          className="task-details"
          onSubmit={event => {
            event.preventDefault();
            if (!draft.title.trim()) return;
            void perform(() => onSave({ ...draft, title: draft.title.trim(), description: draft.description.trim() }));
          }}
        >
          {parentTask && (
            <button className="parent-task-link" type="button" onClick={() => onOpen(parentTask)}>
              <CornerDownRight size={15} /> Subtarefa de <strong>{parentTask.title}</strong>
            </button>
          )}

          <input
            className="task-title-input"
            autoFocus
            required
            maxLength={240}
            value={draft.title}
            onChange={event => setDraft(current => ({ ...current, title: event.target.value }))}
            placeholder="Nome da tarefa"
          />

          {source && (
            <div className="source-message">
              <MessageSquare size={16} />
              <div><strong>Criada a partir do chat</strong><p>{source.content}</p></div>
            </div>
          )}

          <div className="task-fields-grid">
            <label>Status
              <select value={draft.status} onChange={event => setDraft(current => ({ ...current, status: event.target.value as TaskDraft['status'] }))}>
                {Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>Prioridade
              <select value={draft.priority} onChange={event => setDraft(current => ({ ...current, priority: event.target.value as TaskDraft['priority'] }))}>
                {Object.entries(priorities).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>Responsavel
              <select value={draft.assignee_id || ''} onChange={event => setDraft(current => ({ ...current, assignee_id: event.target.value || null }))}>
                <option value="">Nao atribuido</option>
                {members.map(member => <option key={member.user_id} value={member.user_id}>{member.tf_profiles.display_name}</option>)}
              </select>
            </label>
            <label>Prazo
              <span className="date-input-wrap"><CalendarDays size={15} /><input type="date" value={draft.due_date || ''} onChange={event => setDraft(current => ({ ...current, due_date: event.target.value || null }))} /></span>
            </label>
          </div>

          <label className="task-description-label">Descricao
            <textarea
              rows={8}
              value={draft.description}
              onChange={event => setDraft(current => ({ ...current, description: event.target.value }))}
              placeholder="Contexto, resultado esperado e criterios de conclusao"
            />
          </label>

          {task && (
            <section className="task-subsection">
              <div className="section-title"><h3>Subtarefas ({subtasks.length})</h3><button className="text-button" type="button" onClick={() => onSubtask(task)}><Plus size={15} />Adicionar</button></div>
              {subtasks.length === 0 ? <p className="muted-copy">Nenhuma subtarefa.</p> : subtasks.map(subtask => (
                <button className="subtask-row" type="button" key={subtask.id} onClick={() => onOpen(subtask)}>
                  <CheckCircle2 size={16} className={subtask.status === 'DONE' ? 'done-icon' : ''} />
                  <span>{subtask.title}</span><small>{statuses[subtask.status]}</small>
                </button>
              ))}
            </section>
          )}

          {task && <TaskAttachments task={task} userId={userId} />}

          {error && <p className="error-text" role="alert">{error}</p>}
          <footer className="task-actions">
            {onArchive && <button className="secondary archive-action" type="button" disabled={busy} onClick={() => void perform(onArchive)}><Archive size={16} />{task?.archived ? 'Restaurar' : 'Arquivar'}</button>}
            <button className="secondary" type="button" onClick={onClose}>Cancelar</button>
            <button className="primary" disabled={busy || !draft.title.trim()}>{busy ? 'Salvando...' : task ? 'Salvar alteracoes' : 'Criar tarefa'}</button>
          </footer>
        </form>

        <aside className="task-activity">
          <header><div><MessageSquare size={17} /><strong>Comentarios</strong></div><span>{taskComments.length}</span></header>
          <div className="task-comments">
            {!task && <div className="activity-empty"><MessageSquare size={24} /><p>Crie a tarefa para iniciar a conversa.</p></div>}
            {task && taskComments.length === 0 && <div className="activity-empty"><MessageSquare size={24} /><p>Ainda nao ha comentarios.</p></div>}
            {taskComments.map(item => {
              const author = members.find(member => member.user_id === item.author_id)?.tf_profiles.display_name || 'Membro';
              return <article className="task-comment" key={item.id}>
                <span className="avatar small">{initials(author)}</span>
                <div><div><strong>{author}</strong><time>{new Date(item.created_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</time></div><p>{item.content}</p></div>
              </article>;
            })}
          </div>
          <form className="comment-compose" onSubmit={event => { event.preventDefault(); void submitComment(); }}>
            <textarea aria-label="Novo comentario" rows={3} disabled={!task || busy} value={comment} onChange={event => setComment(event.target.value)} placeholder={task ? 'Escreva um comentario...' : 'Disponivel depois de criar a tarefa'} />
            <button className="primary icon-only" aria-label="Enviar comentario" title="Enviar comentario" disabled={!task || busy || !comment.trim()}><Send size={17} /></button>
          </form>
        </aside>
      </div>
    </dialog>
  );
}
