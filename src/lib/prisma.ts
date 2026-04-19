import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } })
  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  })
}

const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
