/**
 * Replace public.listings with up to TARGET_COUNT realistic student-marketplace
 * listings — one listing per unique product pulled from dummyjson.com.
 * - Pulls products from dummyjson (richer catalog than fakestoreapi)
 * - Reuses existing public.profiles as sellers
 * - Inserts in batches, then validates
 *
 * Run:
 *   node --env-file=.env scripts/replace-listings-with-1000.mjs
 */
import postgres from 'postgres';

const TARGET_COUNT = 250;
const BATCH_SIZE = 100;
const DUMMYJSON_URL = `https://dummyjson.com/products?limit=0`;
const PLATZI_URL = `https://api.escuelajs.co/api/v1/products?offset=0&limit=400`;
const FAKESTORE_URL = `https://fakestoreapi.com/products`;

const HANDOFF_CATEGORIES = ['For You', 'Clothes', 'Furniture', 'Events'];
const HANDOFF_CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const LOCATIONS = ['LSU Campus', 'Dorms', 'Library', 'Student Center'];

const TITLE_PREFIXES = [
  'Used',
  'Like New',
  'Great Condition',
  'Dorm Sale',
  'Moving Out',
  'Must Sell',
  'Barely Used',
  'Clean',
  'Cheap',
];

const TITLE_SUFFIXES = [
  '- great condition',
  '- like new',
  '- moving out',
  '- dorm sale',
  '- must sell',
  '- barely used',
  '- clean',
  '- cash only',
  '',
  '',
];

const DESCRIPTIONS = [
  'Campus pickup available. Good condition. Message for details.',
  'Clean and ready to use. Cash or Venmo. Meet near campus.',
  'Moving out — must go this week. Pickup at dorms.',
  'Barely used, kept in good condition. Message for photos.',
  'Bundle deals available, message me with offers.',
  'Pickup near the library. Quick replies on weekdays.',
  'Selling because I upgraded. Works perfectly.',
  'Used for one semester only. Like new condition.',
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function classifyCategory(baseProduct) {
  const cat = (baseProduct.category || '').toLowerCase();
  const title = (baseProduct.title || '').toLowerCase();
  if (
    /clothing|apparel|shirt|tops|dress|shoe|jeans|jacket|hoodie|sock|sweater|tee/.test(cat) ||
    /shirt|jacket|hoodie|jeans|coat|shoe|sneaker|dress|sweater|tee/.test(title)
  ) {
    return 'Clothes';
  }
  if (
    /furniture|home-decoration|lighting|kitchen|bath/.test(cat) ||
    /desk|chair|table|sofa|cushion|lamp|shelf|drawer|mirror|rack|bed|stool|bookcase/.test(title)
  ) {
    return 'Furniture';
  }
  if (/ticket|concert|show|event|festival|pass|game/.test(title)) {
    return 'Events';
  }
  // Electronics, beauty, accessories, groceries, etc. → "For You"
  return 'For You';
}

function pickSize(category) {
  if (category !== 'Clothes') return null;
  return pickRandom(['XS', 'S', 'M', 'L', 'XL', '8', '9', '10', '32x30', 'One Size']);
}

function pickBrandFromTitle(title) {
  const t = (title || '').toLowerCase();
  if (t.includes('nike')) return 'Nike';
  if (t.includes('adidas')) return 'Adidas';
  if (t.includes('apple') || t.includes('iphone') || t.includes('macbook') || t.includes('ipad')) return 'Apple';
  if (t.includes('samsung')) return 'Samsung';
  if (t.includes('hp ')) return 'HP';
  if (t.includes('ikea')) return 'IKEA';
  if (t.includes('jansport') || t.includes('backpack')) return 'JanSport';
  if (t.includes('patagonia')) return 'Patagonia';
  if (t.includes('levi')) return 'Levi';
  return null;
}

function buildTitle(baseTitle) {
  const cleaned = (baseTitle || '').replace(/\s+/g, ' ').trim();
  const usePrefix = Math.random() < 0.6;
  const prefix = usePrefix ? `${pickRandom(TITLE_PREFIXES)} ` : '';
  const suffix = pickRandom(TITLE_SUFFIXES);
  const base = `${prefix}${cleaned}`.trim();

  // Aim for ~40 chars including suffix; leave room for suffix.
  const maxBase = suffix ? 40 - (suffix.length + 1) : 40;
  const truncatedBase = base.length > maxBase ? `${base.slice(0, maxBase - 1).trim()}…` : base;
  const composed = suffix ? `${truncatedBase} ${suffix}`.trim() : truncatedBase;

  return composed.slice(0, 60); // hard cap to be safe
}

const MIN_PRICE = 5;
const MAX_PRICE = 500;

// Categories / keywords that don't make sense in a college marketplace.
const EXCLUDE_CATEGORY = /motorcycle|automotive|vehicle|car|truck/i;
const EXCLUDE_TITLE =
  /motorcycle|sportbike|harley|ducati|kawasaki|yamaha|suzuki|honda cb|honda cbr|dodge|chevrolet|chevy|ford|toyota|nissan|tesla|jeep|bmw|audi|mercedes|porsche|lamborghini|ferrari|rolex|patek|omega|cartier|tag heuer|iwc|breitling|tudor|tissot/i;

function jitterPrice(basePrice) {
  const factor = 0.7 + Math.random() * 0.6; // ±30%
  let p = Math.round(Number(basePrice) * factor);
  if (!Number.isFinite(p) || p < MIN_PRICE) p = MIN_PRICE;
  if (p > MAX_PRICE) p = MAX_PRICE;
  return `$${p}`;
}

function randomTimestampWithinLastDays(days) {
  const now = Date.now();
  const ms = Math.floor(Math.random() * days * 24 * 60 * 60 * 1000);
  return new Date(now - ms).toISOString();
}

function normalizeImage(raw) {
  if (!raw) return null;
  let s = String(raw).trim();
  // Platzi sometimes wraps URLs in JSON-encoded brackets like ["url"] or extra quotes.
  if (s.startsWith('[')) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr) && arr.length > 0) s = String(arr[0]).trim();
    } catch {}
  }
  s = s.replace(/^"+|"+$/g, '');
  if (!/^https?:\/\//i.test(s)) return null;
  // Filter out known broken placeholders.
  if (/placeimg\.com|any_image|example\.com/i.test(s)) return null;
  return s;
}

