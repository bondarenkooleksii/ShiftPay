import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (fs.existsSync('.env')) process.loadEnvFile('.env');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'shiftpay-dev-secret',
  tokenTtlSeconds: 7 * 24 * 60 * 60,
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  dbFile: process.env.DB_FILE ?? path.join(root, 'data', 'db.json'),
};
