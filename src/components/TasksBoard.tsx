"use client";
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core';
import { CalendarDays, MessageSquare, GripVertical, Plus, CornerDownRight } from 'lucide-react';
import { displayDate, initials, priorities, statuses, today, type Comment, type Member, type Status, type Task } from '@/lib/taskflow';
import TaskCalendar from './TaskCalendar';

type Props = { view: 'board' | 'list' | 'calendar'; tasks: Task[]; members: Member[]; comments: Comment[]; onOpen: (task: Task) => void; onMove: (id: string, status: Status) => Promise<void>; onAdd: () => void };
export default function TasksBoard(props: Props) {
  const { tasks, view, onMove, onAdd } = props;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));
  if (view === 'list') return <div className="task-area grouped-list">{Object.entries(statuses).map(([status, label]) => <details open key={status} className="list-group"><summary><span className={`status-label ${status}`}>{label}</span><span className="count">{tasks.filter(t => t.status === status).length}</span></summary><div className="table-scroll"><table className="task-table"><thead><tr><th>Nome</th><th>Responsavel</th><th>Prazo</th><th>Prioridade</th><th>Status</th></tr></thead><tbody>{tasks.filter(t => t.status === status).map(task => <tr key={task.id}><td><button className="task-title" onClick={() => props.onOpen(task)}><span className={`status-dot ${task.status}`} />{task.parent_id && <CornerDownRight size={14} />}{task.title}</button></td><td>{props.members.find(m => m.user_id === task.assignee_id)?.tf_profiles.display_name || 'Sem responsavel'}</td><td className={task.due_date && task.due_date < today() && task.status !== 'DONE' ? 'overdue' : ''}>{displayDate(task.due_date)}</td><td><span className={`priority ${task.priority}`}>{priorities[task.priority]}</span></td><td><select aria-label={`Status de ${task.title}`} value={task.status} onChange={e => void onMove(task.id, e.target.value as Status)}>{Object.entries(statuses).map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select></td></tr>)}</tbody></table></div><button className="add-card" onClick={onAdd}><Plus size={15} />Adicionar tarefa</button></details>)}{!tasks.length && <Empty onAdd={onAdd} />}</div>;
  if (view === 'calendar') return <TaskCalendar tasks={tasks} onOpen={props.onOpen} />;
  return <DndContext sensors={sensors} onDragEnd={({ active, over }) => { if (over && active.data.current?.status !== over.id) void onMove(String(active.id), over.id as Status); }}><div className="task-area board">{Object.entries(statuses).map(([status, label]) => <Column key={status} status={status as Status} label={label} count={tasks.filter(t => t.status === status).length}>{tasks.filter(t => t.status === status).map(task => <TaskCard key={task.id} task={task} {...props} />)}<button className="add-card" onClick={onAdd}><Plus size={16} />Adicionar tarefa</button></Column>)}</div></DndContext>;
}
function Column({ status, label, count, children }: { status: Status; label: string; count: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return <section ref={setNodeRef} className={`board-column ${isOver ? 'drag-over' : ''}`}><h2><span className={`status-dot ${status}`} />{label}<span className="count">{count}</span></h2><div className="column-tasks">{children}</div></section>;
}
function TaskCard({ task, members, comments, onOpen }: Props & { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id, data: { status: task.status } });
  const member = members.find(m => m.user_id === task.assignee_id);
  const count = comments.filter(c => c.task_id === task.id).length;
  return <article ref={setNodeRef} className={`task-card ${isDragging ? 'dragging' : ''}`} style={transform ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` } : undefined}>
    <div className="card-top"><span className={`priority ${task.priority}`}>{priorities[task.priority]}</span><button className="drag-handle icon-button" {...listeners} {...attributes} aria-label={`Mover ${task.title}`} title="Arrastar tarefa"><GripVertical size={16} /></button></div>
    <button className="task-title" onClick={() => onOpen(task)}>{task.parent_id && <CornerDownRight size={14} />}{task.title}</button>
    {task.source_message_id && <span className="source-tag"><MessageSquare size={12} />Do chat</span>}
    <div className="card-footer"><span className={task.due_date && task.due_date < today() && task.status !== 'DONE' ? 'overdue' : ''}><CalendarDays size={13} />{displayDate(task.due_date)}</span><span className="card-meta">{count > 0 && <span><MessageSquare size={12} />{count}</span>}<span className="avatar small" title={member?.tf_profiles.display_name || 'Sem responsavel'}>{member ? initials(member.tf_profiles.display_name) : '?'}</span></span></div>
  </article>;
}
function Empty({ onAdd }: { onAdd: () => void }) { return <div className="empty-state"><h2>Nenhuma tarefa encontrada</h2><button className="secondary" onClick={onAdd}><Plus size={16} />Nova tarefa</button></div>; }
