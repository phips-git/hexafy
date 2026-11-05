import type { Project } from '../models/project';

export class ProjectPolicy {
  static isValidName(name: string): boolean {
    return name.trim().length >= 1 && name.trim().length <= 100;
  }

  static canArchiveProject(project: Project, hasActiveTasks: boolean): boolean {
    if (hasActiveTasks) {
      throw new Error('Cannot archive project with active tasks');
    }
    return true;
  }

  static canModifyOwner(
    project: Project,
    newOwnerId: string,
    currentOwnerId: string
  ): boolean {
    if (project.ownerId === newOwnerId) {
      return true;
    }

    // Only project owner can transfer ownership
    throw new Error('Only the project owner can transfer ownership');
  }
}
