import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // If no DATABASE_URL, return a dummy that will throw on actual queries
  if (!process.env.DATABASE_URL) {
    // Return a proxy that throws helpful errors when DB is not configured
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        if (prop === 'then' || prop === '$connect' || prop === '$disconnect') {
          return undefined
        }
        return new Proxy(() => {}, {
          get() {
            throw new Error(
              `[Prisma] DATABASE_URL not configured. Using mock data mode. Set DATABASE_URL to connect to a real database.`
            )
          },
          apply() {
            throw new Error(
              `[Prisma] DATABASE_URL not configured. Using mock data mode. Set DATABASE_URL to connect to a real database.`
            )
          },
        })
      },
    })
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
