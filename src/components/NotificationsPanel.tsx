"use client";

import { useEffect, useState } from 'react';
import { Bell, Check, MessageSquare, Tag, UserPlus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { checked, errorText, type Notification } from '@/lib/taskflow';

type PopulatedNotification = Notification & {
  task?: { title: string };
  actor?: { display_name: string };
};

export default function NotificationsPanel({ onClose, onOpenTask }: { onClose: () => void, onOpenTask: (projectId: string, taskId: string) => void }) {
  const [notifications, setNotifications] = useState<PopulatedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function fetchNotifications() {
      try {
        const data = await checked(
          supabase.from('tf_notifications')
            .select('*, task:tf_tasks(title), actor:tf_profiles!tf_notifications_actor_id_fkey(display_name)')
            .order('created_at', { ascending: false })
            .limit(50)
        );
        if (active) setNotifications(data as any);
      } catch (e) {
        if (active) setError(errorText(e));
      } finally {
        if (active) setLoading(false);
      }
    }
    void fetchNotifications();
    return () => { active = false; };
  }, []);

  async function markAsRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await supabase.from('tf_notifications').update({ read: true }).eq('id', id);
    } catch (e) {
      setError(errorText(e));
    }
  }

  async function markAllAsRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length > 0) {
        await supabase.from('tf_notifications').update({ read: true }).in('id', unreadIds);
      }
    } catch (e) {
      setError(errorText(e));
    }
  }

  return (
    <div className="notifications-panel" style={{ position: 'absolute', top: '48px', right: '16px', width: '360px', background: 'white', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 1000, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 64px)' }}>
      <header style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111827' }}>Notificações</h2>
          {notifications.filter(n => !n.read).length > 0 && <span style={{ background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>{notifications.filter(n => !n.read).length}</span>}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {notifications.some(n => !n.read) && <button onClick={markAllAsRead} className="icon-button" title="Marcar todas como lidas"><Check size={16} /></button>}
          <button onClick={onClose} className="icon-button" title="Fechar"><X size={16} /></button>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {loading ? (
          <p style={{ padding: '16px', color: '#6b7280', textAlign: 'center', fontSize: '13px' }}>Carregando...</p>
        ) : error ? (
          <p style={{ padding: '16px', color: '#ef4444', textAlign: 'center', fontSize: '13px' }}>{error}</p>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#6b7280' }}>
            <Bell size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>Nenhuma notificação</p>
            <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Você está em dia com as novidades.</p>
          </div>
        ) : (
          notifications.map(n => (
            <button 
              key={n.id} 
              onClick={() => {
                if (!n.read) markAsRead(n.id);
                onOpenTask(n.project_id, n.task_id);
                onClose();
              }}
              style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: n.read ? 'transparent' : '#f0f9ff', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'flex-start' }}
            >
              <div style={{ marginTop: '2px', color: n.type === 'COMMENT' ? '#3b82f6' : n.type === 'ASSIGN' ? '#10b981' : '#f59e0b' }}>
                {n.type === 'COMMENT' ? <MessageSquare size={16} /> : n.type === 'ASSIGN' ? <UserPlus size={16} /> : <Tag size={16} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#111827' }}>
                  <strong>{n.actor?.display_name || 'Alguém'}</strong> {
                    n.type === 'COMMENT' ? 'comentou na tarefa' :
                    n.type === 'ASSIGN' ? 'atribuiu a tarefa para você:' :
                    'alterou o status da tarefa:'
                  } <strong style={{ color: '#4b5563' }}>{n.task?.title || 'Tarefa'}</strong>
                </p>
                <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  {new Date(n.created_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginTop: '6px' }} />}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
