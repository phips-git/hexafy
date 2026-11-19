import type { Brand } from '@hexafy/core/domain';

import type { UserId } from '../../auth/models';
import type { ProjectId } from './project';
import type { TaskPriority } from './task-priority.enum';
import type { TaskStatus } from './task-status.enum';

export type { UserId };

export type TaskId = Brand<string, 'TaskId'>;

export interface Task {
  readonly id: TaskId;
  readonly projectId: ProjectId;
  readonly title: string;
  readonly description: string | null;
  readonly priority: TaskPriority;
  readonly status: TaskStatus;
  readonly assignedTo: UserId | null;
  readonly dueDate: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface TaskListItem {
  readonly id: TaskId;
  readonly projectId: ProjectId;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly createdAt: Date;
}

export type TaskCreationProperties = Pick<
  Task,
  'projectId' | 'title' | 'description' | 'priority' | 'assignedTo' | 'dueDate'
> & {
  projectId: Brand<string, 'ProjectId'>;
  assignedTo: Brand<string, 'UserId'> | null;
};

export type TaskUpdateProperties = Partial<
  Pick<
    Task,
    'title' | 'description' | 'status' | 'priority' | 'assignedTo' | 'dueDate'
  >
> & {
  assignedTo?: Brand<string, 'UserId'> | null;
};

// External input types for HTTP handlers (unbranded)
export type CreateTaskInput = {
  projectId: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  assignedTo: string | null;
  dueDate: Date | null;
};

export type CompleteTaskInput = {
  taskId: string;
};

export type TaskListItemInput = Pick<
  TaskListItem,
  'id' | 'projectId' | 'status' | 'priority' | 'createdAt'
> & {
  id: string;
  projectId: string;
};
