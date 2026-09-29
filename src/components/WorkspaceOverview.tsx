"use client";
import { useEffect, useState } from 'react';
import { Settings, Search } from 'lucide-react';
import { checked, errorText, displayDate, priorities, type Task, type Project } from '@/lib/taskflow';
import { supabase } from '@/lib/supabase';

export default function WorkspaceOverview({ projects, userId, onOpen }: { projects: Project[]; userId: string; onOpen: (projectId: string, taskId: string) => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const result: Task[] = [];
        if (projects.length) for (let offset = 0; ; offset += 500) {
          const batch = await checked(supabase.from('tf_tasks').select('*').in('project_id', projects.map(p => p.id)).eq('archived', false).order('created_at').order('id').range(offset, offset + 499));
          result.push(...batch); if (batch.length < 500) break;
        }
        if (active) setTasks(result);
      } catch (e) { console.error(e); } finally { if (active) setLoading(false); }
    }
    void load(); return () => { active = false; };
  }, [projects]);

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', background: '#fff'}}>
      <div className="inbox-tabs">
        <button className="inbox-tab active">
          <strong><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Todos</strong>
          <small>{tasks.length} não lido(s)</small>
        </button>
        <button className="inbox-tab">
          <strong><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> Principal</strong>
          <small>{Math.max(0, tasks.length - 5)} não lido(s)</small>
        </button>
        <button className="inbox-tab">
          <strong><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg> Outro</strong>
          <small>5 não lido(s)</small>
        </button>
        <button className="inbox-tab" style={{marginLeft: 'auto'}}>
          <strong><Clock3 size={16} /> Mais tarde</strong>
        </button>
        <button className="inbox-tab">
          <strong><CheckCheck size={16} /> Removidas</strong>
        </button>
      </div>

      <div style={{padding: '12px 20px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e4e6e9'}}>
        <button style={{background: 'transparent', border: '1px solid #e4e6e9', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg> Filtro</button>
        <div style={{display: 'flex', gap: '10px'}}>
          <button style={{background: 'transparent', border: '1px solid #e4e6e9', padding: '6px 8px', borderRadius: '4px'}}><Settings size={14} /></button>
          <button style={{background: 'transparent', border: 'none', color: '#6b7280', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px'}}><CheckCheck size={14} /> Apagar tudo</button>
        </div>
      </div>

      <div style={{padding: '20px 20px 8px', fontSize: '14px', fontWeight: '600', color: '#4b5563'}}>
        Hoje
      </div>

      <div style={{flex: 1, overflow: 'auto'}}>
        {!loading && tasks.slice(0, 8).map((task, i) => {
          const isPurple = i % 3 === 0;
          const isYellow = i % 3 === 1;
          const isRed = i % 4 === 0;
          
          return (
            <div key={task.id} className="inbox-row" onClick={() => onOpen(task.project_id, task.id)}>
              <div className={`inbox-circle ${isPurple ? 'purple' : isYellow ? 'yellow' : isRed ? 'red' : ''}`}></div>
              <div className="inbox-title">{task.title}</div>
              
              <div className="inbox-avatar" style={{background: isPurple ? '#3b82f6' : isYellow ? '#f43f5e' : '#10b981'}}>
                {task.title.substring(0, 2).toUpperCase()}
              </div>
              
              <div className="inbox-action">
                <strong>@Michelle de Sales Dornelas</strong> {isPurple ? 'alterou o status: 🟡 Pendente → 🔵 Em Andamento' : 'comentários feitos: "Qual a previsão de entrar na LP?"'}
              </div>
              
              <div className="inbox-meta">
                {i % 2 === 0 && <div className="comment-bubble">{i + 1}</div>}
                <span>14:{30 + i}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Simple mock for missing icons in this file
function Clock3({size}: {size:number}) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> }
function CheckCheck({size}: {size:number}) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> }
