"use client";

import { useEffect, useMemo, useState } from 'react';
import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight, Circle, Plus, RefreshCw, Search } from 'lucide-react';
import { displayDate, errorText, loadTasks, priorities, statuses, today, type Project, type Task } from '@/lib/taskflow';

export default function WorkspacePlanner({
  projects,
  userId,
  onOpen,
  onCreate,
}: {
  projects: Project[];
  userId: string;
  onOpen: (projectId: string, taskId: string) => void;
  onCreate: (projectId: string, dueDate: string) => void;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [query, setQuery] = useState('');
  const [projectId, setProjectId] = useState('');
  const [mine, setMine] = useState(false);
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

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const visible = useMemo(() => tasks.filter(task =>
    (!projectId || task.project_id === projectId)
    && (!mine || task.assignee_id === userId)
    && `${task.title} ${task.description}`.toLowerCase().includes(query.trim().toLowerCase()),
  ), [mine, projectId, query, tasks, userId]);
  const urgent = visible.filter(task => task.status !== 'DONE' && (task.priority === 'URGENT' || task.priority === 'HIGH')).slice(0, 6);
  const withoutDate = visible.filter(task => task.status !== 'DONE' && !task.due_date).slice(0, 8);
  const overdue = visible.filter(task => task.status !== 'DONE' && task.due_date && task.due_date < today()).slice(0, 8);
  const createProjectId = projectId || projects[0]?.id;

  return <section className="planner-shell">
    <aside className="planner-sidebar">
      <div className="planner-sidebar-title"><div><h2>Planejador</h2><p>{visible.length} tarefas visiveis</p></div><button className="icon-button" aria-label="Atualizar planejador" title="Atualizar" onClick={() => setRevision(value => value + 1)}><RefreshCw size={16} /></button></div>
      <label className="search-box"><Search size={16} /><input aria-label="Buscar no planejador" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar tarefas" /></label>
      <label className="planner-field">Lista<select value={projectId} onChange={event => setProjectId(event.target.value)}><option value="">Todas as listas</option>{projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
      <label className="check-filter"><input type="checkbox" checked={mine} onChange={event => setMine(event.target.checked)} />Atribuidas a mim</label>

      <PlannerGroup title="Prioridade alta" tasks={urgent} projects={projects} onOpen={onOpen} />
      <PlannerGroup title="Hoje e atrasadas" tasks={overdue} projects={projects} onOpen={onOpen} />
      <PlannerGroup title="Sem prazo" tasks={withoutDate} projects={projects} onOpen={onOpen} />
    </aside>

    <main className="planner-main">
      <header className="planner-header">
        <div className="planner-navigation">
          <button className="icon-button" aria-label="Semana anterior" title="Semana anterior" onClick={() => setCurrentDate(date => addDays(date, -7))}><ChevronLeft size={18} /></button>
          <button className="secondary" onClick={() => setCurrentDate(new Date())}>Hoje</button>
          <button className="icon-button" aria-label="Proxima semana" title="Proxima semana" onClick={() => setCurrentDate(date => addDays(date, 7))}><ChevronRight size={18} /></button>
        </div>
        <div><h1>{format(weekStart, "'Semana de' d 'de' MMMM", { locale: ptBR })}</h1><p>As tarefas usam o prazo salvo no Supabase.</p></div>
        {createProjectId && <button className="primary" onClick={() => onCreate(createProjectId, format(new Date(), 'yyyy-MM-dd'))}><Plus size={17} />Nova tarefa</button>}
      </header>

      {error && <div className="error-banner" role="alert">{error}<button className="text-button" onClick={() => setRevision(value => value + 1)}>Tentar novamente</button></div>}
      <div className="planner-week">
        {days.map(day => {
          const key = format(day, 'yyyy-MM-dd');
          const dayTasks = visible.filter(task => task.due_date === key).sort((a, b) => a.status.localeCompare(b.status));
          return <section className={isSameDay(day, new Date()) ? 'planner-day today' : 'planner-day'} key={key}>
            <header><div><span>{format(day, 'EEE', { locale: ptBR })}</span><strong>{format(day, 'd')}</strong></div>{createProjectId && <button className="icon-button" aria-label={`Criar tarefa para ${format(day, 'dd/MM')}`} title="Criar tarefa neste dia" onClick={() => onCreate(createProjectId, key)}><Plus size={15} /></button>}</header>
            <div className="planner-day-tasks">
              {loading && <span className="planner-loading">Carregando...</span>}
              {!loading && dayTasks.map(task => <button className={`planner-task priority-${task.priority.toLowerCase()}`} key={task.id} onClick={() => onOpen(task.project_id, task.id)}>
                <span><Circle size={13} /><strong>{task.title}</strong></span>
                <small>{projects.find(project => project.id === task.project_id)?.name} · {priorities[task.priority]}</small>
              </button>)}
              {!loading && !dayTasks.length && <span className="planner-empty">Sem tarefas</span>}
            </div>
          </section>;
        })}
      </div>

      <section className="planner-backlog">
        <div><CalendarDays size={18} /><span><strong>Sem prazo</strong><small>Defina uma data abrindo a tarefa.</small></span></div>
        <div className="planner-backlog-list">{withoutDate.map(task => <button key={task.id} onClick={() => onOpen(task.project_id, task.id)}><Circle size={14} /><span>{task.title}</span><small>{statuses[task.status]} · {displayDate(task.due_date)}</small></button>)}</div>
      </section>
    </main>
  </section>;
}

function PlannerGroup({ title, tasks, projects, onOpen }: { title: string; tasks: Task[]; projects: Project[]; onOpen: (projectId: string, taskId: string) => void }) {
  return <section className="planner-group"><h3>{title}<span>{tasks.length}</span></h3>{tasks.length ? tasks.map(task => <button key={task.id} onClick={() => onOpen(task.project_id, task.id)}><Circle size={14} /><span>{task.title}<small>{projects.find(project => project.id === task.project_id)?.name}</small></span></button>) : <p>Nenhuma tarefa.</p>}</section>;
}
