begin;

create table public.tf_time_entries(
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tf_tasks(id) on delete cascade,
  user_id uuid not null references public.tf_profiles(id) on delete cascade,
  start_time timestamptz not null default now(),
  end_time timestamptz,
  duration integer -- stored in seconds, populated when stopped
);

create index tf_time_entries_task_id_idx on public.tf_time_entries(task_id);
create index tf_time_entries_user_id_idx on public.tf_time_entries(user_id);

alter table public.tf_time_entries enable row level security;

-- Read policy: can read if they can read the task
create policy time_entries_read on public.tf_time_entries for select to authenticated using(
  taskflow_private.project_member((select project_id from public.tf_tasks where id = public.tf_time_entries.task_id))
);

-- Insert policy: can insert if they can read the task
create policy time_entries_insert on public.tf_time_entries for insert to authenticated with check(
  user_id = (select auth.uid()) and
  taskflow_private.project_member((select project_id from public.tf_tasks where id = public.tf_time_entries.task_id))
);

-- Update policy: can update their own entries (to stop the timer)
create policy time_entries_update on public.tf_time_entries for update to authenticated using(
  user_id = (select auth.uid())
) with check (
  user_id = (select auth.uid())
);

-- Delete policy: author or workspace owner
create policy time_entries_delete on public.tf_time_entries for delete to authenticated using(
  user_id = (select auth.uid()) or taskflow_private.owner_of((select p.workspace_id from public.tf_projects p join public.tf_tasks t on t.project_id=p.id where t.id=public.tf_time_entries.task_id))
);

grant select, insert, update, delete on public.tf_time_entries to authenticated;

notify pgrst, 'reload schema';
commit;
