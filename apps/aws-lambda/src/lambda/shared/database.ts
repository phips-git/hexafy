import db = require('better-sqlite3');
import type { LoggingPort } from '@hexafy/core/application';
import { JSONConsoleLoggingAdapter } from '@hexafy/core/infrastructure';

type Database = InstanceType<typeof db>;

export interface DatabaseConfig {
  path: string;
  enableForeignKeys?: boolean;
}

export const DEFAULT_DB_PATH =
  process.env['DB_PATH'] || '.tmp/example-domain.db';

class DatabaseManager {
  private static instance: Database | null = null;
  private static logger: LoggingPort | null = null;

  private constructor() {}

  static getInstance(config?: DatabaseConfig): Database {
    if (!DatabaseManager.instance) {
      const path = config?.path || DEFAULT_DB_PATH;
      DatabaseManager.logger = JSONConsoleLoggingAdapter('DatabaseManager');

      DatabaseManager.instance = new db(path);

      if (config?.enableForeignKeys ?? true) {
        DatabaseManager.instance.pragma('foreign_keys = ON');
      }

      DatabaseManager.logger.info('Database connection established', { path });
    }

    return DatabaseManager.instance;
  }

  static resetInstance(): void {
    if (DatabaseManager.instance) {
      DatabaseManager.instance.close();
      DatabaseManager.instance = null;
    }
  }

  static close(): void {
    DatabaseManager.resetInstance();
  }
}

export function getDatabase(config?: DatabaseConfig): Database {
  return DatabaseManager.getInstance(config);
}

export function createTempDatabase(): Database {
  return new db(':memory:');
}
