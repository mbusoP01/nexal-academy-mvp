(() => {
  const oldName = 'Nexal Academy';
  const product = 'Nexal Pathway';
  const apply = () => {
    document.title = document.title.replace(oldName, product);
    document.querySelectorAll('[data-brand-name]').forEach(el => { el.textContent = product; });
    document.querySelectorAll('a, h1, h2, h3, p, span, small, title').forEach(el => {
      if (el.children.length === 0 && el.textContent.includes(oldName)) el.textContent = el.textContent.replaceAll(oldName, product);
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true }); else apply();
})();
