"use client";
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Settings, Calendar as CalendarIcon, RefreshCw, Search, Plus, CheckCircle2, Circle, Sparkles, UserPlus } from 'lucide-react';
import type { Task } from '@/lib/taskflow';

export default function WorkspacePlanner({ tasks, onOpen }: { tasks: Task[]; onOpen: (task: Task) => void }) {
  // Using fixed static dates for the mockup to match the screenshot exactly (September 2026)
  const currentHour = 17;
  const currentMinute = 28;

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
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#4b5563', marginBottom: '12px'}}>
              <span style={{color: '#9ca3af', width: '12px'}}>1</span>
              <CheckCircle2 size={16} color="#3b82f6" fill="#eff6ff" />
              <span style={{textDecoration: 'line-through', color: '#9ca3af'}}>Texto Legal site</span>
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
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <Circle size={14} color="#d1d5db" /> Linktree
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <CheckCircle2 size={14} color="#3b82f6" fill="#3b82f6" /> Plano de mídia online
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <CheckCircle2 size={14} color="#3b82f6" fill="#3b82f6" /> Newsletter | Edição de Fevere...
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* PLANNER CALENDAR MAIN AREA */}
      <main style={{flex: 1, display: 'flex', flexDirection: 'column', position: 'relative'}}>
        {/* Top Header */}
        <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e4e6e9'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <div style={{display: 'flex', gap: '12px', color: '#6b7280', cursor: 'pointer'}}>
              <ChevronLeft size={16} /> <ChevronRight size={16} />
            </div>
            <h1 style={{fontSize: '18px', fontWeight: '400', margin: 0, color: '#111827'}}>September 2026</h1>
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
              {day: 'Sun', date: '27', count: '1 evento', isToday: false},
              {day: 'Mon', date: '28', count: '1 evento', isToday: false},
              {day: 'Tue', date: '29', count: '3 eventos', isToday: true},
              {day: 'Wed', date: '30', count: '5 eventos', isToday: false},
              {day: 'Thu', date: '1', count: '0', hasEvent: true, isToday: false},
              {day: 'Fri', date: '2', count: '0', isToday: false},
              {day: 'Sat', date: '3', count: '0', isToday: false}
            ].map((d, i) => (
              <div key={i} style={{padding: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: i < 6 ? '1px solid #e4e6e9' : 'none'}}>
                <div style={{fontSize: '13px', color: d.isToday ? '#111827' : '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: d.isToday ? '600' : '400'}}>
                  {d.day} 
                  {d.isToday ? <span style={{background: '#ef4444', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>{d.date}</span> : d.date}
                </div>
                {d.hasEvent && d.count === '0' ? (
                   <div style={{marginTop: '8px', fontSize: '11px', background: '#fff', border: '1px solid #e4e6e9', borderRadius: '12px', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '4px', color: '#4b5563', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'}}>
                     <CheckCircle2 size={10} color="#3b82f6" fill="#3b82f6" /> Leads x Vendas
                   </div>
                ) : (
                  <div style={{fontSize: '11px', color: '#9ca3af', marginTop: '8px'}}>{d.count !== '0' ? d.count : ''}</div>
                )}
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

            {/* Events Layer */}
            <div style={{position: 'absolute', top: 0, left: '60px', right: 0, bottom: 0, zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)'}}>
              {/* Monday Event */}
              <div style={{gridColumn: 2, position: 'relative'}}>
                <div style={{position: 'absolute', top: '0px', left: '4px', right: '4px', height: '160px', background: '#93c5fd', borderRadius: '4px', padding: '8px', color: '#fff', fontSize: '11px', cursor: 'pointer'}}>
                  <strong style={{display: 'block', fontSize: '12px', marginBottom: '4px'}}>Alinhamentos Taguaí, Itatinga e Avaré</strong>
                  14:00 - 16:00
                </div>
              </div>
              
              {/* Wednesday Event */}
              <div style={{gridColumn: 4, position: 'relative'}}>
                <div style={{position: 'absolute', top: '120px', left: '4px', right: '4px', height: '80px', background: '#007bff', borderRadius: '4px', padding: '8px', color: '#fff', fontSize: '11px', cursor: 'pointer'}}>
                  <strong style={{display: 'block', fontSize: '12px', marginBottom: '2px'}}>Follow UP - FMD Ita</strong>
                  15:30 - 16:30
                </div>
              </div>

              {/* Thursday Event */}
              <div style={{gridColumn: 5, position: 'relative'}}>
                <div style={{position: 'absolute', top: '40px', left: '4px', right: '4px', height: '80px', background: '#007bff', borderRadius: '4px', padding: '8px', color: '#fff', fontSize: '11px', cursor: 'pointer'}}>
                  <strong style={{display: 'block', fontSize: '12px', marginBottom: '2px'}}>Reunião | SDR ML e</strong>
                  14:30 - 15:30
                </div>
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
