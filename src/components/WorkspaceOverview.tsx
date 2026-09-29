"use client";
import { useEffect, useState } from 'react';
import { CheckCheck, Clock3, CalendarDays, ListTodo, Search, RefreshCw } from 'lucide-react';
import { checked, errorText, displayDate, priorities, today, type Task, type Project } from '@/lib/taskflow';
import { supabase } from '@/lib/supabase';

export default function WorkspaceOverview({ projects, userId, mine, onOpen }: { projects: Project[]; userId: string; mine: boolean; onOpen: (projectId: string, taskId: string) => void }) {
  const [tasks, setTasks] = useState<Task[]>([]); const [error, setError] = useState(''); const [loading, setLoading] = useState(true); const [query, setQuery] = useState(''); const [filter, setFilter] = useState('open');
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const result: Task[] = [];
        if (projects.length) for (let offset = 0; ; offset += 500) {
          const batch = await checked(supabase.from('tf_tasks').select('*').in('project_id', projects.map(p => p.id)).eq('archived', false).order('created_at').order('id').range(offset, offset + 499));
          result.push(...batch); if (batch.length < 500) break;
        }
        if (active) { setTasks(result); setError(''); }
      } catch (e) { if (active) setError(errorText(e)); } finally { if (active) setLoading(false); }
    }
    void load(); return () => { active = false; };
  }, [projects]);
  const relevant = tasks.filter(t => !mine || t.assignee_id === userId);
  const open = relevant.filter(t => t.status !== 'DONE');
  const late = open.filter(t => t.due_date && t.due_date < today());
  const due = open.filter(t => t.due_date === today());
  const complete = relevant.filter(t => t.status === 'DONE');
  const chosen = filter === 'late' ? late : filter === 'today' ? due : filter === 'done' ? complete : open;
  const shown = chosen.filter(t => t.title.toLowerCase().includes(query.toLowerCase())).sort((a, b) => (a.due_date || '9999').localeCompare(b.due_date || '9999'));
  return <section className="overview"><header><p>Seu workspace</p><h1>{mine ? 'Minhas tarefas' : 'Visao geral'}</h1><span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span></header><div className="overview-metrics">{[{ id: 'open', title: 'Em aberto', value: open.length, Icon: ListTodo }, { id: 'today', title: 'Para hoje', value: due.length, Icon: CalendarDays }, { id: 'late', title: 'Atrasadas', value: late.length, Icon: Clock3 }, { id: 'done', title: 'Concluidas', value: complete.length, Icon: CheckCheck }].map(({ id, title, value, Icon }) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}><Icon size={20} /><span>{title}<strong>{value}</strong></span></button>)}</div><div className="overview-list"><div className="section-title"><h2>{filter === 'late' ? 'Prazos vencidos' : filter === 'today' ? 'Hoje' : filter === 'done' ? 'Trabalho concluido' : 'Proximas entregas'}</h2><label className="search-box"><Search size={16} /><input aria-label="Buscar em todas as tarefas" placeholder="Buscar tarefas" value={query} onChange={e => setQuery(e.target.value)} /></label></div>{error && <p className="error-text" role="alert">{error}</p>}{loading ? <div className="empty-state"><RefreshCw size={24} className="spin" /></div> : shown.length ? shown.map(task => <button className="overview-task" key={task.id} onClick={() => onOpen(task.project_id, task.id)}><span className={`status-dot ${task.status}`} /><div><strong>{task.title}</strong><small>{projects.find(p => p.id === task.project_id)?.name}</small></div><span className={`priority ${task.priority}`}>{priorities[task.priority]}</span><time className={task.due_date && task.due_date < today() && task.status !== 'DONE' ? 'overdue' : ''}>{displayDate(task.due_date)}</time></button>) : <div className="empty-state"><CheckCheck size={36} /><h2>Nenhuma tarefa nesta selecao</h2></div>}</div></section>;
}
