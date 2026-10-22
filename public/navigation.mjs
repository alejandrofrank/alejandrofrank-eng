export function initPortfolioNavigation(doc = document) {
  const header = doc.querySelector('.page-controls');
  if (!header || header.dataset.initialized) return;
  header.dataset.initialized = 'true';
  const win = doc.defaultView;
  const setFragment = link => {
    const url = new URL(link.href);
    link.setAttribute('href', url.pathname + url.search + win.location.hash);
  };
  const update = () => {
    doc.querySelectorAll('[data-keep-fragment]').forEach(setFragment);
  };
  // Role selection can replace history without a hashchange event. Read the
  // current fragment at activation, including keyboard and modified clicks.
  const keepFragment = event => {
    const link = event.target.closest('a[data-keep-fragment]');
    if (link) setFragment(link);
  };
  header.addEventListener('pointerdown', keepFragment, true);
  header.addEventListener('click', keepFragment, true);
  win.addEventListener('hashchange', update);
  win.addEventListener('pageshow', update);
  update();
}