async function fetchDummyjson() {
  const res = await fetch(DUMMYJSON_URL);
  if (!res.ok) throw new Error(`dummyjson responded ${res.status}`);
  const payload = await res.json();
  const items = Array.isArray(payload?.products) ? payload.products : [];
  return items.map((p) => ({
    title: typeof p.title === 'string' ? p.title.trim() : '',
    price: Number(p.price),
    image: normalizeImage(p.thumbnail || (Array.isArray(p.images) ? p.images[0] : null)),
    category: p.category || '',
    brand: typeof p.brand === 'string' ? p.brand.trim() : null,
  }));
}

async function fetchPlatzi() {
  try {
    const res = await fetch(PLATZI_URL);
    if (!res.ok) return [];
    const items = await res.json();
    if (!Array.isArray(items)) return [];
    return items.map((p) => {
      const img =
        normalizeImage(Array.isArray(p.images) ? p.images[0] : null) ||
        normalizeImage(p.image);
      return {
        title: typeof p.title === 'string' ? p.title.trim() : '',
        price: Number(p.price),
        image: img,
        category: p?.category?.name || '',
        brand: null,
      };
    });
  } catch (e) {
    console.warn('  platzi fetch failed, continuing without it:', e?.message || e);
    return [];
  }
}

async function fetchFakestore() {
  try {
    const res = await fetch(FAKESTORE_URL);
    if (!res.ok) return [];
    const items = await res.json();
    if (!Array.isArray(items)) return [];
    return items.map((p) => ({
      title: typeof p.title === 'string' ? p.title.trim() : '',
      price: Number(p.price),
      image: normalizeImage(p.image),
      category: p.category || '',
      brand: null,
    }));
  } catch (e) {
    console.warn('  fakestore fetch failed, continuing without it:', e?.message || e);
    return [];
  }
}

