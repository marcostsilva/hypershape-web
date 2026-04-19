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
    // 1. Criar ou encontrar a academia
    const gym = await prisma.gym.upsert({
      where: { slug: 'goldgym' },
      update: {},
      create: {
        name: 'Gold Gym',
        slug: 'goldgym',
      }
    })
    console.log('Academia criada/encontrada:', gym.name)

    // 2. Transformar o usuário marcos@gmail.com em ADMIN desta academia
    const user = await prisma.user.update({
      where: { email: 'marcos@gmail.com' },
      data: {
        role: 'ADMIN',
        gymId: gym.id,
        mode: 'MANAGED'
      }
    })
    console.log('Usuário atualizado para ADMIN da Gold Gym:', user.email)
    
    console.log('\n--- ACESSO CONFIGURADO ---')
    console.log('URL de Admin: http://localhost:3000/goldgym/admin')
    console.log('Login: marcos@gmail.com')
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
