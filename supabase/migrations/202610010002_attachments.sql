begin;

create table public.tf_attachments(
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tf_tasks(id) on delete cascade,
  author_id uuid not null references auth.users(id),
  file_name text not null,
  file_size bigint not null,
  mime_type text not null,
  url text not null,
  created_at timestamptz not null default now()
);

create index tf_attachments_task_id_idx on public.tf_attachments(task_id);

alter table public.tf_attachments enable row level security;

-- Read policy
create policy attachments_read on public.tf_attachments for select to authenticated using(
  taskflow_private.project_member((select project_id from public.tf_tasks where id = public.tf_attachments.task_id))
);

-- Insert policy
create policy attachments_insert on public.tf_attachments for insert to authenticated with check(
  taskflow_private.project_member((select project_id from public.tf_tasks where id = public.tf_attachments.task_id))
  and author_id = (select auth.uid())
);

-- Delete policy
create policy attachments_delete on public.tf_attachments for delete to authenticated using(
  author_id = (select auth.uid()) or taskflow_private.owner_of((select p.workspace_id from public.tf_projects p join public.tf_tasks t on t.project_id=p.id where t.id=public.tf_attachments.task_id))
);

revoke all on public.tf_attachments from anon;
revoke all on public.tf_attachments from authenticated;
grant select, insert, delete on public.tf_attachments to authenticated;

-- Add a storage bucket for media (max 50MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tf-media', 'tf-media', true, 52428800, null) on conflict (id) do nothing;

create policy media_insert on storage.objects for insert to authenticated with check(
  bucket_id = 'tf-media' and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy media_delete on storage.objects for delete to authenticated using(
  bucket_id = 'tf-media' and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy media_read on storage.objects for select to public using(
  bucket_id = 'tf-media'
);

notify pgrst, 'reload schema';
commit;
