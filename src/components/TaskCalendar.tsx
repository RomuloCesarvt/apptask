"use client";
import { useState } from 'react';
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Task } from '@/lib/taskflow';

export default function TaskCalendar({ tasks, onOpen }: { tasks: Task[]; onOpen: (task: Task) => void }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const days = eachDayOfInterval({ start: startOfWeek(month, { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }) });
  return <div className="task-area calendar-area"><header className="calendar-toolbar"><h2>{format(month, 'MMMM yyyy', { locale: ptBR })}</h2><button className="secondary" onClick={() => setMonth(startOfMonth(new Date()))}>Hoje</button><button className="icon-button" title="Mes anterior" aria-label="Mes anterior" onClick={() => setMonth(m => addMonths(m, -1))}><ChevronLeft size={19} /></button><button className="icon-button" title="Proximo mes" aria-label="Proximo mes" onClick={() => setMonth(m => addMonths(m, 1))}><ChevronRight size={19} /></button></header><div className="calendar-scroll"><div className="calendar-grid">{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map(day => <div className="weekday" key={day}>{day}</div>)}{days.map(day => <section className={`calendar-day ${!isSameMonth(day, month) ? 'outside' : ''}`} key={day.toISOString()}><time className={isToday(day) ? 'today' : ''} dateTime={format(day, 'yyyy-MM-dd')}>{format(day, 'd')}</time>{tasks.filter(task => task.due_date === format(day, 'yyyy-MM-dd')).map(task => <button className={`calendar-task ${task.status}`} key={task.id} onClick={() => onOpen(task)}><span className={`status-dot ${task.status}`} />{task.title}</button>)}</section>)}</div></div>{tasks.some(t => !t.due_date) && <section className="undated"><h3>Sem prazo</h3>{tasks.filter(t => !t.due_date).map(t => <button key={t.id} onClick={() => onOpen(t)}><span className={`status-dot ${t.status}`} />{t.title}</button>)}</section>}</div>;
}
