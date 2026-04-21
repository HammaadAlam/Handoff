/**
 * Writes supabase/full_setup.sql = schema.sql + migrations/*.sql + seed.sql
 * (one paste for SQL Editor). Run after changing schema, migrations, or seed.
 */
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const schema = readFileSync(join(root, 'supabase/schema.sql'), 'utf8');

const migrationsDir = join(root, 'supabase/migrations');
let migrations = '';
try {
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  migrations = files
    .map((f) => `-- --- migration: ${f} ---\n${readFileSync(join(migrationsDir, f), 'utf8')}`)
    .join('\n\n');
} catch {
  // no migrations dir yet; skip
}

const seed = readFileSync(join(root, 'supabase/seed.sql'), 'utf8');

let featureSeed = '';
try {
  featureSeed = readFileSync(join(root, 'supabase/seed_features.sql'), 'utf8');
} catch {
  // optional
}

const out = `-- === Handoff: full setup (schema + migrations + seed + seed_features) — paste once in Supabase SQL Editor ===
-- Regenerate: npm run db:bundle

${schema}

${migrations}

${seed}

${featureSeed}
`;

writeFileSync(join(root, 'supabase/full_setup.sql'), out);
console.log('Wrote supabase/full_setup.sql');
