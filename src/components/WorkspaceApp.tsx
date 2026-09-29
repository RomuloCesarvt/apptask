"use client";
import { startTransition, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCheck, Folder, Plus, Users, LogOut, RefreshCw, Menu, X, Home, ListTodo, MessageSquare, Search, Layers, List } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { checked, errorText, initials, loadTasks, type Task, type Workspace, type Project, type Member } from '@/lib/taskflow';
import Dialog from './Dialog';
import ProjectView from './ProjectView';
import WorkspaceOverview from './WorkspaceOverview';

export default function WorkspaceApp() {
  const router = useRouter();
  const [user, setUser] = useState({ id: '', name: '' });
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<'workspace' | 'project' | 'space' | 'team' | 'search' | null>(null);
  const [section, setSection] = useState<'project' | 'home' | 'mine' | 'chat'>('project');
  const [taskId, setTaskId] = useState<string>();
  const [mobileNav, setMobileNav] = useState(false);
  const [revision, setRevision] = useState(0);
  const workspace = workspaces.find(w => w.id === workspaceId);
  const project = projects.find(p => p.id === projectId);
  const refresh = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      setError('');
      if (error) throw error;
      if (!data.user) { router.replace('/'); return; }
      setUser({ id: data.user.id, name: data.user.user_metadata.full_name || data.user.email || 'Minha conta' });
      await checked(supabase.rpc('tf_accept_invites'));
      const rows = await checked(supabase.from('tf_workspaces').select('*').order('created_at'));
      setWorkspaces(rows);
      setWorkspaceId(previous => rows.some(w => w.id === previous) ? previous : rows.find(w => w.id === localStorage.getItem(`tf-workspace:${data.user!.id}`))?.id || rows[0]?.id || '');
      setRevision(value => value + 1);
    } catch (error) { setError(errorText(error)); }
    finally { setLoading(false); }
  }, [router]);
  useEffect(() => { startTransition(() => { void refresh(); }); }, [refresh]);
  useEffect(() => {
    if (!workspaceId) return;
    let active = true;
    async function load() {
      setWorkspaceLoading(true);
      try {
        const [ps, ms] = await Promise.all([
          checked(supabase.from('tf_projects').select('*').eq('workspace_id', workspaceId).order('created_at')),
          checked(supabase.from('tf_members').select('user_id,role,tf_profiles(id,display_name)').eq('workspace_id', workspaceId)),
        ]);
        if (!active) return;
        setProjects(ps); setMembers(ms as unknown as Member[]);
        setProjectId(previous => ps.some(p => p.id === previous) ? previous : ps[0]?.id || '');
      } catch (error) { if (active) setError(errorText(error)); }
      finally { if (active) setWorkspaceLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [workspaceId, revision]);
  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) setError(errorText(error)); else router.replace('/');
  }
  function selectProject(id: string, targetTaskId?: string) {
    setProjectId(id); setTaskId(targetTaskId); setSection('project'); setMobileNav(false);
  }
  function switchSection(next: typeof section) { setSection(next); setTaskId(undefined); setMobileNav(false); }
  const spaces = [...new Set(projects.map(p => p.space_name || 'Equipe'))];
  const listButton = (p: Project) => <button key={p.id} className={p.id === projectId && (section === 'project' || section === 'chat') ? 'active' : ''} onClick={() => selectProject(p.id)}><List size={15} /><span>{p.name}</span></button>;
  return <div className="tf-app">
    <div className="global-rail"><span className="rail-logo"><CheckCheck size={25} /></span><button className={section === 'home' ? 'active' : ''} title="Inicio" aria-label="Inicio" onClick={() => switchSection('home')}><Home size={20} /><small>Inicio</small></button><button className={section === 'project' ? 'active' : ''} title="Espacos" aria-label="Espacos" onClick={() => switchSection('project')}><Layers size={20} /><small>Espacos</small></button><button className={section === 'chat' ? 'active' : ''} title="Chat" aria-label="Chat da equipe" onClick={() => switchSection('chat')}><MessageSquare size={20} /><small>Chat</small></button><button title="Equipe" aria-label="Membros da equipe" disabled={!workspace} onClick={() => setModal('team')}><Users size={20} /><small>Equipe</small></button></div>
    <button className="mobile-menu icon-button" title="Abrir menu" aria-label="Abrir menu" onClick={() => setMobileNav(true)}><Menu size={22} /></button>
    {mobileNav && <button className="nav-backdrop" aria-label="Fechar menu" onClick={() => setMobileNav(false)} />}
    <aside className={`tf-sidebar ${mobileNav ? 'is-open' : ''}`}>
      <div className="brand"><CheckCheck size={26} /><strong>TaskFlow<span>Equipe</span></strong><button className="icon-button mobile-close" aria-label="Fechar menu" onClick={() => setMobileNav(false)}><X size={20} /></button></div>
      <label className="workspace-picker"><span>WORKSPACE</span><select aria-label="Workspace" value={workspaceId} onChange={e => { setProjects([]); setMembers([]); setProjectId(''); setTaskId(undefined); setWorkspaceId(e.target.value); localStorage.setItem(`tf-workspace:${user.id}`, e.target.value); }}>{!workspaces.length && <option value="">Sua equipe</option>}{workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
      <button className="nav-action" onClick={() => setModal('workspace')}><Plus size={16} /> Novo workspace</button>
      <div className="main-links"><button className={`nav-action ${section === 'home' ? 'active' : ''}`} onClick={() => switchSection('home')}><Home size={17} />Visao geral</button><button className={`nav-action ${section === 'mine' ? 'active' : ''}`} onClick={() => switchSection('mine')}><ListTodo size={17} />Minhas tarefas</button><button className={`nav-action ${section === 'chat' ? 'active' : ''}`} onClick={() => switchSection('chat')}><MessageSquare size={17} />Chat da equipe</button></div>
      <div className="sidebar-section"><span>ESPACOS</span><button className="icon-button" aria-label="Nova lista" title="Nova lista" disabled={!workspaceId} onClick={() => setModal('project')}><Plus size={18} /></button></div>
      <nav aria-label="Espacos e listas">{spaces.map((space, index) => <details className="space-group" open key={space}><summary><span className={`space-icon color-${index % 4}`}>{space.slice(0, 1).toUpperCase()}</span><span>{space}</span></summary>{projects.filter(p => (p.space_name || 'Equipe') === space && !p.folder_name).map(listButton)}{[...new Set(projects.filter(p => (p.space_name || 'Equipe') === space && p.folder_name).map(p => p.folder_name))].map(folder => <details open className="folder-group" key={folder}><summary><Folder size={15} /><span>{folder}</span></summary>{projects.filter(p => (p.space_name || 'Equipe') === space && p.folder_name === folder).map(listButton)}</details>)}</details>)}<button className="nav-action" disabled={!workspaceId} onClick={() => setModal('space')}><Plus size={16} />Novo espaco</button></nav>
      <div className="sidebar-bottom"><button className="nav-action" disabled={!workspace} onClick={() => setModal('team')}><Users size={17} /> Equipe <span className="count">{members.length}</span></button><button className="nav-action" onClick={refresh}><RefreshCw size={16} /> Atualizar equipes</button><div className="account"><span className="avatar">{initials(user.name || 'Conta')}</span><span>{user.name}</span><button className="icon-button" title="Sair" aria-label="Sair" onClick={logout}><LogOut size={17} /></button></div></div>
    </aside>
    <main className="tf-main">
      <div className="global-topbar"><span>{workspace?.name || 'TaskFlow'}</span><button className="global-search" onClick={() => setModal('search')} disabled={!workspace}><Search size={15} />Pesquisar no workspace</button><span className="avatar small">{initials(user.name || 'Conta')}</span></div>
      {error && <div className="error-banner" role="alert">{error}<button className="text-button" onClick={refresh}>Tentar novamente</button></div>}
      {loading || workspaceLoading ? <div className="empty-state"><RefreshCw className="spin" size={28} /><h2>Carregando sua equipe...</h2></div> : workspace && (section === 'home' || section === 'mine') ? <WorkspaceOverview key={`${workspaceId}:${section}`} projects={projects} userId={user.id} mine={section === 'mine'} onOpen={selectProject} /> : project && workspace ? <ProjectView key={`${project.id}:${section}:${taskId || ''}`} project={project} workspace={workspace} members={members} userId={user.id} initialView={section === 'chat' ? 'chat' : 'list'} initialTaskId={taskId} /> : <div className="empty-state"><CheckCheck size={48} /><h1>{workspaces.length ? 'Crie sua primeira lista' : 'Seu trabalho, em equipe'}</h1><button className="primary" disabled={!!error} onClick={() => setModal(workspaceId ? 'project' : 'workspace')}><Plus size={18} />{workspaceId ? 'Criar lista' : 'Criar workspace'}</button></div>}
    </main>
    {(modal === 'workspace' || modal === 'project' || modal === 'space') && <NameDialog kind={modal} spaces={spaces} onClose={() => setModal(null)} onSave={async (name, space, folder) => {
      if (modal === 'workspace') { const id = await checked(supabase.rpc('tf_create_workspace', { workspace_name: name })); await refresh(); setWorkspaceId(id); localStorage.setItem(`tf-workspace:${user.id}`, id); setSection('project'); }
      else { const p = await checked<Project>(supabase.from('tf_projects').insert({ workspace_id: workspaceId, name: modal === 'space' ? 'Geral' : name, space_name: modal === 'space' ? name : space, folder_name: modal === 'space' ? '' : folder }).select().single()); setProjects(previous => [...previous, p]); selectProject(p.id); }
      setModal(null);
    }} />}
    {modal === 'team' && workspace && <TeamDialog workspace={workspace} members={members} userId={user.id} onClose={() => { setModal(null); void refresh(); }} />}
    {modal === 'search' && <SearchDialog projects={projects} onClose={() => setModal(null)} onOpen={(project, task) => { setModal(null); selectProject(project, task); }} />}
  </div>;
}

function NameDialog({ kind, spaces, onClose, onSave }: { kind: string; spaces: string[]; onClose: () => void; onSave: (name: string, space: string, folder: string) => Promise<void> }) {
  const [name, setName] = useState(''); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const [space, setSpace] = useState(spaces[0] || 'Equipe'); const [folder, setFolder] = useState('');
  return <Dialog title={kind === 'workspace' ? 'Novo workspace' : kind === 'space' ? 'Novo espaco' : 'Nova lista'} onClose={onClose}><form className="dialog-body" onSubmit={async e => { e.preventDefault(); if (!name.trim() || saving || !space.trim()) return; setSaving(true); try { await onSave(name.trim(), space.trim(), folder.trim()); } catch (error) { setError(errorText(error)); } finally { setSaving(false); } }}>
    <label>Nome<input autoFocus required maxLength={100} value={name} onChange={e => setName(e.target.value)} placeholder={kind === 'workspace' ? 'Nome da sua equipe' : kind === 'space' ? 'Ex.: Marketing' : 'Ex.: Campanhas'} /></label>
    {kind === 'project' && <><label>Espaco<input required maxLength={100} list="workspace-spaces" value={space} onChange={e => setSpace(e.target.value)} /></label><datalist id="workspace-spaces">{spaces.map(s => <option key={s} value={s} />)}</datalist><label>Pasta (opcional)<input maxLength={100} value={folder} onChange={e => setFolder(e.target.value)} placeholder="Ex.: Lancamentos" /></label></>}
    {error && <p role="alert" className="error-text">{error}</p>}<footer><button className="secondary" type="button" onClick={onClose}>Cancelar</button><button className="primary" disabled={saving || !name.trim()}>{saving ? 'Criando...' : 'Criar'}</button></footer>
  </form></Dialog>;
}

function SearchDialog({ projects, onClose, onOpen }: { projects: Project[]; onClose: () => void; onOpen: (projectId: string, taskId: string) => void }) {
  const [query, setQuery] = useState(''); const [tasks, setTasks] = useState<Task[]>([]); const [error, setError] = useState('');
  useEffect(() => { let active = true; void Promise.all(projects.map(p => loadTasks(p.id))).then(rows => { if (active) setTasks(rows.flat()); }).catch(e => { if (active) setError(errorText(e)); }); return () => { active = false; }; }, [projects]);
  const results = tasks.filter(t => !t.archived && `${t.title} ${t.description}`.toLowerCase().includes(query.toLowerCase())).slice(0, 50);
  return <Dialog title="Pesquisar no workspace" onClose={onClose}><div className="dialog-body"><input autoFocus aria-label="Pesquisar no workspace" placeholder="Nome ou descricao da tarefa" value={query} onChange={e => setQuery(e.target.value)} />{error && <p role="alert" className="error-text">{error}</p>}<div className="search-results">{results.map(task => <button key={task.id} onClick={() => onOpen(task.project_id, task.id)}><span className={`status-dot ${task.status}`} /><span>{task.title}<small>{projects.find(p => p.id === task.project_id)?.name}</small></span></button>)}{!results.length && <p>Nenhuma tarefa encontrada.</p>}</div></div></Dialog>;
}

function TeamDialog({ workspace, members, userId, onClose }: { workspace: Workspace; members: Member[]; userId: string; onClose: () => void }) {
  const [email, setEmail] = useState(''); const [notice, setNotice] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [invites, setInvites] = useState<{ id: string; email: string }[]>([]);
  const owner = workspace.owner_id === userId;
  useEffect(() => { if (owner) void checked(supabase.from('tf_invites').select('id,email').eq('workspace_id', workspace.id)).then(setInvites).catch(e => setError(errorText(e))); }, [owner, workspace.id]);
  return <Dialog title={`Equipe · ${workspace.name}`} onClose={onClose}><div className="dialog-body">
    <ul className="member-list">{members.map(m => <li key={m.user_id}><span className="avatar">{initials(m.tf_profiles.display_name)}</span><span>{m.tf_profiles.display_name}</span><small>{m.role === 'owner' ? 'Administrador' : 'Membro'}</small></li>)}</ul>
    {owner && <form onSubmit={async e => { e.preventDefault(); setBusy(true); setError(''); setNotice(''); try { const row = await checked(supabase.from('tf_invites').insert({ workspace_id: workspace.id, email: email.trim().toLowerCase() }).select('id,email').single()); setInvites(old => [...old, row]); setEmail(''); setNotice('Acesso reservado. A pessoa entra na equipe ao acessar o TaskFlow com esse email confirmado. Nenhum email foi enviado.'); } catch (e) { setError(errorText(e)); } finally { setBusy(false); } }}>
      <label>Adicionar por email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="pessoa@empresa.com" /></label><button disabled={busy} className="primary"><Plus size={16} />Adicionar membro</button>
    </form>}
    {notice && <p role="status" className="notice">{notice}</p>}{error && <p role="alert" className="error-text">{error}</p>}
    {!!invites.length && <div><h3>Aguardando primeiro acesso</h3>{invites.map(i => <p className="pending-invite" key={i.id}>{i.email}</p>)}</div>}
    <button className="secondary" onClick={async () => { try { await navigator.clipboard.writeText(window.location.origin); setNotice('Link do app copiado.'); } catch { setError('Nao foi possivel copiar o link.'); } }}>Copiar link do app</button>
  </div></Dialog>;
}
