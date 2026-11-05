export const TaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
