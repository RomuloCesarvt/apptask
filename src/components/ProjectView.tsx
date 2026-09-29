"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Search, Columns3, List, MessageSquare, CalendarDays, Archive, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { checked, errorText, loadTasks, loadComments, priorities, statuses, today, type Task, type TaskDraft, type Message, type Comment, type Member, type Project, type Workspace } from '@/lib/taskflow';
import TasksBoard from './TasksBoard';
import TeamChat from './TeamChat';
import TaskEditor from './TaskEditor';

export default function ProjectView({ project, workspace, members, userId, initialView = 'list', initialTaskId }: { project: Project; workspace: Workspace; members: Member[]; userId: string; initialView?: 'list' | 'chat'; initialTaskId?: string }) {
  const [tasks, setTasks] = useState<Task[]>([]); const [messages, setMessages] = useState<Message[]>([]); const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(true); const [online, setOnline] = useState(false);
  const [view, setView] = useState<'board' | 'list' | 'calendar' | 'chat'>(initialView);
  const [search, setSearch] = useState(''); const [status, setStatus] = useState(''); const [priority, setPriority] = useState(''); const [mine, setMine] = useState(false); const [archived, setArchived] = useState(false);
  const [editor, setEditor] = useState<{ task?: Task; source?: Message; parent?: Task } | null>(null);
  const [messageLimit, setMessageLimit] = useState(100); const [revision, setRevision] = useState(0);
  const initialTaskOpened = useRef(false);
  const refresh = useCallback(() => setRevision(v => v + 1), []);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [ts, ms, cs] = await Promise.all([
          loadTasks(project.id),
          checked(supabase.from('tf_messages').select('*').eq('project_id', project.id).order('created_at', { ascending: false }).order('id').limit(messageLimit)),
          loadComments(project.id),
        ]);
        if (active) { setTasks(ts); setMessages(ms.reverse()); setComments(cs); setError(''); if (initialTaskId && !initialTaskOpened.current) { const target = ts.find(t => t.id === initialTaskId); if (target) { setEditor({ task: target }); initialTaskOpened.current = true; } } }
      } catch (e) { if (active) setError(errorText(e)); }
      finally { if (active) setLoading(false); }
    }
    void load(); return () => { active = false; };
  }, [project.id, messageLimit, revision, initialTaskId]);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const changed = () => { clearTimeout(timer); timer = setTimeout(refresh, 150); };
    const channel = supabase.channel(`project:${project.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tf_tasks', filter: `project_id=eq.${project.id}` }, changed)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tf_messages', filter: `project_id=eq.${project.id}` }, changed)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tf_comments', filter: `project_id=eq.${project.id}` }, changed)
      .subscribe(state => { setOnline(state === 'SUBSCRIBED'); if (state === 'SUBSCRIBED') refresh(); });
    const focus = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', focus);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', focus); void supabase.removeChannel(channel); };
  }, [project.id, refresh]);
  const shown = useMemo(() => tasks.filter(t => t.archived === archived && (!mine || t.assignee_id === userId) && (!status || t.status === status) && (!priority || t.priority === priority) && `${t.title} ${t.description}`.toLowerCase().includes(search.toLowerCase())), [tasks, archived, mine, userId, status, priority, search]);
  const activeTasks = tasks.filter(t => !t.archived && !t.parent_id);
  const done = activeTasks.filter(t => t.status === 'DONE').length;
  const overdue = activeTasks.filter(t => t.status !== 'DONE' && t.due_date && t.due_date < today()).length;
  async function updateTask(id: string, patch: Partial<TaskDraft> & { archived?: boolean }) {
    const result = await checked(supabase.from('tf_tasks').update(patch).eq('id', id).eq('project_id', project.id).select().single());
    setTasks(old => old.map(task => task.id === id ? result : task)); refresh();
  }
  async function saveTask(draft: TaskDraft) {
    if (editor?.task) await updateTask(editor.task.id, draft);
    else {
      const { data, error } = await supabase.from('tf_tasks').insert({ ...draft, project_id: project.id, source_message_id: editor?.source?.id || null }).select().single();
      if (error) {
        if (error.code === '23505' && editor?.source) { const existing = await checked(supabase.from('tf_tasks').select('*').eq('source_message_id', editor.source.id).single()); setEditor({ task: existing }); refresh(); return; }
        throw error;
      }
      setTasks(old => [...old.filter(t => t.id !== data.id), data]); refresh();
    }
    setEditor(null);
  }
  const openTask = (task: Task) => setEditor({ task });
  const chat = <TeamChat messages={messages} tasks={tasks} members={members} userId={userId} connected={online} canLoadMore={messages.length >= messageLimit} onLoadMore={() => setMessageLimit(n => n + 100)} onSend={async content => { await checked(supabase.from('tf_messages').insert({ project_id: project.id, content })); refresh(); }} onCreate={source => setEditor({ source })} onOpen={openTask} />;
  return <section className="project-view">
    <header className="project-header"><div className="breadcrumb">{workspace.name}<span>/</span>{project.space_name || 'Equipe'}{project.folder_name && <><span>/</span>{project.folder_name}</>}</div><div className="project-heading"><div><h1>{project.name}</h1><p>{activeTasks.length} tarefas <span>·</span> {done} concluidas {overdue > 0 && <strong className="overdue">· {overdue} atrasadas</strong>}</p></div><button className="primary" onClick={() => setEditor({})}><Plus size={18} /><span>Nova tarefa</span></button></div></header>
    <div className="project-tabs" role="tablist" aria-label="Visualizacao">{([{ key: 'list', label: 'Lista', Icon: List }, { key: 'board', label: 'Quadro', Icon: Columns3 }, { key: 'calendar', label: 'Calendario', Icon: CalendarDays }, { key: 'chat', label: 'Chat', Icon: MessageSquare }] as const).map(({ key, label, Icon }) => <button key={key} role="tab" aria-selected={view === key} className={view === key ? 'selected' : ''} onClick={() => setView(key)}><Icon size={17} />{label}</button>)}<div className="sync-status"><span className={online ? 'live' : ''} />{online ? 'Conectado' : 'Reconectando'}<button className="icon-button" aria-label="Atualizar projeto" title="Atualizar projeto" onClick={refresh}><RefreshCw size={15} /></button></div></div>
    {error && <div className="error-banner" role="alert">{error}<button className="text-button" onClick={refresh}>Tentar novamente</button></div>}
    {view !== 'chat' && <div className="filter-bar"><label className="search-box"><Search size={17} /><input aria-label="Buscar tarefas" placeholder="Buscar tarefas" value={search} onChange={e => setSearch(e.target.value)} /></label><select aria-label="Filtrar status" value={status} onChange={e => setStatus(e.target.value)}><option value="">Todos os status</option>{Object.entries(statuses).map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select><select aria-label="Filtrar prioridade" value={priority} onChange={e => setPriority(e.target.value)}><option value="">Prioridades</option>{Object.entries(priorities).map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select><label className="check-filter"><input type="checkbox" checked={mine} onChange={e => setMine(e.target.checked)} />Minhas tarefas</label><button className={`icon-button ${archived ? 'selected' : ''}`} aria-pressed={archived} title="Tarefas arquivadas" aria-label="Tarefas arquivadas" onClick={() => setArchived(v => !v)}><Archive size={18} /></button></div>}
    <div className={`project-content ${view === 'chat' ? 'chat-only' : ''}`}>
      {loading ? <div className="empty-state"><RefreshCw className="spin" size={26} /><p>Carregando projeto...</p></div> : view === 'chat' ? chat : <><TasksBoard view={view} tasks={shown} members={members} comments={comments} onOpen={openTask} onMove={async (id, status) => { try { await updateTask(id, { status }); } catch (e) { setError(errorText(e)); } }} onAdd={() => setEditor({})} /><aside className="chat-aside">{chat}</aside></>}
    </div>
    {editor && <TaskEditor key={editor.task?.id || editor.source?.id || editor.parent?.id || 'new'} task={editor.task} source={editor.source || messages.find(m => m.id === editor.task?.source_message_id)} parent={editor.parent} tasks={tasks} comments={comments} members={members} onClose={() => setEditor(null)} onSave={saveTask} onArchive={editor.task ? async () => { await updateTask(editor.task!.id, { archived: !editor.task!.archived }); setEditor(null); } : undefined} onComment={async content => { await checked(supabase.from('tf_comments').insert({ task_id: editor.task!.id, project_id: project.id, content })); refresh(); }} onSubtask={task => setEditor({ parent: task })} onOpen={openTask} />}
  </section>;
}
