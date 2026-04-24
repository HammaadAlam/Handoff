import postgres from 'postgres';

const sql = postgres({
  host: process.env.SUPABASE_DB_HOST,
  password: process.env.SUPABASE_DB_PASSWORD,
  username: 'postgres',
  database: 'postgres',
  ssl: 'require',
  max: 1,
});

try {
  const [{ count }] = await sql`select count(*)::int as count from public.listings`;
  const [{ count: over }] = await sql`
    select count(*)::int as count
    from public.listings
    where nullif(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric > 2000
  `;
  const top = await sql`
    select title, price
    from public.listings
    order by nullif(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric desc nulls last
    limit 5
  `;
  console.log({ totalListings: count, over2000: over, top });
} finally {
  await sql.end({ timeout: 5 });
}
