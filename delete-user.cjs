const { Client } = require('pg');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const dbUrlLine = envFile.split('\n').find(l => l.startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.split('=')[1].trim().replace(/^['"]|['"]$/g, '');

const client = new Client({ connectionString: dbUrl });

client.connect()
  .then(() => {
    console.log('Conectado a la base de datos Supabase...');
    return client.query('DELETE FROM "cms"."admins";');
  })
  .then((res) => {
    console.log(`Éxito. Se eliminaron ${res.rowCount} usuario(s) de la tabla admins.`);
    console.log('Ahora puedes ir a /admin y crear tu usuario administrador desde cero.');
  })
  .catch(e => {
    console.error('Error al intentar eliminar el usuario:', e.message);
  })
  .finally(() => {
    client.end();
  });
