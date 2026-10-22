export function initPortfolioNavigation(doc = document) {
  const header = doc.querySelector('.portfolio-nav,.original-page-controls');
  if (!header || header.dataset.initialized) return;
  header.dataset.initialized = 'true';
  const win = doc.defaultView;
  const setFragment = link => {
    const url = new URL(link.href);
    link.setAttribute('href', url.pathname + url.search + win.location.hash);
  };
  const update = () => {
    const hash = win.location.hash.slice(1);
    const onHome = ['/', '/tech'].includes(win.location.pathname);
    const project = doc.getElementById('project-' + hash) || doc.querySelector(`[data-preview="${win.CSS.escape(hash)}"]`);
    const section = onHome && hash === 'contact' ? 'contact'
      : onHome && (hash === 'projects' || hash.startsWith('project-') || project) ? 'projects' : header.dataset.section;
    header.querySelectorAll('[data-destination]').forEach(link => {
      if (link.dataset.destination === section) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    doc.querySelectorAll('[data-keep-fragment]').forEach(setFragment);
  };
  // Role selection can replace history without a hashchange event. Read the
  // current fragment at activation, including keyboard and modified clicks.
  const keepFragment = event => {
    const link = event.target.closest('a[data-keep-fragment]');
    if (link) setFragment(link);
  };
  header.addEventListener('pointerdown', keepFragment, true);
  header.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    if (link.hasAttribute('data-keep-fragment')) { keepFragment(event); return; }
    const url = new URL(link.href);
    if (url.pathname !== win.location.pathname || !url.hash) return;
    let anchor;
    try { anchor = decodeURIComponent(url.hash.slice(1)); } catch { return; }
    let target = doc.getElementById(anchor);
    while (target) {
      if (target.tagName === 'DETAILS') target.open = true;
      target = target.parentElement;
    }
  }, true);
  win.addEventListener('hashchange', update);
  win.addEventListener('pageshow', update);
  if (header.classList.contains('portfolio-nav') && win.ResizeObserver) new win.ResizeObserver(() => {
    doc.documentElement.style.setProperty('--navigation-height', header.getBoundingClientRect().height + 'px');
  }).observe(header);
  update();
}
