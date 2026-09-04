// Public browser configuration.
// Uses the Supabase publishable/anon key; never put a service_role/secret key here.
window.MANGAREADER_CONFIG = {
  SUPABASE_URL: 'https://wtythbvwxlwnwrixjior.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable__myEmfpQvqeBp5rve9WJzA_ptluHY_S',
  SITE_NAME: 'MangaReader',
  CONTENT_COUNTRY: 'JP'
};

// Japan-only public site + light theme.
(() => {
  const css = document.createElement('style');
  css.textContent = `
    html,body{background:#f7f8fa!important;color:#171923!important}
    body{color-scheme:light!important}
    .nav{background:#fff!important;border-color:#e5e7eb!important}
    .navlinks{color:#5f6675!important}
    .hero{background:linear-gradient(135deg,#fff 0%,#f0f4f8 55%,#e7eef7 100%)!important}
    .hero p,.country-count,.latest-item p,.loading,.empty,.footer{color:#687080!important}
    .country-row,.country-line,.footer{border-color:#e5e7eb!important}
    .latest-item{background:#fff!important;border-color:#e2e6ec!important;box-shadow:0 4px 18px rgba(20,30,50,.05)!important}
    .page-btn{background:#fff!important;color:#171923!important;border-color:#d7dce4!important}
    .page-btn:hover:not(:disabled){background:#f1f4f8!important}
    .brand span{color:#183b73!important}
  `;
  document.head.appendChild(css);
  document.documentElement.dataset.contentCountry = 'JP';
  const hideNonJapan = () => {
    ['usa','france','brazil'].forEach(id => document.getElementById(id)?.remove());
    document.querySelectorAll('.navlinks a').forEach(a => {
      if (/🇺🇸|🇫🇷|🇧🇷/.test(a.textContent)) a.remove();
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hideNonJapan);
  else hideNonJapan();
})();