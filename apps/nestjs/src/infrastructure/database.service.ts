import {
  InMemoryProjectRepository,
  InMemoryTaskRepository
} from '@hexafy/example-domain/infrastructure';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Database from 'better-sqlite3';

export interface PersistencePorts {
  taskPersistence: InMemoryTaskRepository;
  projectPersistence: InMemoryProjectRepository;
  projectStatsPersistence: unknown;
  generator: { generate: () => string };
}

export const DATABASE_CLIENT = 'DATABASE_CLIENT';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private database: Database | null = null;
  private ports: PersistencePorts | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const dbPath =
      this.configService.get<string>('app.dbPath') || '.tmp/example-domain.db';
    this.database = new Database(dbPath);
    this.database.pragma('foreign_keys = ON');
    this.ports = {
      taskPersistence: new InMemoryTaskRepository(),
      projectPersistence: new InMemoryProjectRepository(),
      projectStatsPersistence: undefined,
      generator: {
        generate: () =>
          `demo_${Date.now()}_${Math.random().toString(16).slice(2)}`
      }
    };
  }

  onModuleDestroy(): void {
    this.database?.close();
  }

  getPersistencePorts(): PersistencePorts {
    if (!this.ports) throw new Error('Database not initialized');
    return this.ports;
  }

  getDatabaseAdapter(): unknown {
    if (!this.database) throw new Error('Database not initialized');
    return this.database;
  }
}
