// Admin browser configuration.
// Uses the same Supabase project and publishable/anon key as the public site.
// Never put a Supabase service_role/secret key here.
window.MANGAREADER_CONFIG = {
  SUPABASE_URL: 'https://wtythbvwxlwnwrixjior.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable__myEmfpQvqeBp5rve9WJzA_ptluHY_S',
  CONTENT_COUNTRY: 'JP'
};

// Admin is intentionally Japan-only for this site.
(() => {
  const lockJapan = () => {
    const select = document.getElementById('mCountry');
    if (!select) return;
    select.value = 'JP';
    select.disabled = true;
    select.title = 'This site accepts Japanese manga content only.';
  };
  lockJapan();
  new MutationObserver(lockJapan).observe(document.body, {subtree:true, childList:true});
})();