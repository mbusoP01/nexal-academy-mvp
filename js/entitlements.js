(() => {
  const FREE = Object.freeze({ tier: 'FREE', isPremium: false, source: 'DEFAULT_SAFE_FREE', status: 'active', expiresAt: null });

  function publish(next) {
    const state = Object.freeze({ ...FREE, ...next, isPremium: next?.tier === 'PREMIUM' && next?.status === 'active' });
    window.NEXAL_ENTITLEMENT = state;
    window.dispatchEvent(new CustomEvent('nexal:entitlement-ready', { detail: state }));
    return state;
  }

  window.NEXAL_ENTITLEMENT = FREE;
  window.NEXAL_CAN_ACCESS = (module, requested = 'full') => {
    if (window.NEXAL_ENTITLEMENT?.isPremium) return true;
    const access = window.NEXAL_ACCESS_MANIFEST?.modules?.[module] || 'premium';
    return requested === 'preview' || access === 'free_full';
  };

  window.NEXAL_ENTITLEMENT_READY = (async () => {
    const fixtureTier = window.location.hostname === 'localhost' ? new URLSearchParams(window.location.search).get('fixture') : null;
    const localFixture = document.documentElement.dataset.entitlement || fixtureTier;
    if (localFixture === 'premium') {
      return publish({ tier: 'PREMIUM', status: 'active', source: 'LOCAL_FIXTURE', expiresAt: null });
    }

    const client = window.supabaseClient;
    if (!client) return publish({ source: 'SUPABASE_UNAVAILABLE' });

    try {
      const { data: { session }, error: sessionError } = await client.auth.getSession();
      if (sessionError || !session?.user?.id) return publish({ source: 'NO_AUTHENTICATED_SESSION' });

      const { data, error } = await client
        .from('entitlements')
        .select('tier,status,source,expires_at')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.warn('[Nexal] entitlement lookup failed; using Free safely:', error.message);
        return publish({ source: 'ENTITLEMENT_LOOKUP_FAILED' });
      }
      if (!data) return publish({ source: 'NO_PREMIUM_ENTITLEMENT' });

      const expiresAt = data.expires_at || null;
      const expired = expiresAt ? new Date(expiresAt).getTime() <= Date.now() : false;
      const activePremium = data.tier === 'PREMIUM' && data.status === 'active' && !expired;
      return publish({
        tier: activePremium ? 'PREMIUM' : 'FREE',
        status: activePremium ? 'active' : (data.status || 'inactive'),
        source: data.source || 'SUPABASE_ENTITLEMENT',
        expiresAt
      });
    } catch (error) {
      console.warn('[Nexal] entitlement bootstrap failed; using Free safely:', error.message);
      return publish({ source: 'ENTITLEMENT_BOOTSTRAP_FAILED' });
    }
  })();
})();
