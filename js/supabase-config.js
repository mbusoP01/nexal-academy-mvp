// Browser-safe Supabase bootstrap. Public UI must remain usable when the CDN,
// project, or network is unavailable.
(() => {
  const SUPABASE_URL = 'https://szqpkxlatzvwcxpwmewt.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cXBreGxhdHp2d2N4cHdtZXd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4Njg4MjYsImV4cCI6MjA5NTQ0NDgyNn0.OFvGOyU0bZrDX-48PlXGGZeO7hhWJoXhb37JtTQ9pzY';
  window.supabaseClient = null;
  window.NEXAL_AUTH_BOOTSTRAP = { available: false, error: null };
  try {
    if (!window.supabase?.createClient) throw new Error('Account service library unavailable.');
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.NEXAL_AUTH_BOOTSTRAP.available = true;
  } catch (error) {
    window.NEXAL_AUTH_BOOTSTRAP.error = error;
    console.warn('[Nexal] account service unavailable; continuing as guest.', error.message);
  }
})();
