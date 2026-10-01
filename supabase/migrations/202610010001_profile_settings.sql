begin;

alter table public.tf_profiles add column avatar_url text;
grant update(display_name, avatar_url) on public.tf_profiles to authenticated;
create policy profiles_update_self on public.tf_profiles
  for update to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
create policy profiles_read_self on public.tf_profiles
  for select to authenticated using (id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tf-avatars', 'tf-avatars', true, 2097152, array['image/jpeg', 'image/gif', 'image/png']);

create policy avatars_insert_self on storage.objects
  for insert to authenticated with check (
    bucket_id = 'tf-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy avatars_delete_self on storage.objects
  for delete to authenticated using (
    bucket_id = 'tf-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy avatars_read_self on storage.objects
  for select to authenticated using (
    bucket_id = 'tf-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text
  );

notify pgrst, 'reload schema';
commit;
