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
  doc.addEventListener('pointerdown', keepFragment, true);
  doc.addEventListener('click', keepFragment, true);
  win.addEventListener('hashchange', update);
  win.addEventListener('pageshow', update);
  update();
}

export function initHomeSections(doc = document) {
  const win = doc.defaultView;
  if (win.location.pathname !== '/' || doc.body.dataset.homeSections) return;
  doc.body.dataset.homeSections = 'true';
  const openSection = () => {
    let anchor;
    try { anchor = decodeURIComponent(win.location.hash.slice(1)); } catch { return; }
    const target = doc.getElementById(anchor) || doc.getElementById('project-' + anchor)
      || (anchor === 'work' ? doc.getElementById('projects') : null);
    if (!target) return;
    let section = target.closest('details');
    let opened = false;
    while (section) {
      if (!section.open) { section.open = true; opened = true; }
      section = section.parentElement?.closest('details');
    }
    if (opened || anchor === 'work') target.scrollIntoView({ block: 'start' });
  };
  win.addEventListener('hashchange', openSection);
  openSection();
}
