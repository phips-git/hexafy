import Database from 'better-sqlite3';

const DB_PATH = process.env['DB_PATH'] || '.tmp/example-domain.db';

function main() {
  console.log('Initializing demo database at:', DB_PATH);

  const db = new Database(DB_PATH);

  try {
    db.pragma('foreign_keys = ON');
    console.log('✓ Demo database initialized successfully');
  } catch (error) {
    console.error('✗ Failed to initialize demo database:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();
