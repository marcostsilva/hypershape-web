require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')
const bcrypt = require('bcryptjs')

async function main() {
  const connectionString = process.env.DATABASE_URL
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const email = 'admin@hypershape.com'
    const password = 'adminpassword123' // O dono do sistema deve trocar depois
    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        role: 'ADMIN',
        password: hashedPassword,
        name: 'HyperShape Admin'
      },
      create: {
        email,
        password: hashedPassword,
        name: 'HyperShape Admin',
        role: 'ADMIN',
      }
    })

    console.log('\n--- CONTA DE ADMIN LOCAL CRIADA ---')
    console.log('Email:', email)
    console.log('Senha:', password)
    console.log('Role:', admin.role)
    console.log('------------------------------------\n')
    
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
