export type TaskStatus = 'EN COURS' | 'À FAIRE';

export interface Task {
  id: string;
  name: string;
  assignee?: string;
  dueDate?: string;
  priority?: string;
  status: TaskStatus;
  commentsCount: number;
}

export const initialTasks: Task[] = [
  { id: '1', name: 'Tâche 1', status: 'EN COURS', commentsCount: 0 },
  { id: '2', name: 'Tâche 2', status: 'À FAIRE', commentsCount: 0 },
  { id: '3', name: 'Tâche 3', status: 'À FAIRE', commentsCount: 0 },
];