begin;

create table public.tf_notifications(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.tf_profiles(id) on delete cascade,
  actor_id uuid references public.tf_profiles(id) on delete set null,
  task_id uuid not null references public.tf_tasks(id) on delete cascade,
  project_id uuid not null references public.tf_projects(id) on delete cascade,
  type text not null, -- 'ASSIGN', 'COMMENT', 'STATUS'
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index tf_notifications_user_id_idx on public.tf_notifications(user_id);

alter table public.tf_notifications enable row level security;

-- Users can only read and update their own notifications
create policy notifications_read on public.tf_notifications for select to authenticated using(user_id = (select auth.uid()));
create policy notifications_update on public.tf_notifications for update to authenticated using(user_id = (select auth.uid())) with check(user_id = (select auth.uid()));

grant select, update(read) on public.tf_notifications to authenticated;

-- Trigger to notify on new comments
create or replace function taskflow_private.notify_comment() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  t_assignee uuid;
begin
  select assignee_id into t_assignee from public.tf_tasks where id = new.task_id;
  
  -- Notify assignee if the comment author is not the assignee
  if t_assignee is not null and t_assignee != new.author_id then
    insert into public.tf_notifications(user_id, actor_id, task_id, project_id, type)
    values (t_assignee, new.author_id, new.task_id, new.project_id, 'COMMENT');
  end if;
  
  return new;
end $$;

create trigger tf_notify_comment_trigger after insert on public.tf_comments for each row execute function taskflow_private.notify_comment();

-- Trigger to notify on task assignment or status change
create or replace function taskflow_private.notify_task_update() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  -- Notify new assignee
  if new.assignee_id is not null and (old.assignee_id is null or new.assignee_id != old.assignee_id) and new.assignee_id != (select auth.uid()) then
    insert into public.tf_notifications(user_id, actor_id, task_id, project_id, type)
    values (new.assignee_id, (select auth.uid()), new.id, new.project_id, 'ASSIGN');
  end if;
  
  -- Notify assignee on status change if changed by someone else
  if new.status != old.status and new.assignee_id is not null and new.assignee_id != (select auth.uid()) then
    insert into public.tf_notifications(user_id, actor_id, task_id, project_id, type)
    values (new.assignee_id, (select auth.uid()), new.id, new.project_id, 'STATUS');
  end if;
  
  return new;
end $$;

create trigger tf_notify_task_update_trigger after update on public.tf_tasks for each row execute function taskflow_private.notify_task_update();

notify pgrst, 'reload schema';
commit;
