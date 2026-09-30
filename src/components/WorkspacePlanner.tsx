"use client";
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Settings, Calendar as CalendarIcon, RefreshCw, Search, Plus, CheckCircle2, Circle, Sparkles, UserPlus } from 'lucide-react';
import { addDays, format, startOfWeek, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { checked, type Task, type Project } from '@/lib/taskflow';

export default function WorkspacePlanner({ projects, onOpen }: { projects: Project[]; onOpen: (projectId: string, taskId: string) => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday
  const days = Array.from({length: 7}).map((_, i) => addDays(weekStart, i));

  const priorities = tasks.filter(t => t.priority === 'URGENT' || t.priority === 'HIGH').slice(0, 5);
  const pending = tasks.filter(t => t.status === 'TODO' || t.status === 'IN_PROGRESS').slice(0, 10);

  return (
    <div style={{display: 'flex', height: '100%', width: '100%', background: '#fff'}}>
      
      {/* PLANNER SIDEBAR */}
      <aside style={{width: '260px', borderRight: '1px solid #e4e6e9', display: 'flex', flexDirection: 'column', background: '#fff', flexShrink: 0}}>
        <div style={{padding: '20px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2 style={{fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0}}>Planejador</h2>
          <div style={{display: 'flex', gap: '8px', color: '#6b7280'}}>
            <Search size={16} />
            <div style={{display: 'flex', alignItems: 'center', border: '1px solid #e4e6e9', borderRadius: '4px', padding: '2px 6px', fontSize: '12px'}}>
              <Plus size={14} /> <ChevronRight size={12} style={{transform: 'rotate(90deg)'}} />
            </div>
          </div>
        </div>

        <div style={{flex: 1, overflowY: 'auto', padding: '0 20px 20px'}}>
          {/* Prioridades */}
          <div style={{marginTop: '20px'}}>
            <div style={{fontSize: '12px', color: '#6b7280', marginBottom: '12px'}}>Prioridades</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#4b5563', marginBottom: '12px'}}>
              {priorities.length === 0 ? <span style={{color: '#9ca3af'}}>Nenhuma prioridade.</span> : priorities.map((t, i) => (
                <div key={t.id} style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}} onClick={() => onOpen(t.project_id, t.id)}>
                  <span style={{color: '#9ca3af', width: '12px'}}>{i+1}</span>
                  <CheckCircle2 size={16} color={t.status === 'DONE' ? '#10b981' : '#3b82f6'} fill={t.status === 'DONE' ? '#d1fae5' : '#eff6ff'} />
                  <span style={{textDecoration: t.status === 'DONE' ? 'line-through' : 'none', color: t.status === 'DONE' ? '#9ca3af' : '#4b5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{t.title}</span>
                </div>
              ))}
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#9ca3af', cursor: 'pointer'}}>
              <Plus size={16} /> Adicionar prioridade
            </div>
          </div>

          {/* Reunião com */}
          <div style={{marginTop: '24px'}}>
            <div style={{fontSize: '12px', color: '#6b7280', marginBottom: '12px'}}>Reunião com</div>
            <div style={{border: '1px solid #e4e6e9', borderRadius: '6px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '13px'}}>
              <UserPlus size={14} /> Pesquisar pessoas...
            </div>
          </div>

          {/* Collapsibles */}
          <div style={{marginTop: '24px', fontSize: '13px', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'}}>
              Atribuídas a mim <ChevronRight size={14} />
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'}}>
              Hoje e atrasadas <ChevronRight size={14} />
            </div>
          </div>

          {/* Lista de pendências */}
          <div style={{marginTop: '24px'}}>
            <div style={{fontSize: '12px', color: '#6b7280', marginBottom: '12px'}}>Lista de pendências</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#4b5563'}}>
              {pending.length === 0 ? <span style={{color: '#9ca3af'}}>Nenhuma pendência.</span> : pending.map(t => (
                 <div key={t.id} style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}} onClick={() => onOpen(t.project_id, t.id)}>
                   {t.status === 'TODO' ? <Circle size={14} color="#d1d5db" /> : <CheckCircle2 size={14} color="#3b82f6" fill="#3b82f6" />}
                   <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{t.title}</span>
                 </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* PLANNER CALENDAR MAIN AREA */}
      <main style={{flex: 1, display: 'flex', flexDirection: 'column', position: 'relative'}}>
        {/* Top Header */}
        <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e4e6e9'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <div style={{display: 'flex', gap: '12px', color: '#6b7280'}}>
              <ChevronLeft size={16} style={{cursor: 'pointer'}} onClick={() => setCurrentDate(addDays(currentDate, -7))} /> 
              <ChevronRight size={16} style={{cursor: 'pointer'}} onClick={() => setCurrentDate(addDays(currentDate, 7))} />
            </div>
            <h1 style={{fontSize: '18px', fontWeight: '400', margin: 0, color: '#111827'}}>{format(currentDate, 'MMMM yyyy', {locale: ptBR})}</h1>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px', color: '#6b7280'}}>
            <div style={{border: '1px solid #e4e6e9', padding: '4px 12px', borderRadius: '4px', fontSize: '13px', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
              Semana <ChevronRight size={14} style={{transform: 'rotate(90deg)'}} />
            </div>
            <CalendarIcon size={18} />
            <RefreshCw size={18} />
            <Settings size={18} />
          </div>
        </header>

        {/* Calendar Grid Container */}
        <div style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column'}}>
          
          {/* Days Header */}
          <div style={{display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: '1px solid #e4e6e9', background: '#fff', position: 'sticky', top: 0, zIndex: 10}}>
            <div style={{padding: '12px', color: '#9ca3af', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #e4e6e9'}}>
              <div>GMT-3</div>
              <div>O dia todo</div>
            </div>
            {[
              ...days.map(day => {
                const dayTasks = tasks.filter(t => t.due_date === format(day, 'yyyy-MM-dd'));
                return {
                  day: format(day, 'EEE', {locale: ptBR}),
                  date: format(day, 'd'),
                  count: `${dayTasks.length} eventos`,
                  isToday: isSameDay(day, now),
                  tasks: dayTasks
                };
              })
            ].map((d, i) => (
              <div key={i} style={{padding: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: i < 6 ? '1px solid #e4e6e9' : 'none'}}>
                <div style={{fontSize: '13px', color: d.isToday ? '#111827' : '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: d.isToday ? '600' : '400'}}>
                  {d.day} 
                  {d.isToday ? <span style={{background: '#ef4444', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>{d.date}</span> : d.date}
                </div>
                
                <div style={{marginTop: '8px', width: '100%', padding: '0 4px', display: 'flex', flexDirection: 'column', gap: '4px'}}>
                  {d.tasks.slice(0, 3).map(task => (
                    <div key={task.id} onClick={() => onOpen(task.project_id, task.id)} style={{fontSize: '10px', background: '#fff', border: '1px solid #e4e6e9', borderRadius: '4px', padding: '2px 4px', display: 'flex', alignItems: 'center', gap: '4px', color: '#4b5563', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      <CheckCircle2 size={10} color={task.status === 'DONE' ? '#10b981' : '#3b82f6'} fill={task.status === 'DONE' ? '#d1fae5' : '#eff6ff'} /> {task.title}
                    </div>
                  ))}
                  {d.tasks.length > 3 && <div style={{fontSize: '10px', color: '#9ca3af', textAlign: 'center'}}>+{d.tasks.length - 3} eventos</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Time Grid (Absolute Positioning for Events) */}
          <div style={{position: 'relative', flex: 1, display: 'flex'}}>
            {/* Background Grid Lines */}
            <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0}}>
              {Array.from({length: 9}).map((_, i) => (
                <div key={i} style={{display: 'flex', height: '80px'}}>
                  <div style={{width: '60px', borderRight: '1px solid #e4e6e9', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'center', paddingTop: '8px'}}>
                    <span style={{fontSize: '11px', color: '#9ca3af'}}>{14 + i}:00</span>
                  </div>
                  <div style={{flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)'}}>
                    {Array.from({length: 7}).map((_, j) => (
                       <div key={j} style={{borderRight: j < 6 ? '1px solid #e4e6e9' : 'none', borderBottom: '1px solid #f3f4f6'}}></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Events Layer (Mockup Only since we don't have start/end times in DB yet) */}
            <div style={{position: 'absolute', top: 0, left: '60px', right: 0, bottom: 0, zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', pointerEvents: 'none', opacity: 0.2}}>
              {/* This area is grayed out until database schema supports precise hours */}
              <div style={{gridColumn: '1 / span 7', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                 <span style={{background: 'rgba(255,255,255,0.8)', padding: '10px 20px', borderRadius: '8px', color: '#9ca3af', fontSize: '13px'}}>
                   Agendamento por horas será suportado na Fase D
                 </span>
              </div>
            </div>

            {/* Current Time Indicator Layer */}
            <div style={{position: 'absolute', top: `${(currentHour - 14) * 80 + (currentMinute / 60) * 80}px`, left: 0, right: 0, zIndex: 2, display: 'flex'}}>
              <div style={{width: '60px', display: 'flex', justifyContent: 'center', transform: 'translateY(-50%)'}}>
                 <div style={{background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px'}}>
                   {currentHour}:{currentMinute}
                 </div>
              </div>
              <div style={{flex: 1, position: 'relative'}}>
                 <div style={{position: 'absolute', left: 0, right: 0, height: '2px', background: '#ef4444', top: '-1px'}}></div>
                 <div style={{position: 'absolute', left: `${(2/7)*100}%`, width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', top: '-6px', transform: 'translateX(-50%)'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Command Bar */}
        <div style={{position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', width: '500px', background: '#fff', borderRadius: '24px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 0 0 1px #e4e6e9', zIndex: 20}}>
          <Search size={18} color="#9ca3af" />
          <input 
            placeholder="Pesquise eventos, colegas de equipe, comandos..." 
            style={{flex: 1, border: 'none', outline: 'none', fontSize: '13px', color: '#4b5563'}}
          />
          <Sparkles size={18} color="#ec4899" style={{cursor: 'pointer'}} />
        </div>
      </main>
    </div>
  );
}
