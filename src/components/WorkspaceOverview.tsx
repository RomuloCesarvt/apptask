"use client";
import { useEffect, useState } from 'react';
import { CheckCheck, Clock3, CalendarDays, ListTodo, Search, RefreshCw, AlertTriangle, Play, Flame } from 'lucide-react';
import { checked, errorText, displayDate, priorities, today, type Task, type Project } from '@/lib/taskflow';
import { supabase } from '@/lib/supabase';

export default function WorkspaceOverview({ projects, userId, mine, onOpen }: { projects: Project[]; userId: string; mine: boolean; onOpen: (projectId: string, taskId: string) => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('open');

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
  
  const totalTasks = relevant.length;
  const completionPercentage = totalTasks > 0 ? Math.round((complete.length / totalTasks) * 100) : 0;

  return (
    <section className="overview">
      <header>
        <p>Dashboard</p>
        <h1>{mine ? 'Minhas Metas e Tarefas' : 'Visao Geral da Equipe'}</h1>
        <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </header>

      {/* NOVO: Barra de Progresso Global do Workspace */}
      <div className="dashboard-widget progress-widget" style={{ marginBottom: '24px', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid var(--line)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
          <strong style={{fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px'}}><Flame size={18} color="#f97316" /> Progresso Geral</strong>
          <span style={{fontSize: '14px', fontWeight: 'bold', color: 'var(--accent)'}}>{completionPercentage}% Concluido</span>
        </div>
        <div style={{height: '10px', background: '#f0f0f0', borderRadius: '5px', overflow: 'hidden'}}>
          <div style={{height: '100%', width: `${completionPercentage}%`, background: 'var(--accent)', transition: 'width 1s ease-in-out'}}></div>
        </div>
        <p style={{fontSize: '11px', color: 'var(--muted)', marginTop: '8px'}}>{complete.length} de {totalTasks} tarefas finalizadas</p>
      </div>

      <div className="overview-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', borderBottom: 'none', paddingBottom: '20px'}}>
        {[
          { id: 'open', title: 'Em aberto', value: open.length, Icon: ListTodo, color: '#557ec8' },
          { id: 'today', title: 'Para hoje', value: due.length, Icon: CalendarDays, color: '#f97316' },
          { id: 'late', title: 'Atrasadas', value: late.length, Icon: AlertTriangle, color: '#ef4444' },
          { id: 'done', title: 'Concluidas', value: complete.length, Icon: CheckCheck, color: '#10b981' }
        ].map(({ id, title, value, Icon, color }) => (
          <button 
            key={id} 
            className={filter === id ? 'active' : ''} 
            onClick={() => setFilter(id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '16px',
              background: filter === id ? 'var(--soft)' : '#fff',
              border: `1px solid ${filter === id ? 'var(--accent)' : 'var(--line)'}`,
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
              <div style={{background: `${color}20`, padding: '6px', borderRadius: '6px', color: color}}>
                <Icon size={18} />
              </div>
              <span style={{fontSize: '12px', fontWeight: '500', color: 'var(--muted)'}}>{title}</span>
            </div>
            <strong style={{fontSize: '28px', color: 'var(--ink)'}}>{value}</strong>
          </button>
        ))}
      </div>

      <div className="overview-list" style={{background: 'white', borderRadius: '8px', padding: '20px', border: '1px solid var(--line)', boxShadow: '0 1px 3px rgba(0,0,0,0.03)'}}>
        <div className="section-title" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--line)', paddingBottom: '15px'}}>
          <h2 style={{fontSize: '16px', fontWeight: '600', color: 'var(--ink)'}}>
            {filter === 'late' ? '⚠️ Atenção Exigida (Atrasadas)' : filter === 'today' ? '📅 Foco de Hoje' : filter === 'done' ? '✅ Histórico de Conclusões' : '📋 Backlog Geral'}
          </h2>
          <label className="search-box" style={{background: '#f4f5f7', padding: '6px 12px', borderRadius: '6px'}}>
            <Search size={16} color="var(--muted)" />
            <input aria-label="Buscar" placeholder="Filtrar nesta lista..." value={query} onChange={e => setQuery(e.target.value)} style={{background: 'transparent', border: 'none', outline: 'none', marginLeft: '8px'}} />
          </label>
        </div>

        {error && <p className="error-text" role="alert">{error}</p>}
        {loading ? <div className="empty-state"><RefreshCw size={24} className="spin" /></div> : shown.length ? shown.map(task => (
          <button className="overview-task" key={task.id} onClick={() => onOpen(task.project_id, task.id)} style={{display: 'flex', width: '100%', padding: '12px', borderBottom: '1px solid var(--line)', alignItems: 'center', cursor: 'pointer', transition: 'background 0.2s', borderRadius: '6px'}} onMouseOver={e => e.currentTarget.style.background = '#f9fafb'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
            <span className={`status-dot ${task.status}`} style={{marginRight: '12px'}} />
            <div style={{flex: 1, textAlign: 'left'}}>
              <strong style={{fontSize: '13px', color: 'var(--ink)'}}>{task.title}</strong>
              <small style={{fontSize: '11px', color: 'var(--muted)', display: 'block', marginTop: '4px'}}>{projects.find(p => p.id === task.project_id)?.name}</small>
            </div>
            
            {/* Tag simulando o Time Tracking - Preparacao para Fase B */}
            <div style={{display: 'flex', alignItems: 'center', gap: '4px', background: '#f4f5f7', padding: '4px 8px', borderRadius: '4px', marginRight: '12px', fontSize: '10px', color: 'var(--muted)'}}>
              <Play size={10} /> 00:00
            </div>

            <span className={`priority ${task.priority}`} style={{marginRight: '12px'}}>{priorities[task.priority]}</span>
            <time className={task.due_date && task.due_date < today() && task.status !== 'DONE' ? 'overdue' : ''} style={{fontSize: '11px', minWidth: '80px', textAlign: 'right'}}>{displayDate(task.due_date)}</time>
          </button>
        )) : <div className="empty-state" style={{minHeight: '150px'}}><CheckCheck size={36} color="var(--muted)" /><h2 style={{fontSize: '14px', marginTop: '12px', color: 'var(--muted)'}}>Tudo limpo por aqui!</h2></div>}
      </div>
    </section>
  );
}
