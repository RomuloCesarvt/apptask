"use client";

import { useEffect, useMemo, useState } from 'react';
import { Bot, CheckCircle2, Circle, RefreshCw, Search, Send, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { checked, errorText, loadTasks, today, type Priority, type Project, type Task } from '@/lib/taskflow';

type Answer = { id: string; role: 'assistant' | 'user'; text: string; taskIds?: string[] };

export default function WorkspaceAI({
  workspaceId,
  userId,
  projects,
  onOpen,
}: {
  workspaceId: string;
  userId: string;
  projects: Project[];
  onOpen: (projectId: string, taskId: string) => void;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [prompt, setPrompt] = useState('');
  const [projectId, setProjectId] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([
    { id: 'welcome', role: 'assistant', text: 'Posso resumir o workspace, localizar atrasos e criar tarefas. Tudo roda sobre os dados reais, sem consumir creditos de IA.' },
  ]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    void Promise.all(projects.map(project => loadTasks(project.id)))
      .then(rows => { if (active) { setTasks(rows.flat().filter(task => !task.archived)); setError(''); } })
      .catch(caught => { if (active) setError(errorText(caught)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [projects, revision, workspaceId]);

  const rootTasks = useMemo(() => tasks.filter(task => !task.parent_id), [tasks]);
  const openTasks = rootTasks.filter(task => task.status !== 'DONE');
  const overdueTasks = openTasks.filter(task => task.due_date && task.due_date < today());
  const mine = openTasks.filter(task => task.assignee_id === userId);

  function addAnswer(answer: Omit<Answer, 'id'>) {
    setAnswers(current => [...current, { ...answer, id: crypto.randomUUID() }]);
  }

  async function run(rawPrompt = prompt) {
    const text = rawPrompt.trim();
    if (!text || busy) return;
    setPrompt('');
    setBusy(true);
    setError('');
    addAnswer({ role: 'user', text });
    try {
      const createMatch = text.match(/^(?:\/criar|criar (?:uma )?tarefa(?: chamada)?|nova tarefa)\s*[:\-]?\s*(.+)$/i);
      if (createMatch) {
        const targetProject = projects.find(project => project.id === projectId) || projects[0];
        if (!targetProject) throw new Error('Crie uma lista antes de adicionar tarefas.');
        let title = createMatch[1].trim();
        const priority: Priority = /urgente/i.test(title) ? 'URGENT' : /prioridade alta|alta prioridade/i.test(title) ? 'HIGH' : 'MEDIUM';
        const tomorrow = new Date(`${today()}T12:00:00`);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dueDate = /amanh[aã]/i.test(title)
          ? tomorrow.toLocaleDateString('en-CA')
          : /hoje/i.test(title) ? today() : null;
        title = title.replace(/\b(?:urgente|prioridade alta|alta prioridade|para hoje|hoje|para amanh[aã]|amanh[aã])\b/gi, '').replace(/\s{2,}/g, ' ').trim();
        if (!title) throw new Error('Informe o nome da tarefa depois de "criar tarefa".');
        const created = await checked<Task>(supabase.from('tf_tasks').insert({
          project_id: targetProject.id,
          title,
          description: `Criada pelo assistente local a partir de: ${text}`,
          status: 'TODO',
          priority,
          due_date: dueDate,
          assignee_id: null,
          parent_id: null,
        }).select().single());
        setTasks(current => [...current, created]);
        addAnswer({ role: 'assistant', text: `Tarefa "${created.title}" criada em ${targetProject.name}${dueDate ? ` com prazo ${dueDate === today() ? 'para hoje' : 'para amanha'}` : ''}.`, taskIds: [created.id] });
        return;
      }

      const normalized = text.toLowerCase();
      let matches: Task[] = [];
      let response = '';
      if (/atrasad/.test(normalized)) {
        matches = overdueTasks;
        response = matches.length ? `Encontrei ${matches.length} tarefa(s) atrasada(s).` : 'Nao ha tarefas atrasadas.';
      } else if (/\bhoje\b/.test(normalized)) {
        matches = openTasks.filter(task => task.due_date === today());
        response = matches.length ? `${matches.length} tarefa(s) vencem hoje.` : 'Nenhuma tarefa vence hoje.';
      } else if (/minha|atribu[ií]d/.test(normalized)) {
        matches = mine;
        response = matches.length ? `Voce tem ${matches.length} tarefa(s) em aberto.` : 'Nao ha tarefas em aberto atribuidas a voce.';
      } else if (/conclu[ií]d|finalizad/.test(normalized)) {
        matches = rootTasks.filter(task => task.status === 'DONE').slice(0, 20);
        response = `${rootTasks.filter(task => task.status === 'DONE').length} tarefa(s) estao concluidas.`;
      } else if (/urgente|prioridade/.test(normalized)) {
        matches = openTasks.filter(task => task.priority === 'URGENT' || task.priority === 'HIGH');
        response = matches.length ? `${matches.length} tarefa(s) exigem prioridade.` : 'Nao ha tarefas de prioridade alta ou urgente.';
      } else if (/buscar|pesquisar|encontrar|procure/.test(normalized)) {
        const term = normalized.replace(/.*?(buscar|pesquisar|encontrar|procure)(?: por)?\s*/i, '').trim();
        matches = rootTasks.filter(task => `${task.title} ${task.description}`.toLowerCase().includes(term)).slice(0, 20);
        response = matches.length ? `Encontrei ${matches.length} resultado(s) para "${term}".` : `Nao encontrei tarefas para "${term}".`;
      } else {
        matches = [...overdueTasks, ...openTasks.filter(task => task.priority === 'URGENT' && !overdueTasks.some(item => item.id === task.id))].slice(0, 10);
        response = `O workspace tem ${rootTasks.length} tarefas: ${openTasks.length} em aberto, ${rootTasks.length - openTasks.length} concluidas e ${overdueTasks.length} atrasadas.`;
      }
      addAnswer({ role: 'assistant', text: response, taskIds: matches.map(task => task.id) });
    } catch (caught) {
      const message = errorText(caught);
      setError(message);
      addAnswer({ role: 'assistant', text: `Nao consegui concluir: ${message}` });
    } finally {
      setBusy(false);
    }
  }

  const suggestions = ['Resuma o workspace', 'Quais tarefas estao atrasadas?', 'Mostre minhas tarefas', 'Criar tarefa Revisar planejamento para hoje'];

  return <section className="assistant-shell">
    <aside className="assistant-summary">
      <div className="assistant-title"><span><Bot size={19} /></span><div><h2>Assistente</h2><p>Local e gratuito</p></div></div>
      <div className="assistant-metrics"><div><strong>{openTasks.length}</strong><span>Em aberto</span></div><div><strong>{overdueTasks.length}</strong><span>Atrasadas</span></div><div><strong>{mine.length}</strong><span>Minhas</span></div></div>
      <label>Lista para novas tarefas<select value={projectId} onChange={event => setProjectId(event.target.value)}><option value="">Primeira lista disponivel</option>{projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
      <div className="assistant-help"><h3>Comandos disponiveis</h3><p><code>criar tarefa Nome para hoje</code></p><p><code>buscar termo</code></p><p>Pergunte por atrasadas, concluidas, prioridades ou minhas tarefas.</p></div>
      <button className="secondary" onClick={() => setRevision(value => value + 1)}><RefreshCw size={15} />Atualizar dados</button>
    </aside>

    <main className="assistant-main">
      <header><div><Sparkles size={20} /><span><h1>Assistente do workspace</h1><p>Consulta e cria tarefas usando o Supabase.</p></span></div><span className="free-badge">Sem creditos</span></header>
      <div className="assistant-conversation">
        {loading && <div className="assistant-loading"><RefreshCw className="spin" size={20} />Lendo tarefas...</div>}
        {answers.map(answer => <article className={`assistant-message ${answer.role}`} key={answer.id}>
          <span className="assistant-avatar">{answer.role === 'assistant' ? <Bot size={16} /> : 'EU'}</span>
          <div><p>{answer.text}</p>{answer.taskIds?.map(taskId => {
            const task = tasks.find(item => item.id === taskId);
            if (!task) return null;
            return <button className="assistant-task-result" key={task.id} onClick={() => onOpen(task.project_id, task.id)}>{task.status === 'DONE' ? <CheckCircle2 size={15} /> : <Circle size={15} />}<span>{task.title}<small>{projects.find(project => project.id === task.project_id)?.name}</small></span></button>;
          })}</div>
        </article>)}
      </div>
      <div className="assistant-suggestions">{suggestions.map(suggestion => <button key={suggestion} onClick={() => void run(suggestion)}>{suggestion}</button>)}</div>
      {error && <p className="error-text" role="alert">{error}</p>}
      <form className="assistant-compose" onSubmit={event => { event.preventDefault(); void run(); }}>
        <Search size={18} />
        <textarea rows={2} aria-label="Mensagem para o assistente" value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="Ex.: mostre as atrasadas ou criar tarefa Preparar relatorio para hoje" />
        <button className="primary icon-only" aria-label="Enviar" title="Enviar" disabled={!prompt.trim() || busy}><Send size={18} /></button>
      </form>
    </main>
  </section>;
}
