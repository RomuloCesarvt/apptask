begin;
alter table public.tf_projects
  add column space_name text not null default 'Equipe' check(length(trim(space_name)) between 1 and 100),
  add column folder_name text not null default '' check(length(folder_name)<=100);
notify pgrst,'reload schema';
commit;
