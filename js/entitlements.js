(() => {
  const fixture = document.documentElement.dataset.entitlement;
  const tier = fixture === 'premium' ? 'PREMIUM' : 'FREE';
  window.NEXAL_ENTITLEMENT = Object.freeze({ tier, isPremium: tier === 'PREMIUM', source: fixture ? 'LOCAL_FIXTURE' : 'DEFAULT_SAFE_FREE' });
  window.NEXAL_CAN_ACCESS = (module, requested = 'full') => {
    if (window.NEXAL_ENTITLEMENT.isPremium) return true;
    const access = window.NEXAL_ACCESS_MANIFEST?.modules?.[module] || 'premium';
    return requested === 'preview' || access === 'free_full';
  };
})();
