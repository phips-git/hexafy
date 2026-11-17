export interface CreateTaskDto {
  title: string;
  description?: string | null;
  projectId: string;
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string | null;
  dueDate?: string | null;
}

export interface TaskResponse {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
}

export interface UpdateTaskDto {
  title?: string;
  status?: string;
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string | null;
  dueDate?: string | null;
}
