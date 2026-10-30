import type { Brand } from '@hexafy/core/brand';

import type { UserId } from '../auth/models';

export type ProjectId = Brand<string, 'ProjectId'>;

export interface Project {
  readonly id: ProjectId;
  readonly name: string;
  readonly description: string | null;
  readonly ownerId: UserId;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type ProjectCreationProperties = Pick<
  Project,
  'name' | 'description' | 'ownerId'
>;
export type ValidProjectCreationProperties = Brand<
  ProjectCreationProperties,
  'ValidProjectCreationProperties'
>;

export interface ProjectUpdateProperties extends Partial<
  Pick<Project, 'name' | 'description'>
> {}
export type ValidProjectUpdateProperties = Brand<
  ProjectUpdateProperties,
  'ValidProjectUpdateProperties'
>;
