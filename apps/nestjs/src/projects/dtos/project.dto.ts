export interface CreateProjectDto {
  name: string;
  description?: string | null;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string | null;
}
