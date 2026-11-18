import type {
  Task,
  TaskCreationProperties,
  TaskUpdateProperties
} from '../../domain/task-management/models/task';

export interface TaskPort {
  findById(id: string): Promise<Task | null>;
  findByProjectId(projectId: string): Promise<Task[]>;
  findByAssignee(assigneeId: string): Promise<Task[]>;
  create(data: TaskCreationProperties & { projectId: string }): Promise<Task>;
  update(id: string, data: TaskUpdateProperties): Promise<Task>;
  delete(id: string): Promise<void>;
}
