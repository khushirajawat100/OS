import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL') || 'postgresql://postgres:postgres@localhost:5432/visuark_db?schema=public',
  },
  migrations: {
    seed: 'node prisma/seed.js',
  },
});

