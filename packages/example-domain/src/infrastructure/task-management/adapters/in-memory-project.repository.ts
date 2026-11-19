import type { Brand } from '@hexafy/core/domain';

import type { ProjectPort } from '../../../application/ports';
import type { Project, ProjectCreationProperties } from '../../../domain';

type BrandedProjectId = Brand<string, 'ProjectId'>;
type BrandedUserId = Brand<string, 'UserId'>;

export class InMemoryProjectRepository implements ProjectPort {
  private readonly projects: Map<BrandedProjectId, Project> = new Map();

  async findById(id: string): Promise<Project | null> {
    return this.projects.get(id as BrandedProjectId) ?? null;
  }

  async findByOwnerId(ownerId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.ownerId === ownerId
    );
  }

  async create(data: ProjectCreationProperties): Promise<Project> {
    const projectId = `project_${Date.now()}` as BrandedProjectId;

    const project: Project = {
      id: projectId,
      name: data.name,
      description: data.description,
      ownerId: data.ownerId as BrandedUserId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.projects.set(project.id, project);
    return project;
  }

  async update(
    id: string,
    data: Partial<ProjectCreationProperties>
  ): Promise<Project> {
    const existing = this.projects.get(id as BrandedProjectId);
    if (!existing) {
      throw new Error('Project not found');
    }

    const updated: Project = {
      ...existing,
      ...data,
      updatedAt: new Date()
    };

    this.projects.set(updated.id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.projects.delete(id as BrandedProjectId);
  }
}
