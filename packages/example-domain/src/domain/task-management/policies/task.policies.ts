import type { Task, TaskStatus } from '../models';
import { TaskStatus as TaskStatusEnum } from '../models/task-status.enum';

export class TaskStatusPolicy {
  static canTransitionTo(
    currentStatus: TaskStatus,
    targetStatus: TaskStatus
  ): boolean {
    const transitions: Record<TaskStatus, TaskStatus[]> = {
      [TaskStatusEnum.PENDING]: [
        TaskStatusEnum.IN_PROGRESS,
        TaskStatusEnum.ARCHIVED
      ],
      [TaskStatusEnum.IN_PROGRESS]: [
        TaskStatusEnum.PENDING,
        TaskStatusEnum.COMPLETED,
        TaskStatusEnum.ARCHIVED
      ],
      [TaskStatusEnum.COMPLETED]: [
        TaskStatusEnum.PENDING,
        TaskStatusEnum.ARCHIVED
      ],
      [TaskStatusEnum.ARCHIVED]: [TaskStatusEnum.PENDING]
    };

    return transitions[currentStatus]?.includes(targetStatus) ?? false;
  }

  static validateTransition(task: Task, newStatus: TaskStatus): void {
    if (!this.canTransitionTo(task.status, newStatus)) {
      throw new Error(
        `Invalid status transition from ${task.status} to ${newStatus}`
      );
    }
  }
}
