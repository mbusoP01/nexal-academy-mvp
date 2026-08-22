// Browser-safe Supabase bootstrap. Public UI must remain usable when the CDN,
// project, or network is unavailable.
(() => {
  const SUPABASE_URL = 'https://szqpkxlatzvwcxpwmewt.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cXBreGxhdHp2d2N4cHdtZXd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4Njg4MjYsImV4cCI6MjA5NTQ0NDgyNn0.OFvGOyU0bZrDX-48PlXGGZeO7hhWJoXhb37JtTQ9pzY';
  const AVATAR_SCHEME = 'private://avatars/';
  const LEGACY_AVATAR_PATH = '/storage/v1/object/public/avatars/';
  window.supabaseClient = null;
  window.NEXAL_AUTH_BOOTSTRAP = { available: false, error: null };

  const normalizeAvatarPath = value => String(value || '').replace(/^\/+/, '');
  const locatorFor = path => `${AVATAR_SCHEME}${normalizeAvatarPath(path)}`;

  try {
    if (!window.supabase?.createClient) throw new Error('Account service library unavailable.');
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const storageFrom = client.storage.from.bind(client.storage);

    function avatarPath(value) {
      const raw = String(value || '').trim();
      if (!raw) return null;
      if (raw.startsWith(AVATAR_SCHEME)) return normalizeAvatarPath(raw.slice(AVATAR_SCHEME.length));
      try {
        const url = new URL(raw, window.location.href);
        const projectOrigin = new URL(SUPABASE_URL).origin;
        if (url.origin === projectOrigin && url.pathname.includes(LEGACY_AVATAR_PATH)) {
          return normalizeAvatarPath(decodeURIComponent(url.pathname.split(LEGACY_AVATAR_PATH)[1] || ''));
        }
      } catch {}
      return null;
    }

    async function resolveAvatar(value, expiresIn = 3600) {
      const path = avatarPath(value);
      if (!path) return /^https:\/\//i.test(String(value || '')) ? String(value) : null;
      const { data, error } = await storageFrom('avatars').createSignedUrl(path, expiresIn);
      if (error || !data?.signedUrl) return null;
      return data.signedUrl;
    }

    // Existing Academy pages historically called getPublicUrl() after avatar uploads.
    // Keep that call-site compatible, but persist a private locator instead of a public URL.
    client.storage.from = bucketId => {
      const bucket = storageFrom(bucketId);
      if (bucketId === 'avatars') {
        bucket.getPublicUrl = path => ({ data: { publicUrl: locatorFor(path) } });
      }
      return bucket;
    };

    async function hydrateAvatarImage(img) {
      if (!(img instanceof HTMLImageElement) || img.dataset.nexalAvatarResolving === '1') return;
      const source = img.getAttribute('src');
      if (!avatarPath(source)) return;
      img.dataset.nexalAvatarResolving = '1';
      const signedUrl = await resolveAvatar(source);
      if (signedUrl) {
        img.src = signedUrl;
        delete img.dataset.nexalAvatarResolving;
        return;
      }
      img.removeAttribute('src');
      img.alt = img.alt || 'Avatar unavailable';
      const parent = img.parentElement;
      img.remove();
      if (parent && !parent.textContent.trim()) parent.textContent = '?';
    }

    function scanAvatars(root) {
      if (!root) return;
      if (root instanceof HTMLImageElement) hydrateAvatarImage(root);
      root.querySelectorAll?.('img').forEach(hydrateAvatarImage);
    }

    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(records => {
        for (const record of records) {
          if (record.type === 'attributes') hydrateAvatarImage(record.target);
          record.addedNodes.forEach(node => scanAvatars(node));
        }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => scanAvatars(document));
    else scanAvatars(document);

    window.supabaseClient = client;
    window.NEXAL_AVATAR = Object.freeze({ locatorFor, resolve: resolveAvatar, pathFrom: avatarPath });
    window.NEXAL_AUTH_BOOTSTRAP.available = true;
  } catch (error) {
    window.NEXAL_AUTH_BOOTSTRAP.error = error;
    console.warn('[Nexal] account service unavailable; continuing as guest.', error.message);
  }
})();
