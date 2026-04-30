// prisma.config.ts — Prontuário Social
// Required for Prisma config detection (intentionally minimal for v6 compatibility)
import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
})
