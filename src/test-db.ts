import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const gym = await prisma.organization.findFirst()
  console.log('Gym fields:', Object.keys(gym || {}))
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
