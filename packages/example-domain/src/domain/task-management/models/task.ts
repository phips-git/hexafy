import type { Brand } from '@hexafy/core/brand';

import type { UserId } from '../../auth/models';
import type { ProjectId } from './project';
import type { TaskPriority } from './task-priority.enum';
import type { TaskStatus } from './task-status.enum';

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
  'title' | 'description' | 'priority' | 'assignedTo' | 'dueDate'
>;
export type ValidTaskCreationProperties = Brand<
  TaskCreationProperties,
  'ValidTaskCreationProperties'
>;

export interface TaskUpdateProperties extends Partial<
  Pick<
    Task,
    'title' | 'description' | 'status' | 'priority' | 'assignedTo' | 'dueDate'
  >
> {}
export type ValidTaskUpdateProperties = Brand<
  TaskUpdateProperties,
  'ValidTaskUpdateProperties'
>;
