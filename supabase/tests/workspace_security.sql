-- Run as postgres in the Supabase SQL editor. All test data is rolled back.
begin;
select set_config('tf_test.owner',gen_random_uuid()::text,true),
       set_config('tf_test.member',gen_random_uuid()::text,true),
       set_config('tf_test.outsider',gen_random_uuid()::text,true);
insert into auth.users(id,email,email_confirmed_at)
select current_setting('tf_test.'||kind)::uuid,kind||'-'||current_setting('tf_test.'||kind)||'@taskflow.invalid',now()
from unnest(array['owner','member','outsider']) kind;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('tf_test.owner'),true);
select set_config('tf_test.workspace',public.tf_create_workspace('TaskFlow transaction test')::text,true);
select set_config('tf_test.project',id::text,true) from public.tf_projects where workspace_id=current_setting('tf_test.workspace')::uuid;
insert into public.tf_invites(workspace_id,email) values(current_setting('tf_test.workspace')::uuid,'member-'||current_setting('tf_test.member')||'@taskflow.invalid');
select set_config('request.jwt.claim.sub',current_setting('tf_test.member'),true);
select public.tf_accept_invites();
do $$ begin
 if not exists(select 1 from public.tf_workspaces where id=current_setting('tf_test.workspace')::uuid) then raise exception 'FAIL: invited member cannot read workspace'; end if;
end $$;
with m as(insert into public.tf_messages(project_id,content) values(current_setting('tf_test.project')::uuid,'Verificar conversao em tarefa') returning id)
select set_config('tf_test.message',id::text,true) from m;
with t as(insert into public.tf_tasks(project_id,title,source_message_id,assignee_id)
values(current_setting('tf_test.project')::uuid,'Tarefa da conversa',current_setting('tf_test.message')::uuid,current_setting('tf_test.member')::uuid) returning id)
select set_config('tf_test.task',id::text,true) from t;
update public.tf_tasks set status='IN_PROGRESS',due_date=current_date where id=current_setting('tf_test.task')::uuid;
insert into public.tf_comments(project_id,task_id,content) values(current_setting('tf_test.project')::uuid,current_setting('tf_test.task')::uuid,'Comentario persistido');
do $$ begin
 begin
  insert into public.tf_tasks(project_id,title,source_message_id) values(current_setting('tf_test.project')::uuid,'Duplicada',current_setting('tf_test.message')::uuid);
  raise exception 'FAIL: duplicate message task allowed';
 exception when unique_violation then null; end;
 begin
  update public.tf_tasks set assignee_id=current_setting('tf_test.outsider')::uuid where id=current_setting('tf_test.task')::uuid;
  raise exception 'FAIL: outsider assignment allowed';
 exception when raise_exception then if sqlerrm='FAIL: outsider assignment allowed' then raise; end if; end;
 begin
  insert into public.tf_invites(workspace_id,email) values(current_setting('tf_test.workspace')::uuid,'unauthorized@taskflow.invalid');
  raise exception 'FAIL: member could invite';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('tf_test.outsider'),true);
do $$ begin
 if exists(select 1 from public.tf_tasks where id=current_setting('tf_test.task')::uuid) then raise exception 'FAIL: outsider read task'; end if;
 if exists(select 1 from public.tf_messages where id=current_setting('tf_test.message')::uuid) then raise exception 'FAIL: outsider read chat'; end if;
 if exists(select 1 from public.tf_profiles where id=current_setting('tf_test.member')::uuid) then raise exception 'FAIL: outsider read profile'; end if;
 begin
  insert into public.tf_messages(project_id,content) values(current_setting('tf_test.project')::uuid,'Unauthorized');
  raise exception 'FAIL: outsider wrote chat';
 exception when insufficient_privilege then null; end;
 update public.tf_tasks set status='DONE' where id=current_setting('tf_test.task')::uuid;
 if found then raise exception 'FAIL: outsider updated task'; end if;
end $$;
select set_config('request.jwt.claim.sub',current_setting('tf_test.owner'),true);
do $$ begin
 if not exists(select 1 from public.tf_tasks where id=current_setting('tf_test.task')::uuid and status='IN_PROGRESS') then raise exception 'FAIL: task state not preserved'; end if;
 if not exists(select 1 from public.tf_comments where task_id=current_setting('tf_test.task')::uuid) then raise exception 'FAIL: comment missing'; end if;
end $$;
select 'PASS: membership, chat, conversion, comments, task updates, duplicate prevention and outsider isolation' as verification;
rollback;
