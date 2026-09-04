// Admin browser configuration.
// Uses the same Supabase project and publishable/anon key as the public site.
// Never put a service_role/secret key here.
window.MANGAREADER_CONFIG = {
  SUPABASE_URL: 'https://wtythbvwxlwnwrixjior.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable__myEmfpQvqeBp5rve9WJzA_ptluHY_S',
  CONTENT_COUNTRY: 'JP'
};

// Light admin theme + Japan-only content entry.
(() => {
  const css = document.createElement('style');
  css.textContent = `
    :root{--bg:#f5f7fa!important;--panel:#fff!important;--line:#e1e5eb!important;--text:#171923!important;--muted:#687080!important;--accent:#183b73!important;--good:#198754!important}
    body{background:#f5f7fa!important;color:#171923!important}
    .side{background:#fff!important;border-color:#e1e5eb!important}
    .nav button{color:#687080!important}
    .nav button.active,.nav button:hover{background:#eef2f7!important;color:#171923!important}
    .stat,.panel{background:#fff!important;border-color:#e1e5eb!important;box-shadow:0 4px 18px rgba(20,30,50,.05)!important}
    .pill{background:#f7f9fb!important;border-color:#dfe4ea!important;color:#4f5868!important}
    input,textarea,select{background:#fff!important;border-color:#d5dbe3!important;color:#171923!important}
    .btn.secondary{background:#f1f3f6!important;border-color:#d5dbe3!important;color:#263040!important}
    .table th,.table td{border-color:#e5e8ed!important}
    .login{background:#f5f7faee!important}
    .loginbox{background:#fff!important;border-color:#e1e5eb!important;box-shadow:0 25px 80px rgba(20,30,50,.14)!important}
    .toast{background:#fff!important;border-color:#dfe4ea!important;color:#171923!important;box-shadow:0 8px 30px rgba(20,30,50,.12)!important}
  `;
  document.head.appendChild(css);
  const lockJapan = () => {
    const select = document.getElementById('mCountry');
    if (!select) return;
    select.value = 'JP';
    select.disabled = true;
    select.title = 'This site accepts Japanese manga content only.';
  };
  lockJapan();
  setInterval(lockJapan, 250);
  new MutationObserver(lockJapan).observe(document.body, {subtree:true, childList:true});
})();