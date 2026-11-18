import {
  DomainExceptionFilter,
  HttpExceptionFilter,
  InfrastructureExceptionFilter,
  UnhandledExceptionFilter
} from '@hexafy/nestjs';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });

  // Register global exception filters
  app.useGlobalFilters(
    new DomainExceptionFilter(),
    new HttpExceptionFilter(),
    new InfrastructureExceptionFilter(),
    new UnhandledExceptionFilter()
  );

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
