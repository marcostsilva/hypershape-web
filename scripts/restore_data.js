const { Client } = require('pg');
const fs = require('fs');

async function main() {
  const backup = JSON.parse(fs.readFileSync('full_backup.json', 'utf8'));
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_RyPFfN8jQ2Xq@ep-gentle-resonance-ac0j1pjz.sa-east-1.aws.neon.tech/neondb?sslmode=require",
  });
  
  try {
    await client.connect();
    console.log('Iniciando restauração...');

    // 1. Restaurar Organizações (Gyms)
    for (const gym of backup.gyms) {
      await client.query(
        'INSERT INTO gyms (id, name, slug, "logoUrl", "primaryColor", "secondaryColor", "customDomain", cnpj, "corporateName", "tradeName", street, number, complement, neighborhood, city, state, "zipCode", "ownerEmail", plan, "maxStudents", status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)',
        [gym.id, gym.name, gym.slug, gym.logoUrl, gym.primaryColor, gym.secondaryColor, gym.customDomain, gym.cnpj, gym.corporateName, gym.tradeName, gym.street, gym.number, gym.complement, gym.neighborhood, gym.city, gym.state, gym.zipCode, gym.ownerEmail, gym.plan, gym.maxStudents, gym.status, gym.createdAt, gym.updatedAt]
      );
    }
    console.log('Organizações restauradas.');

    // 2. Restaurar Usuários
    for (const user of backup.users) {
      // Mapear Role antigo para GlobalRole se necessário, mas aqui usaremos USER por padrão
      await client.query(
        'INSERT INTO "User" (id, email, password, name, image, "globalRole", "isBlocked", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [user.id, user.email, user.password, user.name, user.image, 'USER', user.isBlocked, user.createdAt, new Date()]
      );

      // 3. Criar Membership se ele tinha gymId
      if (user.gymId) {
        await client.query(
          'INSERT INTO memberships (id, "userId", "organizationId", role, status, "joinedAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [`mem_${user.id}`, user.id, user.gymId, user.role, 'ACTIVE', user.joinedGymAt || new Date(), new Date()]
        );
      }
    }
    console.log('Usuários e Memberships restaurados.');

  } catch (err) {
    console.error('Erro na restauração:', err);
  } finally {
    await client.end();
  }
}

main();
