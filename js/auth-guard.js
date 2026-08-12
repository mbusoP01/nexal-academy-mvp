// Shared authentication gate. It never leaves a protected route blank.
(() => {
  const AUTH_TIMEOUT_MS = 7000;
  const path = window.location.pathname.toLowerCase();
  const file = path.split('/').pop() || 'index.html';
  const publicRoute = ['', 'index.html', 'login.html', 'pricing.html', 'about.html', 'contact.html', 'auth-callback.html'].includes(file);
  const localFixture = window.location.hostname === 'localhost' && new URLSearchParams(window.location.search).has('fixture');

  function showAuthError(message) {
    document.body.innerHTML = `<main style="min-height:100vh;display:grid;place-items:center;padding:2rem;background:#fdfbf7;color:#002147;font-family:Inter,Arial,sans-serif"><section style="max-width:34rem;text-align:center"><p style="font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#2e8b57">Nexal Pathway</p><h1 style="font-size:2rem;margin:.75rem 0">Account service unavailable</h1><p style="line-height:1.6;color:#475569">${message}</p><div style="display:flex;gap:.75rem;justify-content:center;margin-top:1.5rem"><button type="button" id="nexal-auth-retry" style="padding:.75rem 1.2rem;border:0;border-radius:.7rem;background:#002147;color:#fff;font-weight:700">Retry</button><a href="index.html" style="padding:.75rem 1.2rem;border-radius:.7rem;border:1px solid #cbd5e1;color:#002147;text-decoration:none;font-weight:700">Return Home</a></div></section></main>`;
    document.getElementById('nexal-auth-retry')?.addEventListener('click', () => window.location.reload());
  }

  document.addEventListener('DOMContentLoaded', async () => {
    if (publicRoute || localFixture) return;
    const client = window.supabaseClient;
    if (!client) return showAuthError('Unable to connect to the account service right now. Your public learning pages remain available.');
    const loading = document.createElement('div');
    loading.id = 'nexal-auth-loading';
    loading.setAttribute('role', 'status');
    loading.style.cssText = 'position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:#fdfbf7;color:#002147;font:600 1rem Inter,Arial,sans-serif';
    loading.textContent = 'Preparing your learning space…';
    document.body.appendChild(loading);
    let result;
    try {
      result = await Promise.race([
        client.auth.getSession(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Account service timed out.')), AUTH_TIMEOUT_MS))
      ]);
    } catch (error) {
      loading.remove();
      return showAuthError('Unable to connect to the account service right now. Please retry when the service is available.');
    }
    const session = result?.data?.session;
    const error = result?.error;
    if (!session || error) {
      const next = `${window.location.pathname}${window.location.search}`;
      window.location.replace(`login.html?next=${encodeURIComponent(next)}`);
      return;
    }
    loading.remove();
    if (!file.includes('onboarding.html')) {
      try {
        const { data: profile } = await Promise.race([
          client.from('profiles').select('role, username').eq('id', session.user.id).single(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Profile lookup timed out.')), AUTH_TIMEOUT_MS))
        ]);
        if (!profile?.role) { window.location.replace('onboarding.html'); return; }
        const display = document.getElementById('user-display-name');
        if (display) display.textContent = profile.username || session.user.user_metadata?.full_name || 'Scholar';
      } catch (error) {
        showAuthError('Your session was found, but your learner profile could not be loaded.');
        return;
      }
    }
    const logout = document.getElementById('logout-btn');
    logout?.addEventListener('click', async event => { event.preventDefault(); try { await client.auth.signOut(); } finally { window.location.replace('login.html'); } });
  });
})();
