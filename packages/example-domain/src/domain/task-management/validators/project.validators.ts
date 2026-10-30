import type {
  ProjectCreationProperties,
  ProjectUpdateProperties
} from '../models';

export class ProjectValidators {
  static validateCreation(data: ProjectCreationProperties): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Project name is required');
    }

    if (data.name.length > 100) {
      throw new Error('Project name must be less than 100 characters');
    }

    if (data.description && data.description.length > 2000) {
      throw new Error('Description must be less than 2000 characters');
    }
  }

  static validateUpdate(data: ProjectUpdateProperties): void {
    if (data.name && data.name.length > 100) {
      throw new Error('Project name must be less than 100 characters');
    }

    if (data.description && data.description.length > 2000) {
      throw new Error('Description must be less than 2000 characters');
    }
  }
}
