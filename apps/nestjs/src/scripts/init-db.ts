import Database from 'better-sqlite3';

const DB_PATH = process.env['DB_PATH'] || '.tmp/example-domain.db';

async function main() {
  console.log('Initializing demo database at:', DB_PATH);

  try {
    const database = new Database(DB_PATH);
    database.pragma('foreign_keys = ON');
    database.close();
    console.log('✓ Demo database initialized successfully');
  } catch (error) {
    console.error('✗ Failed to initialize demo database:', error);
    process.exit(1);
  }
}

void main();
