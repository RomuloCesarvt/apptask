begin;
create schema if not exists taskflow_private;
revoke all on schema taskflow_private from public;
grant usage on schema taskflow_private to authenticated;

create table public.tf_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(display_name) between 1 and 160)
);
create table public.tf_workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 100),
  owner_id uuid not null references public.tf_profiles(id),
  created_at timestamptz not null default now()
);
create table public.tf_members (
  workspace_id uuid references public.tf_workspaces(id) on delete cascade,
  user_id uuid references public.tf_profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  primary key (workspace_id,user_id)
);
create table public.tf_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.tf_workspaces(id) on delete cascade,
  email text not null check (email = lower(trim(email)) and email like '%@%'),
  created_at timestamptz not null default now(),
  unique(workspace_id,email)
);
create table public.tf_projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.tf_workspaces(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 100),
  created_at timestamptz not null default now()
);
create table public.tf_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.tf_projects(id) on delete cascade,
  author_id uuid not null default auth.uid() references public.tf_profiles(id),
  content text not null check (length(trim(content)) between 1 and 8000),
  created_at timestamptz not null default now(),
  unique(id,project_id)
);
create table public.tf_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.tf_projects(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 240),
  description text not null default '' check (length(description) <= 20000),
  status text not null default 'TODO' check (status in ('TODO','IN_PROGRESS','REVIEW','DONE')),
  priority text not null default 'MEDIUM' check (priority in ('LOW','MEDIUM','HIGH','URGENT')),
  assignee_id uuid references public.tf_profiles(id),
  due_date date,
  parent_id uuid,
  source_message_id uuid unique,
  created_by uuid not null default auth.uid() references public.tf_profiles(id),
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(id,project_id),
  foreign key (source_message_id,project_id) references public.tf_messages(id,project_id),
  foreign key (parent_id,project_id) references public.tf_tasks(id,project_id),
  check (parent_id is distinct from id)
);
create table public.tf_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null,
  project_id uuid not null,
  author_id uuid not null default auth.uid() references public.tf_profiles(id),
  content text not null check (length(trim(content)) between 1 and 8000),
  created_at timestamptz not null default now(),
  foreign key(task_id,project_id) references public.tf_tasks(id,project_id) on delete cascade
);
create index on public.tf_members(user_id);
create index on public.tf_projects(workspace_id);
create index on public.tf_invites(email);
create index on public.tf_tasks(project_id,created_at);
create index on public.tf_tasks(parent_id);
create index on public.tf_messages(project_id,created_at);
create index on public.tf_comments(project_id,created_at);

create function taskflow_private.sync_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.tf_profiles(id,display_name)
  values (new.id,left(coalesce(nullif(new.raw_user_meta_data->>'full_name',''),nullif(new.raw_user_meta_data->>'name',''),split_part(new.email,'@',1),'Membro'),160))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger tf_profile_created after insert on auth.users for each row execute function taskflow_private.sync_profile();
insert into public.tf_profiles(id,display_name)
select id,left(coalesce(nullif(raw_user_meta_data->>'full_name',''),nullif(raw_user_meta_data->>'name',''),split_part(email,'@',1),'Membro'),160) from auth.users
on conflict(id) do nothing;

