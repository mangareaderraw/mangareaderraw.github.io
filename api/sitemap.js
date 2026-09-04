const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

function siteUrl(req) {
  return (process.env.SITE_URL || `https://${req.headers.host}`).replace(/\/$/, '');
}

export default async function handler(req, res) {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Missing Supabase environment variables');
    const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };
    const [mangaRes, chapterRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/manga?select=slug,updated_at`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/chapters?select=url_slug,created_at`, { headers })
    ]);
    if (!mangaRes.ok || !chapterRes.ok) throw new Error('Supabase sitemap query failed');
    const manga = await mangaRes.json();
    const chapters = await chapterRes.json();
    const SITE = siteUrl(req);
    const urls = new Map();
    const escXml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    const add = (loc, lastmod) => urls.set(loc, lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : '');
    add(`${SITE}/`);
    add(`${SITE}/japan`); add(`${SITE}/usa`); add(`${SITE}/france`); add(`${SITE}/brazil`);
    add(`${SITE}/japan-blog.html`); add(`${SITE}/france-blog.html`); add(`${SITE}/blog.html`);
    for (const m of manga) if (m.slug) add(`${SITE}/manga/${encodeURIComponent(m.slug)}`, m.updated_at);
    for (const c of chapters) if (c.url_slug) add(`${SITE}/chapter/${encodeURIComponent(c.url_slug)}`, c.created_at);
    const body = [...urls].map(([loc, lastmod]) => `<url><loc>${escXml(loc)}</loc>${lastmod}</url>`).join('');
    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).send(xml);
  } catch (e) {
    return res.status(500).send('Sitemap generation failed');
  }
}