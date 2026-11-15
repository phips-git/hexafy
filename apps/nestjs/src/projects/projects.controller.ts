import { NotFoundError } from '@hexafy/core/domain';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards
} from '@nestjs/common';

import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';
import { CreateProjectDto, UpdateProjectDto } from './dtos/create-project.dto';
import { ProjectsService } from './projects.service';

interface AuthenticatedUserLike {
  id: string;
  role: string;
}

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProject(
    @Body() createProjectDto: CreateProjectDto
  ): Promise<{ projectId: string }> {
    return this.projectsService.createProject(createProjectDto, {
      tenantId: 'demo-tenant',
      projectId: null,
      role: 'user'
    });
  }

  @Get(':id')
  async getProject(@Param('id') _id: string): Promise<{ project: unknown }> {
    throw new NotFoundError('Project');
  }

  @Put(':id')
  async updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto
  ): Promise<{ projectId: string }> {
    return this.projectsService.updateProject(id, updateProjectDto, {
      tenantId: 'demo-tenant',
      projectId: null,
      role: 'user'
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProject(@Param('id') id: string): Promise<void> {
    await this.projectsService.deleteProject(id, {
      tenantId: 'demo-tenant',
      projectId: null,
      role: 'user'
    });
  }

  private mapUserToAuthorizationContext(user: AuthenticatedUserLike): {
    tenantId: string;
    projectId: null;
    role: string;
  } {
    return {
      tenantId: user.id,
      projectId: null,
      role: user.role
    };
  }
}
