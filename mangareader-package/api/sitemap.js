const SUPABASE_URL = 'https://vcrrkyqiunczhpxdcoil.supabase.co';
const SUPABASE_KEY = 'sb_publishable_IWiCOqUZ7PtPaISAo_5RDw_9uTvyD4z';
const SITE = 'https://manga-atlas.vercel.app';

export default async function handler(req, res) {
  try {
    const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };
    const [mangaRes, chapterRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/manga?select=slug`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/chapters?select=url_slug,created_at`, { headers })
    ]);
    if (!mangaRes.ok || !chapterRes.ok) throw new Error('Supabase sitemap query failed');
    const manga = await mangaRes.json();
    const chapters = await chapterRes.json();
    const urls = new Map();
    const add = (loc, lastmod) => urls.set(loc, lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : '');
    add(`${SITE}/`);
    add(`${SITE}/japan`); add(`${SITE}/usa`); add(`${SITE}/france`); add(`${SITE}/brazil`);
    for (const m of manga) if (m.slug) add(`${SITE}/manga/${encodeURIComponent(m.slug)}`);
    for (const c of chapters) if (c.url_slug) add(`${SITE}/chapter/${encodeURIComponent(c.url_slug)}`, c.created_at);
    const body = [...urls].map(([loc, lastmod]) => `<url><loc>${loc}</loc>${lastmod}</url>`).join('');
    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).send(xml);
  } catch (e) {
    return res.status(500).send('Sitemap generation failed');
  }
}