async function fetchBaseProducts() {
  const [a, b, c] = await Promise.all([fetchDummyjson(), fetchPlatzi(), fetchFakestore()]);
  console.log(
    `  sources → dummyjson: ${a.length}, platzi: ${b.length}, fakestore: ${c.length}`,
  );
  const seen = new Set();
  const merged = [];
  for (const p of [...a, ...b, ...c]) {
    if (!p.title || !p.image || !Number.isFinite(p.price) || p.price <= 0) continue;
    if (EXCLUDE_CATEGORY.test(p.category || '')) continue;
    if (EXCLUDE_TITLE.test(p.title)) continue;
    const key = p.title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(p);
  }
  if (merged.length === 0) {
    throw new Error('No usable base products from any source');
  }
  // Shuffle so the mix from each source is interleaved.
  for (let i = merged.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [merged[i], merged[j]] = [merged[j], merged[i]];
  }
  return merged;
}

function buildListing({ baseProduct, sellerId, listingColumns }) {
  const title = buildTitle(baseProduct.title);
  const price = jitterPrice(baseProduct.price);
  const imageUrl = baseProduct.image;
  const category = classifyCategory(baseProduct);
  const condition = pickRandom(HANDOFF_CONDITIONS);
  const ts = randomTimestampWithinLastDays(7);

  const row = {
    seller_id: sellerId,
    title,
    price,
    image_url: imageUrl,
    status: 'active',
  };

  if (listingColumns.has('description')) {
    row.description = pickRandom(DESCRIPTIONS);
  }
  if (listingColumns.has('category')) row.category = category;
  if (listingColumns.has('condition')) row.condition = condition;
  if (listingColumns.has('brand')) {
    row.brand = baseProduct.brand?.trim() || pickBrandFromTitle(baseProduct.title);
  }
  if (listingColumns.has('size')) row.size = pickSize(category);
  if (listingColumns.has('location_label')) row.location_label = pickRandom(LOCATIONS);
  if (listingColumns.has('posted_at')) row.posted_at = ts;
  if (listingColumns.has('created_at')) row.created_at = ts;

  return row;
}

function getDbConnection() {
  const host = process.env.SUPABASE_DB_HOST?.trim();
  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  const port = Number(process.env.SUPABASE_DB_PORT || 5432);
  const username = process.env.SUPABASE_DB_USER?.trim() || 'postgres';
  const database = process.env.SUPABASE_DB_NAME?.trim() || 'postgres';
  const url = process.env.SUPABASE_DB_URL?.trim();

  const options = { ssl: 'require', max: 1, connect_timeout: 30 };

  if (host && password) {
    return postgres({ host, port, username, password, database, ...options });
  }
  if (url) {
    return postgres(url, options);
  }
  throw new Error(
    'Missing Postgres config. Set SUPABASE_DB_HOST + SUPABASE_DB_PASSWORD or SUPABASE_DB_URL.',
  );
}

async function inspectListingsSchema(sql) {
  const cols = await sql`
    select column_name, is_nullable
    from information_schema.columns
    where table_schema = 'public' and table_name = 'listings'
  `;
  const colMap = new Map(cols.map((c) => [c.column_name, c.is_nullable === 'YES']));
  return colMap;
}

async function getProfileIds(sql) {
  const rows = await sql`select id from public.profiles`;
  return rows.map((r) => r.id);
}

async function clearListings(sql) {
  const result = await sql`delete from public.listings returning 1`;
  return result.count;
}

