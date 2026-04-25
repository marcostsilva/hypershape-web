const { Client } = require('pg');
const fs = require('fs');

async function main() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_RyPFfN8jQ2Xq@ep-gentle-resonance-ac0j1pjz.sa-east-1.aws.neon.tech/neondb?sslmode=require",
  });
  
  try {
    await client.connect();
    const res = await client.query('SELECT id, "gymId", role FROM "User"');
    fs.writeFileSync('users_backup.json', JSON.stringify(res.rows, null, 2));
    console.log('Backup concluído:', res.rows.length, 'usuários');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
