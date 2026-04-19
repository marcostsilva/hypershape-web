require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')

async function main() {
  const connectionString = process.env.DATABASE_URL
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    await prisma.user.update({
      where: { email: 'admin@hypershape.com' },
      data: { gymId: null }
    })
    console.log('Super Admin agora é independente (Acesso Full)!')
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch(console.error)
