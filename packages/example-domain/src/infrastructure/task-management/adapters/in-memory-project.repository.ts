import type {
  Project,
  ProjectCreationProperties
} from '../../domain/task-management/models';
import type { ProjectPort } from '../../domain/task-management/ports';

export class InMemoryProjectRepository implements ProjectPort {
  private readonly projects: Map<string, Project> = new Map();

  async findById(id: string): Promise<Project | null> {
    return this.projects.get(id) ?? null;
  }

  async findByOwnerId(ownerId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.ownerId === ownerId
    );
  }

  async create(data: ProjectCreationProperties): Promise<Project> {
    const project: Project = {
      id: `project_${Date.now()}`,
      name: data.name,
      description: data.description,
      ownerId: data.ownerId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.projects.set(project.id, project);
    return project;
  }

  async update(id: string, data: Partial<Project>): Promise<Project> {
    const existing = this.projects.get(id);
    if (!existing) {
      throw new Error('Project not found');
    }

    const updated: Project = {
      ...existing,
      ...data,
      updatedAt: new Date()
    };

    this.projects.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.projects.delete(id);
  }
}