async function batchInsert(sql, rows, columnMap) {
  const ordered = [...columnMap.keys()].filter((c) => c !== 'id'); // let DB default id
  const usable = ordered.filter((c) =>
    ['seller_id', 'title', 'price', 'image_url', 'status', 'description', 'category', 'condition', 'brand', 'size', 'location_label', 'posted_at', 'created_at'].includes(c),
  );

  let totalInserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE).map((r) => {
      const obj = {};
      for (const col of usable) obj[col] = r[col] ?? null;
      return obj;
    });
    const inserted = await sql`insert into public.listings ${sql(chunk, ...usable)} returning 1`;
    totalInserted += inserted.count;
    if (totalInserted % 100 === 0 || totalInserted === rows.length) {
      console.log(`Inserted ${totalInserted}/${rows.length}`);
    }
  }
  return totalInserted;
}

async function cleanupInvalid(sql) {
  const removed = await sql`
    delete from public.listings
    where coalesce(trim(title), '') = ''
       or coalesce(trim(image_url), '') = ''
       or coalesce(trim(price), '') = ''
       or trim(price) ~ '^\\$?0+$'
       or nullif(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric > ${MAX_PRICE}
    returning 1
  `;
  return removed.count;
}

async function main() {
  const sql = getDbConnection();
  const summary = {};
  try {
    console.log('Step 1: inspecting schema');
    const listingCols = await inspectListingsSchema(sql);
    if (listingCols.size === 0) {
      throw new Error('public.listings does not exist or is empty of columns');
    }
    const sellerNullable = listingCols.get('seller_id') ?? true;
    summary.sellerIdNullable = sellerNullable;

    const [{ count: originalCount }] = await sql`select count(*)::int as count from public.listings`;
    summary.originalCount = originalCount;
    console.log(`  current listings: ${originalCount}`);

    console.log('Step 2: clearing listings (no DB backup — export first if you need a copy)');
    const deletedCount = await clearListings(sql);
    summary.deletedCount = deletedCount;
    console.log(`  deleted ${deletedCount} rows`);

    console.log('Step 3: fetching base products');
    const baseProducts = await fetchBaseProducts();
    summary.baseProducts = baseProducts.length;
    console.log(`  loaded ${baseProducts.length} base products`);

    console.log('Step 4: loading sellers');
    const sellerIds = await getProfileIds(sql);
    if (sellerIds.length === 0) {
      throw new Error('No rows in public.profiles — refusing to insert listings without seller_id.');
    }
    summary.sellerCount = sellerIds.length;
    console.log(`  ${sellerIds.length} sellers available`);

    const wanted = Math.min(TARGET_COUNT, baseProducts.length);
    if (wanted < TARGET_COUNT) {
      console.log(
        `  note: API returned only ${baseProducts.length} products; generating ${wanted} listings instead of ${TARGET_COUNT}`,
      );
    }
    console.log(`Step 5: generating ${wanted} listings (one per unique product)`);
    const rows = baseProducts
      .slice(0, wanted)
      .map((baseProduct) =>
        buildListing({
          baseProduct,
          sellerId: pickRandom(sellerIds),
          listingColumns: listingCols,
        }),
      );

    console.log('Step 6: inserting in batches of 100');
    const inserted = await batchInsert(sql, rows, listingCols);
    summary.insertedCount = inserted;

    console.log('Step 7: cleaning up invalid rows');
    const removed = await cleanupInvalid(sql);
    summary.cleanedRows = removed;

    const [{ count: finalCount }] = await sql`select count(*)::int as count from public.listings`;
    summary.finalCount = finalCount;
    const [{ count: missingSeller }] = await sql`
      select count(*)::int as count from public.listings where seller_id is null
    `;
    summary.rowsMissingSellerId = missingSeller;
    const [{ count: missingTitle }] = await sql`
      select count(*)::int as count from public.listings where coalesce(trim(title), '') = ''
    `;
    summary.rowsMissingTitle = missingTitle;
    const [{ count: missingImage }] = await sql`
      select count(*)::int as count from public.listings where coalesce(trim(image_url), '') = ''
    `;
    summary.rowsMissingImage = missingImage;

    console.log('\nSummary:');
    console.log(JSON.stringify(summary, null, 2));
  } catch (e) {
    console.error('Failed:', e);
    process.exitCode = 1;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

await main();
