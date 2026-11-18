import type {
  Project,
  ProjectCreationProperties
} from '../../domain/task-management/models/project';

export interface ProjectPort {
  findById(id: string): Promise<Project | null>;
  findByOwnerId(ownerId: string): Promise<Project[]>;
  create(data: ProjectCreationProperties): Promise<Project>;
  update(
    id: string,
    data: Partial<ProjectCreationProperties>
  ): Promise<Project>;
  delete(id: string): Promise<void>;
}
