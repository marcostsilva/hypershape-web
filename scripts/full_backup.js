const { Client } = require('pg');
const fs = require('fs');

async function main() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_RyPFfN8jQ2Xq@ep-gentle-resonance-ac0j1pjz.sa-east-1.aws.neon.tech/neondb?sslmode=require",
  });
  
  try {
    await client.connect();
    
    const users = await client.query('SELECT * FROM "User"');
    const gyms = await client.query('SELECT * FROM "Gym"');
    
    fs.writeFileSync('full_backup.json', JSON.stringify({
      users: users.rows,
      gyms: gyms.rows
    }, null, 2));
    
    console.log('Backup completo concluído.');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
