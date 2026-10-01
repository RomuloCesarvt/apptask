"use client";

import { useEffect, useState } from 'react';
import { Play, Square, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { checked, type TimeEntry, type Task } from '@/lib/taskflow';

export default function TimeTracker({ task, userId }: { task: Task; userId: string }) {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticking, setTicking] = useState(0); // force re-render for live timer

  useEffect(() => {
    let active = true;
    async function fetchTime() {
      try {
        const data = await checked(supabase.from('tf_time_entries').select('*').eq('task_id', task.id));
        if (active) setEntries(data);
      } catch (e) {} finally {
        if (active) setLoading(false);
      }
    }
    void fetchTime();
    return () => { active = false; };
  }, [task.id]);

  useEffect(() => {
    const timer = setInterval(() => setTicking(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeEntry = entries.find(e => e.end_time === null && e.user_id === userId);

  async function toggleTimer() {
    if (activeEntry) {
      // Stop timer
      const now = new Date();
      const start = new Date(activeEntry.start_time);
      const durationSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
      
      const updated = await checked<TimeEntry>(
        supabase.from('tf_time_entries')
          .update({ end_time: now.toISOString(), duration: durationSeconds })
          .eq('id', activeEntry.id)
          .select()
          .single()
      );
      setEntries(prev => prev.map(e => e.id === activeEntry.id ? updated : e));
    } else {
      // Start timer
      const newEntry = await checked<TimeEntry>(
        supabase.from('tf_time_entries')
          .insert({ task_id: task.id, user_id: userId })
          .select()
          .single()
      );
      setEntries(prev => [...prev, newEntry]);
    }
  }

  // Calculate total time
  const totalSeconds = entries.reduce((acc, entry) => {
    if (entry.duration !== null) {
      return acc + entry.duration;
    } else {
      const start = new Date(entry.start_time);
      const now = new Date();
      return acc + Math.floor((now.getTime() - start.getTime()) / 1000);
    }
  }, 0);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  if (loading) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: activeEntry ? '#fef2f2' : '#f3f4f6', padding: '4px 10px', borderRadius: '20px', transition: 'background 0.2s' }}>
      <button 
        type="button" 
        onClick={() => void toggleTimer()}
        className="icon-button"
        style={{ color: activeEntry ? '#ef4444' : '#10b981', padding: '4px', margin: '-4px' }}
        title={activeEntry ? "Parar cronômetro" : "Iniciar cronômetro"}
      >
        {activeEntry ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
      </button>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: activeEntry ? '#ef4444' : '#4b5563', fontSize: '13px', fontWeight: 500, fontFamily: 'monospace' }}>
        <Clock size={14} />
        {totalSeconds > 0 || activeEntry ? formatTime(totalSeconds) : '0s'}
      </div>
    </div>
  );
}
