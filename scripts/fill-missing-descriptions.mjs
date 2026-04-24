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
  const updated = await sql`
    update public.listings
    set description = case (floor(random() * 6))::int
      when 0 then 'Campus pickup available. Good condition. Message for details.'
      when 1 then 'Available for meetup near campus. Works as expected.'
      when 2 then 'Clean item with normal wear. Feel free to ask questions.'
      when 3 then 'Student sale item. Ready for pickup this week.'
      when 4 then 'Lightly used and kept in good shape. Pickup available.'
      else 'Good condition item. Message to coordinate pickup.'
    end
    where coalesce(trim(description), '') = ''
    returning id
  `;

  const [{ count: remainingBlankDescriptions }] = await sql`
    select count(*)::int as count
    from public.listings
    where coalesce(trim(description), '') = ''
  `;

  console.log({
    updatedRows: updated.count,
    remainingBlankDescriptions,
  });
} finally {
  await sql.end({ timeout: 5 });
}

