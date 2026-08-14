const { Client } = require('pg');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const dbUrlLine = envFile.split('\n').find(l => l.startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.split('=')[1].trim().replace(/^['"]|['"]$/g, '');

const client = new Client({ connectionString: dbUrl });

client.connect()
  .then(() => {
    console.log('Connected to DB');
    return client.query(`
      ALTER TABLE "cms"."_posts_v" 
      ALTER COLUMN "version_noindex" 
      SET DATA TYPE boolean 
      USING CASE WHEN "version_noindex"::text IN ('true', '1', 't', 'y', 'yes') THEN true ELSE false END;
    `);
  })
  .then(() => console.log('Successfully altered column using USING clause!'))
  .catch(e => {
    console.error('Failed to alter column, trying to DROP instead. Error:', e.message);
    return client.query('ALTER TABLE "cms"."_posts_v" DROP COLUMN "version_noindex"')
      .then(() => console.log('Dropped the column successfully. Payload will recreate it as boolean.'));
  })
  .finally(() => {
    client.end();
    console.log('Done.');
  });
