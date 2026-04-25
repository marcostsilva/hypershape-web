import prisma from '../src/lib/prisma'
import fs from 'fs'

async function main() {
  try {
    // Note: If the schema was already changed in prisma.schema, 
    // we need to use $queryRaw to get columns that might have been removed from the TS types
    const users: any[] = await prisma.$queryRaw`SELECT id, "gymId", role FROM "User"`
    
    fs.writeFileSync('users_backup.json', JSON.stringify(users, null, 2))
    console.log('Backup concluído:', users.length, 'usuários')
  } catch (error) {
    console.error('Erro no backup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
