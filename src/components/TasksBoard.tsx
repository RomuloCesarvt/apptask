"use client";
import { useMemo } from 'react';
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core';
import { CalendarDays, MessageSquare, GripVertical, Plus, CornerDownRight } from 'lucide-react';
import { displayDate, initials, priorities, statuses, today, type Comment, type Member, type Status, type Task } from '@/lib/taskflow';
import TaskCalendar from './TaskCalendar';

type GroupBy = 'status' | 'priority' | 'assignee';
type Props = { view: 'board' | 'list' | 'calendar'; groupBy?: GroupBy; tasks: Task[]; members: Member[]; comments: Comment[]; onOpen: (task: Task) => void; onMove: (id: string, field: string, value: string | null) => Promise<void>; onAdd: () => void };

export default function TasksBoard(props: Props) {
  const { tasks, view, onMove, onAdd, members } = props;
  const groupBy = props.groupBy || 'status';
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));

  const groups = useMemo(() => {
    if (groupBy === 'status') {
      return Object.entries(statuses).map(([k, v]) => ({ id: k, label: v, items: tasks.filter(t => t.status === k) }));
    }
    if (groupBy === 'priority') {
      return Object.entries(priorities).map(([k, v]) => ({ id: k, label: v, items: tasks.filter(t => t.priority === k) }));
    }
    if (groupBy === 'assignee') {
      const unassigned = { id: 'unassigned', label: 'Sem responsável', items: tasks.filter(t => !t.assignee_id) };
      const mGroups = members.map(m => ({ id: m.user_id, label: m.tf_profiles.display_name, items: tasks.filter(t => t.assignee_id === m.user_id) }));
      return [unassigned, ...mGroups].filter(g => g.items.length > 0 || g.id === 'unassigned');
    }
    return [];
  }, [tasks, groupBy, members]);

  const targetField = groupBy === 'assignee' ? 'assignee_id' : groupBy;

  if (view === 'list') return <div className="task-area grouped-list">{groups.map(group => <details open key={group.id} className="list-group"><summary><span className={`status-label ${group.id}`}>{group.label}</span><span className="count">{group.items.length}</span></summary><div className="table-scroll"><table className="task-table"><thead><tr><th>Nome</th><th>Responsavel</th><th>Prazo</th><th>Prioridade</th><th>Status</th></tr></thead><tbody>{group.items.map(task => <tr key={task.id}><td><button className="task-title" onClick={() => props.onOpen(task)}><span className={`status-dot ${task.status}`} />{task.parent_id && <CornerDownRight size={14} />}{task.title}</button></td><td>{props.members.find(m => m.user_id === task.assignee_id)?.tf_profiles.display_name || 'Sem responsavel'}</td><td className={task.due_date && task.due_date < today() && task.status !== 'DONE' ? 'overdue' : ''}>{displayDate(task.due_date)}</td><td><span className={`priority ${task.priority}`}>{priorities[task.priority]}</span></td><td><select aria-label={`Status de ${task.title}`} value={task.status} onChange={e => void onMove(task.id, 'status', e.target.value)}>{Object.entries(statuses).map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select></td></tr>)}</tbody></table></div><button className="add-card" onClick={onAdd}><Plus size={15} />Adicionar tarefa</button></details>)}{!tasks.length && <Empty onAdd={onAdd} />}</div>;
  if (view === 'calendar') return <TaskCalendar tasks={tasks} onOpen={props.onOpen} />;
  return <DndContext sensors={sensors} onDragEnd={({ active, over }) => { if (over) { const dropId = over.id === 'unassigned' ? null : String(over.id); if (active.data.current?.groupId !== String(over.id)) void onMove(String(active.id), targetField, dropId); } }}><div className="task-area board">{groups.map(group => <Column key={group.id} id={group.id} label={group.label} count={group.items.length}>{group.items.map(task => <TaskCard key={task.id} task={task} groupId={group.id} {...props} />)}<button className="add-card" onClick={onAdd}><Plus size={16} />Adicionar tarefa</button></Column>)}</div></DndContext>;
}
function Column({ id, label, count, children }: { id: string; label: string; count: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return <section ref={setNodeRef} className={`board-column ${isOver ? 'drag-over' : ''}`}><h2><span className={`status-dot ${id}`} />{label}<span className="count">{count}</span></h2><div className="column-tasks">{children}</div></section>;
}
function TaskCard({ task, members, comments, onOpen, groupId }: Props & { task: Task; groupId: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id, data: { groupId } });
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
