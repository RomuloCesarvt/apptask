import { supabase } from './supabase';

export const statuses = { TODO: 'A fazer', IN_PROGRESS: 'Em andamento', REVIEW: 'Em revisao', DONE: 'Concluido' };
export const priorities = { LOW: 'Baixa', MEDIUM: 'Normal', HIGH: 'Alta', URGENT: 'Urgente' };
export type Status = keyof typeof statuses;
export type Priority = keyof typeof priorities;
export type Workspace = { id: string; name: string; owner_id: string };
export type Project = { id: string; workspace_id: string; name: string; space_name: string; folder_name: string };
export type Profile = { id: string; display_name: string };
export type Member = { user_id: string; role: string; tf_profiles: Profile };
export type Message = { id: string; project_id: string; author_id: string; content: string; created_at: string };
export type Comment = Message & { task_id: string };
export type Task = {
  id: string; project_id: string; title: string; description: string; status: Status;
  priority: Priority; assignee_id: string | null; due_date: string | null;
  parent_id: string | null; source_message_id: string | null; archived: boolean;
  created_by: string; created_at: string; updated_at: string;
};
export type TaskDraft = Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'assignee_id' | 'due_date' | 'parent_id'>;
export type Attachment = {
  id: string; task_id: string; author_id: string;
  file_name: string; file_size: number; mime_type: string; url: string;
  created_at: string;
};
export type Notification = {
  id: string; user_id: string; actor_id: string | null;
  task_id: string; project_id: string; type: 'ASSIGN' | 'COMMENT' | 'STATUS';
  read: boolean; created_at: string;
};
export function errorText(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String(error.message);
    if (/schema cache|does not exist/.test(message)) return 'O ambiente da equipe ainda nao esta disponivel. Tente novamente em alguns minutos.';
    if (/Failed to fetch|NetworkError/.test(message)) return 'Sem conexao. Confira sua internet e tente novamente.';
    return message;
  }
  return 'Nao foi possivel concluir. Tente novamente.';
}
export async function checked<T>(request: PromiseLike<{ data: T | null; error: unknown }>): Promise<NonNullable<T>> {
  const { data, error } = await request;
  if (error) throw error;
  return data!;
}
export async function loadTasks(projectId: string): Promise<Task[]> {
  const tasks: Task[] = [];
  for (let offset = 0; ; offset += 500) {
    const batch = await checked(supabase.from('tf_tasks').select('*').eq('project_id', projectId).order('created_at').order('id').range(offset, offset + 499));
    tasks.push(...batch);
    if (batch.length < 500) return tasks;
  }
}
export async function loadComments(projectId: string): Promise<Comment[]> {
  const comments: Comment[] = [];
  for (let offset = 0; ; offset += 500) {
    const batch = await checked(supabase.from('tf_comments').select('*').eq('project_id', projectId).order('created_at').order('id').range(offset, offset + 499));
    comments.push(...batch);
    if (batch.length < 500) return comments;
  }
}
export function displayDate(value: string | null) {
  return value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Sem prazo';
}
export function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
}
