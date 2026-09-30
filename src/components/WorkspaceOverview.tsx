"use client";

import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Circle, ListFilter, RefreshCw, Search } from 'lucide-react';
import { displayDate, errorText, loadTasks, priorities, statuses, today, type Project, type Task } from '@/lib/taskflow';

type Filter = 'open' | 'overdue' | 'today' | 'done';

export default function WorkspaceOverview({
  projects,
  userId,
  mine = false,
  onOpen,
}: {
  projects: Project[];
  userId: string;
  mine?: boolean;
  onOpen: (projectId: string, taskId: string) => void;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>('open');
  const [query, setQuery] = useState('');
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    void Promise.all(projects.map(project => loadTasks(project.id)))
      .then(rows => { if (active) { setTasks(rows.flat().filter(task => !task.archived && !task.parent_id)); setError(''); } })
      .catch(caught => { if (active) setError(errorText(caught)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [projects, revision]);

  const date = today();
  const scoped = useMemo(
    () => tasks.filter(task => !mine || task.assignee_id === userId),
    [mine, tasks, userId],
  );
  const counts = {
    open: scoped.filter(task => task.status !== 'DONE').length,
    overdue: scoped.filter(task => task.status !== 'DONE' && task.due_date && task.due_date < date).length,
    today: scoped.filter(task => task.status !== 'DONE' && task.due_date === date).length,
    done: scoped.filter(task => task.status === 'DONE').length,
  };
  const shown = useMemo(() => scoped
    .filter(task => !projectId || task.project_id === projectId)
    .filter(task => `${task.title} ${task.description}`.toLowerCase().includes(query.trim().toLowerCase()))
    .filter(task => {
      if (filter === 'done') return task.status === 'DONE';
      if (filter === 'overdue') return task.status !== 'DONE' && !!task.due_date && task.due_date < date;
      if (filter === 'today') return task.status !== 'DONE' && task.due_date === date;
      return task.status !== 'DONE';
    })
    .sort((a, b) => (a.due_date || '9999-12-31').localeCompare(b.due_date || '9999-12-31') || b.updated_at.localeCompare(a.updated_at)),
  [date, filter, projectId, query, scoped]);

  return <section className="workspace-overview">
    <header className="overview-header">
      <div><h1>{mine ? 'Minhas tarefas' : 'Visao geral'}</h1><p>{mine ? 'Trabalho atribuido a voce em todas as listas.' : 'Prazos e prioridades de todo o workspace.'}</p></div>
      <button className="icon-button" aria-label="Atualizar tarefas" title="Atualizar" onClick={() => setRevision(value => value + 1)}><RefreshCw size={17} /></button>
    </header>

    <div className="overview-tabs" role="tablist" aria-label="Filtrar tarefas">
      {([
        ['open', 'Em aberto', counts.open],
        ['overdue', 'Atrasadas', counts.overdue],
        ['today', 'Hoje', counts.today],
        ['done', 'Concluidas', counts.done],
      ] as const).map(([value, label, count]) => <button key={value} role="tab" aria-selected={filter === value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}><span>{label}</span><strong>{count}</strong></button>)}
    </div>

    <div className="overview-toolbar">
      <label className="search-box"><Search size={16} /><input aria-label="Buscar na visao geral" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar tarefa" /></label>
      <label className="compact-select"><ListFilter size={15} /><select aria-label="Filtrar por lista" value={projectId} onChange={event => setProjectId(event.target.value)}><option value="">Todas as listas</option>{projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
    </div>

    {error && <div className="error-banner" role="alert">{error}<button className="text-button" onClick={() => setRevision(value => value + 1)}>Tentar novamente</button></div>}
    <div className="overview-list">
      {loading && <div className="empty-state"><RefreshCw className="spin" size={24} /><p>Carregando tarefas...</p></div>}
      {!loading && shown.map(task => {
        const project = projects.find(item => item.id === task.project_id);
        const overdue = task.status !== 'DONE' && !!task.due_date && task.due_date < date;
        return <button className="overview-task-row" key={task.id} onClick={() => onOpen(task.project_id, task.id)}>
          {task.status === 'DONE' ? <CheckCircle2 className="done-icon" size={18} /> : <Circle size={18} />}
          <span className="overview-task-main"><strong>{task.title}</strong><small>{project?.name || 'Lista'} · {statuses[task.status]}</small></span>
          <span className={`priority-label priority-${task.priority.toLowerCase()}`}>{priorities[task.priority]}</span>
          <span className={overdue ? 'due-date overdue' : 'due-date'}><CalendarClock size={14} />{displayDate(task.due_date)}</span>
        </button>;
      })}
      {!loading && !shown.length && <div className="empty-state"><CheckCircle2 size={34} /><h2>Nada por aqui</h2><p>Nao ha tarefas para este filtro.</p></div>}
    </div>
  </section>;
}
