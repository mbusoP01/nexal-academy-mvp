(() => {
  const oldName = 'Nexal Academy';
  const product = 'Nexal Pathway';
  const currentScriptUrl = document.currentScript?.src || '';

  const applyBrand = () => {
    document.title = document.title.replace(oldName, product);
    document.querySelectorAll('[data-brand-name]').forEach(el => { el.textContent = product; });
    document.querySelectorAll('a, h1, h2, h3, p, span, small, title').forEach(el => {
      if (el.children.length === 0 && el.textContent.includes(oldName)) el.textContent = el.textContent.replaceAll(oldName, product);
    });
  };

  function applyPlan(state) {
    if (!state) return;
    const badge = document.getElementById('plan-badge');
    if (badge) {
      badge.textContent = state.isPremium ? 'PREMIUM' : 'FREE';
      badge.setAttribute('data-plan', state.tier);
    }

    document.querySelectorAll('[data-plan-label]').forEach(el => {
      el.textContent = state.isPremium ? 'PREMIUM' : 'FREE';
    });

    if (state.isPremium) {
      document.querySelectorAll('p').forEach(el => {
        if (el.children.length === 0 && el.textContent.trim() === 'FREE PLAN') el.textContent = 'PREMIUM PLAN';
      });
      document.querySelectorAll('a[href="pricing.html"]').forEach(link => {
        const text = link.textContent.trim().toLowerCase();
        if (text.includes('explore premium') || text.includes('compare plans') || text.includes('unlock')) {
          link.textContent = 'Premium active';
          link.setAttribute('aria-label', 'Premium access is active on this account');
        }
      });
      document.querySelectorAll('h2').forEach(el => {
        if (el.children.length === 0 && el.textContent.trim() === 'Unlock the complete Pathway') {
          el.textContent = 'Your complete Pathway is unlocked';
        }
      });
    }
  }

  async function ensureEntitlement() {
    try {
      if (!window.NEXAL_ENTITLEMENT_READY && window.supabaseClient && currentScriptUrl) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = new URL('entitlements.js', currentScriptUrl).href;
          script.onload = resolve;
          script.onerror = () => reject(new Error('Entitlement helper could not load.'));
          document.head.appendChild(script);
        });
      }
      const state = await (window.NEXAL_ENTITLEMENT_READY || Promise.resolve(window.NEXAL_ENTITLEMENT));
      applyPlan(state);
    } catch (error) {
      console.warn('[Nexal] plan UI fell back to Free:', error.message);
      applyPlan(window.NEXAL_ENTITLEMENT || { tier: 'FREE', isPremium: false });
    }
  }

  const run = () => {
    applyBrand();
    ensureEntitlement();
  };

  window.addEventListener('nexal:entitlement-ready', event => applyPlan(event.detail));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true }); else run();
})();
