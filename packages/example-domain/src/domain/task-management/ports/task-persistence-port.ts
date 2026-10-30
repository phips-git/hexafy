import type {
  Task,
  TaskCreationProperties,
  TaskUpdateProperties
} from '../models';

export interface TaskPort {
  findById(id: string): Promise<Task | null>;
  findByProjectId(projectId: string): Promise<Task[]>;
  findByAssignee(assigneeId: string): Promise<Task[]>;
  create(data: TaskCreationProperties): Promise<Task>;
  update(id: string, data: TaskUpdateProperties): Promise<Task>;
  delete(id: string): Promise<void>;
}
