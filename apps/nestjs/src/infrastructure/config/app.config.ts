import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: Number.parseInt(process.env['PORT'] ?? '3000', 10) || 3000,
  environment: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtIssuer: process.env.JWT_ISSUER || 'dev-app',
  jwtAudience: process.env.JWT_AUDIENCE || 'dev-api',
  dbPath: process.env.DB_PATH || '.tmp/example-domain.db'
}));
