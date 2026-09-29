"use client";
import React, { useState } from 'react';

type Task = { id: string, title: string, status: string, priority: string };

export default function KanbanBoard({ initialTasks }: { initialTasks?: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks || [
    { id: '1', title: 'Ajustar paleta de cores do Design System', status: 'TODO', priority: 'MEDIUM' },
    { id: '2', title: 'Criar documentação da API', status: 'IN_PROGRESS', priority: 'HIGH' },
    { id: '3', title: 'Revisar PR de autenticação', status: 'REVIEW', priority: 'HIGH' },
    { id: '4', title: 'Deploy no Vercel', status: 'DONE', priority: 'LOW' }
  ]);

  const columns = [
    { id: 'TODO', title: 'A Fazer' },
    { id: 'IN_PROGRESS', title: 'Em Progresso' },
    { id: 'REVIEW', title: 'Revisão' },
    { id: 'DONE', title: 'Concluído' }
  ];

  const handleAddTask = () => {
    setTasks(current => [
      {
        id: Date.now().toString(),
        title: 'Nova tarefa sem titulo',
        status: 'TODO',
        priority: 'MEDIUM',
      },
      ...current,
    ]);
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'LOW': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20 backdrop-blur-md">
        <h2 className="text-2xl font-bold text-white tracking-tight">Website Redesign</h2>
        <button onClick={handleAddTask} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          + Nova Tarefa
        </button>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-6 h-full min-w-max">
          {columns.map(col => (
            <div key={col.id} className="w-80 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-300 text-sm flex items-center gap-2">
                  {col.title} <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full text-gray-400">{tasks.filter(t => t.status === col.id).length}</span>
                </h3>
              </div>
              
              <div className="flex-1 flex flex-col gap-3">
                {tasks.filter(t => t.status === col.id).map(task => (
                  <div key={task.id} className="glass rounded-xl p-4 cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform group">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <button className="text-gray-500 opacity-0 group-hover:opacity-100 hover:text-white transition-opacity">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                      </button>
                    </div>
                    <h4 className="text-gray-100 text-sm font-medium leading-relaxed mb-3">{task.title}</h4>
                    <div className="flex items-center justify-between">
                      <div className="w-6 h-6 rounded-full bg-blue-500/50 flex items-center justify-center text-[10px] text-white">RM</div>
                      <div className="flex items-center text-gray-500 text-xs gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        0
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
