import type { ProjectId, TaskStatus } from '../models';

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  averageCompletionTime?: number;
}

export interface ProjectStatsPort {
  getStats(projectId: ProjectId): Promise<ProjectStats>;
  getStatsByStatus(projectId: ProjectId, status: TaskStatus): Promise<number>;
}
