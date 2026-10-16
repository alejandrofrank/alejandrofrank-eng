// Links work without JavaScript. Enhancement carries the selected project across views.
export function setAppearanceProject(slug) {
  const hash = slug ? '#' + encodeURIComponent(slug) : '';
  const paths = { original: '/', tech: '/tech', arcade: '/play' };
  document.querySelectorAll('.view-choice[data-view]').forEach(link => {
    const path = paths[link.dataset.view];
    if (path) link.setAttribute('href', path + hash);
  });
}

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
