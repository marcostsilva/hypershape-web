const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

async function main() {
  const prisma = new PrismaClient()
  try {
    const users = await prisma.$queryRawUnsafe('SELECT id, "gymId", role FROM "User"')
    console.log(JSON.stringify(users, null, 2))
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
