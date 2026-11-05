import type { TaskCreationProperties, TaskUpdateProperties } from '../models';
import { TaskPriority } from '../models/task-priority.enum';
import { TaskStatus } from '../models/task-status.enum';

export class TaskValidators {
  static validateCreation(data: TaskCreationProperties): void {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Title is required');
    }

    if (data.title.length > 200) {
      throw new Error('Title must be less than 200 characters');
    }

    if (data.description && data.description.length > 5000) {
      throw new Error('Description must be less than 5000 characters');
    }

    if (data.priority && !Object.values(TaskPriority).includes(data.priority)) {
      throw new Error('Invalid priority value');
    }
  }

  static validateUpdate(data: TaskUpdateProperties): void {
    if (data.title && data.title.length > 200) {
      throw new Error('Title must be less than 200 characters');
    }

    if (data.description && data.description.length > 5000) {
      throw new Error('Description must be less than 5000 characters');
    }

    if (data.priority && !Object.values(TaskPriority).includes(data.priority)) {
      throw new Error('Invalid priority value');
    }

    if (data.status && !Object.values(TaskStatus).includes(data.status)) {
      throw new Error('Invalid status value');
    }
  }
}
