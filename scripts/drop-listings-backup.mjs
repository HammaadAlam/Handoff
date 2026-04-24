/**
 * Drops public.listings_backup (historical seed backups). Irreversible.
 *
 *   node --env-file=.env scripts/drop-listings-backup.mjs
 */
import postgres from 'postgres';

const host = process.env.SUPABASE_DB_HOST?.trim();
const password = process.env.SUPABASE_DB_PASSWORD?.trim();
const port = Number(process.env.SUPABASE_DB_PORT || 5432);
const username = process.env.SUPABASE_DB_USER?.trim() || 'postgres';
const database = process.env.SUPABASE_DB_NAME?.trim() || 'postgres';
const url = process.env.SUPABASE_DB_URL?.trim();

const options = { ssl: 'require', max: 1, connect_timeout: 30 };

const sql =
  host && password
    ? postgres({ host, port, username, password, database, ...options })
    : url
      ? postgres(url, options)
      : null;

if (!sql) {
  console.error('Set SUPABASE_DB_HOST + SUPABASE_DB_PASSWORD or SUPABASE_DB_URL.');
  process.exit(1);
}

try {
  const [{ exists }] = await sql`
    select exists(
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'listings_backup'
    ) as exists
  `;
  if (!exists) {
    console.log('public.listings_backup does not exist; nothing to do.');
    process.exit(0);
  }
  await sql`drop table public.listings_backup`;
  console.log('Dropped public.listings_backup.');
} finally {
  await sql.end({ timeout: 5 });
}
