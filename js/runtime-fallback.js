// Last-resort startup guard. It only appears for an uncaught fatal exception.
(() => {
  window.addEventListener('error', event => {
    // Browser resource failures (fonts, analytics, optional CDN styles) have an
    // empty message and must never replace the usable public shell.
    if (!event.message) return;
    if (document.body?.children?.length) {
      const existing = document.getElementById('nexal-runtime-fallback');
      if (existing) return;
      const panel = document.createElement('aside');
      panel.id = 'nexal-runtime-fallback';
      panel.setAttribute('role', 'alert');
      panel.style.cssText = 'position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:2rem;background:#fdfbf7;color:#002147;font:16px Inter,Arial,sans-serif';
      panel.innerHTML = '<div style="max-width:32rem;text-align:center"><h1>Nexal Pathway could not finish loading.</h1><p style="color:#475569;line-height:1.6">The learning shell is safe. Retry the page or return home while we reconnect the service.</p><button type="button" id="nexal-runtime-reload" style="padding:.75rem 1.2rem;border:0;border-radius:.7rem;background:#002147;color:#fff;font-weight:700">Reload</button> <a href="index.html" style="display:inline-block;margin-left:.5rem;color:#002147;font-weight:700">Return Home</a></div>';
      document.body.appendChild(panel);
      document.getElementById('nexal-runtime-reload')?.addEventListener('click', () => window.location.reload());
    }
    console.warn('[Nexal] recovered from startup exception:', event.message);
  });
  window.addEventListener('unhandledrejection', event => console.warn('[Nexal] recovered from rejected startup task:', event.reason?.message || event.reason));
})();
