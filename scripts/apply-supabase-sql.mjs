/**
 * Applies supabase/schema.sql, all supabase/migrations/*.sql, then supabase/seed.sql
 * using Postgres.
 *
 * Prefer discrete vars when the DB password contains #, @, etc. (URI + postgres.js
 * treat # as a URL fragment; unquoted # in .env is also treated as a comment).
 *
 * Option A — host + password (recommended for special characters):
 *   SUPABASE_DB_HOST=db.<project-ref>.supabase.co
 *   SUPABASE_DB_PASSWORD="your#password"   # quotes required if password contains #
 *   Optional: SUPABASE_DB_PORT, SUPABASE_DB_USER, SUPABASE_DB_NAME
 *
 * Option B — single URI (password must be URL-encoded, e.g. # → %23):
 *   SUPABASE_DB_URL=postgresql://postgres:encoded@host:5432/postgres
 */
import { readFileSync } from 'fs';
import { readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const host = process.env.SUPABASE_DB_HOST?.trim();
const password = process.env.SUPABASE_DB_PASSWORD?.trim();
const port = Number(process.env.SUPABASE_DB_PORT || 5432);
const username = process.env.SUPABASE_DB_USER?.trim() || 'postgres';
const database = process.env.SUPABASE_DB_NAME?.trim() || 'postgres';
const url = process.env.SUPABASE_DB_URL?.trim();

const options = {
  ssl: 'require',
  max: 1,
  connect_timeout: 30,
};

let sql;
if (host && password) {
  sql = postgres({
    host,
    port,
    username,
    password,
    database,
    ...options,
  });
} else if (url) {
  sql = postgres(url, options);
} else {
  console.error(
    [
      'Missing Postgres config. Use either:',
      '  SUPABASE_DB_HOST + SUPABASE_DB_PASSWORD (quote password if it contains #), or',
      '  SUPABASE_DB_URL with a URL-encoded password.',
      'See scripts/apply-supabase-sql.mjs header for details.',
    ].join('\n'),
  );
  process.exit(1);
}

const schemaPath = join(root, 'supabase/schema.sql');
const migrationsDir = join(root, 'supabase/migrations');
const seedPath = join(root, 'supabase/seed.sql');

try {
  const schema = readFileSync(schemaPath, 'utf8');
  const migrationFiles = readdirSync(migrationsDir)
    .filter((name) => name.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));
  const seed = readFileSync(seedPath, 'utf8');

  console.log('Applying supabase/schema.sql …');
  await sql.unsafe(schema);
  for (const fileName of migrationFiles) {
    const migrationPath = join(migrationsDir, fileName);
    const migrationSql = readFileSync(migrationPath, 'utf8');
    console.log(`Applying supabase/migrations/${fileName} …`);
    await sql.unsafe(migrationSql);
  }
  console.log('Applying supabase/seed.sql …');
  await sql.unsafe(seed);
  console.log('Done. Schema, migrations, profiles, and listings are loaded.');
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await sql.end({ timeout: 5 });
}
