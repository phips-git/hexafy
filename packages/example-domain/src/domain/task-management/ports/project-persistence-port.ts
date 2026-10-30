import type { Project, ProjectCreationProperties } from '../models';

export interface ProjectPort {
  findById(id: string): Promise<Project | null>;
  findByOwnerId(ownerId: string): Promise<Project[]>;
  create(data: ProjectCreationProperties): Promise<Project>;
  update(id: string, data: Partial<Project>): Promise<Project>;
  delete(id: string): Promise<void>;
}
