import { PrismaClient } from './prisma-client'

const globalForPrisma = global

export const prisma =
  globalForPrisma.prismaCustom ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaCustom = prisma
