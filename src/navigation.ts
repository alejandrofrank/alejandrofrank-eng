import { appearanceSwitch, portfolioHome, type PortfolioView } from './appearance';

export function portfolioProjects(view: PortfolioView, slug = ''): string {
  const hash = slug ? encodeURIComponent(slug) : 'projects';
  if (view === 'arcade') return '/play' + (slug ? '#' + hash : '');
  return view === 'original' ? '/#' + (slug ? 'project-' + hash : hash) : '/tech#' + hash;
}

export function portfolioNavigation(view: PortfolioView, section: 'home' | 'projects' | 'experience', projectSlug = '', currentPage?: string): string {
  const home = portfolioHome(view);
  return `<div class="page-controls" data-section="${section}"><a class="home-link" href="${home}" data-destination="home" aria-label="Home">← Home</a><div class="view-controls">${appearanceSwitch(view, projectSlug, currentPage)}</div></div>`;
}

export const navigationStyles = `
html { scroll-padding-top:16px; }
.page-controls { position:relative; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px 24px; padding:22px 0; }
.home-link { display:inline-flex; align-items:center; min-height:44px; color:var(--fg); font:500 14px var(--sans); text-decoration:underline; text-underline-offset:4px; }
.home-link:hover { color:var(--accent); }
.home-link:focus-visible { outline:2px solid var(--fg); outline-offset:4px; }
.page-controls .view-controls { flex-basis:auto; margin:0; width:auto; max-width:100%; }
.reading-guide { top:16px; }
.skip-link { z-index:30; }
@media print { .page-controls { display:none; } }
`;
