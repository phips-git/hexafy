import { Module } from '@nestjs/common';

import { CreateProjectUseCase } from '../domain/use-cases/create-project.use-case';
import { ProjectsController } from './projects.controller';

@Module({
  controllers: [ProjectsController],
  providers: [CreateProjectUseCase],
  exports: [CreateProjectUseCase]
})
export class ProjectsModule {}
