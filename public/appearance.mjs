// The server saves explicit picker choices. Project selection must preserve that
// choice parameter instead of replacing the link with an ordinary navigation URL.
export function setAppearanceProject(slug) {
  const hash = slug ? '#' + encodeURIComponent(slug) : '';
  const paths = { original: '/', tech: '/tech', arcade: '/play' };
  document.querySelectorAll('.view-choice[data-view]').forEach(link => {
    const path = paths[link.dataset.view];
    if (path) link.setAttribute('href', path + '?view=' + link.dataset.view + hash);
  });
}

// A page restored from the back/forward cache may predate a later picker choice.
// Reload only a stale skin; ordinary Back keeps games and role progress intact.
export function syncAppearance(win = window) {
  const saved = win.document.cookie.split('; ').find(item => item.startsWith('portfolio_view='))?.split('=')[1];
  if (['original', 'tech', 'arcade'].includes(saved) && win.document.body.dataset.view && saved !== win.document.body.dataset.view) {
    win.location.reload();
  }
}
window.addEventListener('pageshow', () => syncAppearance());

const projects = [...document.querySelectorAll('.project-dropdown[id]')];
if (projects.length) {
  const fromHash = () => {
    const hash = location.hash.slice(1);
    const project = projects.find(item => item.id === hash || item.id === 'project-' + hash);
    setAppearanceProject(project ? project.id.slice('project-'.length) : '');
  };
  fromHash();
  window.addEventListener('hashchange', fromHash);
  projects.forEach(project => project.addEventListener('toggle', () => {
    const open = projects.find(item => item.open);
    setAppearanceProject(open ? open.id.slice('project-'.length) : '');
  }));
}
