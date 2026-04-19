require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error("DATABASE_URL not found in .env")
    process.exit(1)
  }
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        gymId: true,
        gym: {
          select: {
            slug: true,
            name: true
          }
        }
      }
    })
    
    const gyms = await prisma.gym.findMany()
    
    console.log(JSON.stringify({ users, gyms }, null, 2))
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