create function taskflow_private.member_of(w uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.tf_members where workspace_id=w and user_id=(select auth.uid()))
$$;
create function taskflow_private.owner_of(w uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.tf_workspaces where id=w and owner_id=(select auth.uid()))
$$;
create function taskflow_private.project_member(p uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.tf_projects where id=p and taskflow_private.member_of(workspace_id))
$$;
create function taskflow_private.shared_profile(u uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select u=(select auth.uid()) or exists(select 1 from public.tf_members a join public.tf_members b using(workspace_id) where a.user_id=(select auth.uid()) and b.user_id=u)
$$;

alter table public.tf_profiles enable row level security;
alter table public.tf_workspaces enable row level security;
alter table public.tf_members enable row level security;
alter table public.tf_invites enable row level security;
alter table public.tf_projects enable row level security;
alter table public.tf_tasks enable row level security;
alter table public.tf_messages enable row level security;
alter table public.tf_comments enable row level security;
create policy profiles_read on public.tf_profiles for select to authenticated using(taskflow_private.shared_profile(id));
create policy workspaces_read on public.tf_workspaces for select to authenticated using(taskflow_private.member_of(id));
create policy members_read on public.tf_members for select to authenticated using(taskflow_private.member_of(workspace_id));
create policy invites_read on public.tf_invites for select to authenticated using(taskflow_private.owner_of(workspace_id));
create policy invites_create on public.tf_invites for insert to authenticated with check(taskflow_private.owner_of(workspace_id));
create policy projects_read on public.tf_projects for select to authenticated using(taskflow_private.member_of(workspace_id));
create policy projects_create on public.tf_projects for insert to authenticated with check(taskflow_private.member_of(workspace_id));
create policy tasks_read on public.tf_tasks for select to authenticated using(taskflow_private.project_member(project_id));
create policy tasks_create on public.tf_tasks for insert to authenticated with check(taskflow_private.project_member(project_id) and created_by=(select auth.uid()));
create policy tasks_update on public.tf_tasks for update to authenticated using(taskflow_private.project_member(project_id)) with check(taskflow_private.project_member(project_id));
create policy messages_read on public.tf_messages for select to authenticated using(taskflow_private.project_member(project_id));
create policy messages_create on public.tf_messages for insert to authenticated with check(taskflow_private.project_member(project_id) and author_id=(select auth.uid()));
create policy comments_read on public.tf_comments for select to authenticated using(taskflow_private.project_member(project_id));
create policy comments_create on public.tf_comments for insert to authenticated with check(taskflow_private.project_member(project_id) and author_id=(select auth.uid()));

create function taskflow_private.validate_task() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
 if tg_op='UPDATE' and (new.project_id<>old.project_id or new.created_by<>old.created_by or new.created_at<>old.created_at or new.source_message_id is distinct from old.source_message_id) then
  raise exception 'A origem da tarefa nao pode ser alterada.';
 end if;
 if new.assignee_id is not null and not exists(select 1 from public.tf_members m join public.tf_projects p on p.workspace_id=m.workspace_id where p.id=new.project_id and m.user_id=new.assignee_id) then
  raise exception 'O responsavel precisa pertencer a equipe.';
 end if;
 if new.parent_id is not null and (exists(select 1 from public.tf_tasks where id=new.parent_id and parent_id is not null) or exists(select 1 from public.tf_tasks where parent_id=new.id)) then
  raise exception 'Subtarefas permitem apenas um nivel.';
 end if;
 new.updated_at=now();
 return new;
end $$;
create trigger tf_task_validate before insert or update on public.tf_tasks for each row execute function taskflow_private.validate_task();

create function public.tf_create_workspace(workspace_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare w uuid;
begin
 if auth.uid() is null then raise exception 'Entre na sua conta.'; end if;
 insert into public.tf_workspaces(name,owner_id) values(trim(workspace_name),auth.uid()) returning id into w;
 insert into public.tf_members(workspace_id,user_id,role) values(w,auth.uid(),'owner');
 insert into public.tf_projects(workspace_id,name) values(w,'Geral');
 return w;
end $$;
create function public.tf_accept_invites() returns void
language plpgsql security definer set search_path = '' as $$
declare user_email text;
begin
 select lower(email) into user_email from auth.users where id=auth.uid() and email_confirmed_at is not null;
 if user_email is null then return; end if;
 insert into public.tf_members(workspace_id,user_id)
 select workspace_id,auth.uid() from public.tf_invites where email=user_email on conflict do nothing;
 delete from public.tf_invites where email=user_email;
end $$;

revoke all on public.tf_profiles,public.tf_workspaces,public.tf_members,public.tf_invites,public.tf_projects,public.tf_tasks,public.tf_messages,public.tf_comments from anon;
revoke all on public.tf_profiles,public.tf_workspaces,public.tf_members,public.tf_invites,public.tf_projects,public.tf_tasks,public.tf_messages,public.tf_comments from authenticated;
grant select on public.tf_profiles,public.tf_workspaces,public.tf_members,public.tf_invites,public.tf_projects,public.tf_tasks,public.tf_messages,public.tf_comments to authenticated;
grant insert on public.tf_invites,public.tf_projects,public.tf_tasks,public.tf_messages,public.tf_comments to authenticated;
grant update(title,description,status,priority,assignee_id,due_date,parent_id,archived) on public.tf_tasks to authenticated;
revoke all on function public.tf_create_workspace(text),public.tf_accept_invites() from public,anon;
grant execute on function public.tf_create_workspace(text),public.tf_accept_invites() to authenticated;
revoke all on all functions in schema taskflow_private from public,anon;
grant execute on function taskflow_private.member_of(uuid),taskflow_private.owner_of(uuid),taskflow_private.project_member(uuid),taskflow_private.shared_profile(uuid) to authenticated;

alter publication supabase_realtime add table public.tf_tasks,public.tf_messages,public.tf_comments;
notify pgrst,'reload schema';
commit;
