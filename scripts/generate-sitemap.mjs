import { writeFile } from 'node:fs/promises';

const SITE = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Set SUPABASE_URL and SUPABASE_ANON_KEY before generating the sitemap.');

async function fetchRows(path) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  if (!response.ok) throw new Error(`Supabase request failed: ${response.status}`);
  return response.json();
}

const urls = new Map();
const add = (loc, lastmod) => urls.set(loc, lastmod ? new Date(lastmod).toISOString() : '');

add(`${SITE}/`);
for (const country of ['JP', 'US', 'FR', 'BR']) add(`${SITE}/country.html?country=${country}`);
add(`${SITE}/blog.html`);
add(`${SITE}/japan-blog.html`);
add(`${SITE}/france-blog.html`);

const manga = await fetchRows('manga?select=slug,updated_at&slug=not.is.null&order=slug');
for (const item of manga) add(`${SITE}/manga/${encodeURIComponent(item.slug)}`, item.updated_at);

const chapters = await fetchRows('chapters?select=url_slug,created_at,updated_at&url_slug=not.is.null&order=updated_at.desc');
for (const item of chapters) add(`${SITE}/chapter/${encodeURIComponent(item.url_slug)}`, item.updated_at || item.created_at);

const escapeXml = value => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&apos;');

const body = [...urls].map(([loc, lastmod]) =>
  `  <url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
).join('\n');

await writeFile('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
console.log(`Generated sitemap with ${urls.size} URLs.`);