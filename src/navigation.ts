import { appearanceSwitch, portfolioHome, type PortfolioView } from './appearance';
import { SITE } from './content';

export function portfolioProjects(view: PortfolioView, slug = ''): string {
  const hash = slug ? encodeURIComponent(slug) : 'projects';
  if (view === 'arcade') return '/play' + (slug ? '#' + hash : '');
  return view === 'original' ? '/#' + (slug ? 'project-' + hash : hash) : '/tech#' + hash;
}

export function portfolioNavigation(view: PortfolioView, section: 'home' | 'projects' | 'experience', projectSlug = '', currentPage?: string): string {
  const home = portfolioHome(view);
  if (view === 'original') {
    return `<div class="original-page-controls" data-section="${section}"><a class="original-home" href="${home}" data-destination="home" aria-label="Home">← Home</a><div class="view-controls">${appearanceSwitch(view, projectSlug, currentPage)}</div></div>`;
  }
  const links = [
    ['home', 'Home', home],
    ['projects', 'Projects', portfolioProjects(view)],
    ['experience', 'Experience', '/timeline'],
    ['contact', 'Contact', home + '#contact'],
  ];
  return `<header class="portfolio-nav" data-section="${section}"><nav class="portfolio-links" aria-label="Main navigation">${links.map(([id, label, href]) => `<a href="${href}" data-destination="${id}"${id === 'home' ? ' class="site-name" aria-label="Home"' : ''}${section === id ? ' aria-current="page"' : ''}>${id === 'home' ? '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m3 9 7-6 7 6v8h-5v-5H8v5H3Z"/></svg>' : ''}${label}${id === 'home' ? `<span class="portfolio-owner">/ ${SITE.name}</span>` : ''}</a>`).join('')}</nav><div class="view-controls">${appearanceSwitch(view, projectSlug, currentPage)}</div></header>`;
}

export const navigationStyles = `
:root { --navigation-height:78px; }
html { scroll-padding-top:calc(var(--navigation-height) + 16px); }
.portfolio-nav { position:sticky; top:0; z-index:20; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:8px 18px; padding:12px 0; border-bottom:1px solid var(--line); background:var(--bg); }
html:has(body[data-view=original]) { --navigation-height:0px; }
.original-page-controls { position:relative; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px 24px; padding:22px 0; }
.original-home { display:inline-flex; align-items:center; min-height:44px; color:var(--fg); font:500 14px var(--sans); text-decoration:underline; text-underline-offset:4px; }
.original-home:hover { color:var(--accent); }
.original-home:focus-visible { outline:2px solid var(--fg); outline-offset:4px; }
.original-page-controls .view-controls { flex-basis:auto; margin:0; width:auto; max-width:100%; }
.portfolio-links { display:flex; align-items:center; gap:4px; }
.portfolio-links a { display:inline-flex; align-items:center; justify-content:center; gap:7px; min-height:44px; padding:0 12px; border-radius:6px; color:var(--muted); text-decoration:none; font:500 13px/1.2 var(--sans); }
.portfolio-links svg { width:17px; height:17px; flex:none; }
.portfolio-owner { color:var(--muted); font-size:12px; }
@media(max-width:1100px) { .portfolio-owner { display:none; } }
.portfolio-links a:hover,.portfolio-links a[aria-current] { color:var(--fg); background:color-mix(in srgb,var(--fg) 8%,transparent); }
.portfolio-links a[aria-current] { text-decoration:underline; text-underline-offset:5px; }
.portfolio-nav a:focus-visible { outline:2px solid var(--fg); outline-offset:2px; }
.portfolio-nav .view-controls { flex-basis:auto; margin:0; width:auto; }
.reading-guide { top:calc(var(--navigation-height) + 16px); }
.skip-link { z-index:30; }
@media(max-width:760px) {
  :root { --navigation-height:122px; }
  .portfolio-nav { justify-content:center; padding:8px 0; }
  .portfolio-links,.portfolio-nav .view-controls { width:100%; }
  .portfolio-links a { flex:1; padding:0 8px; }
  .portfolio-nav .view-switcher { width:100%; justify-content:center; }
  .portfolio-nav .view-switcher-label { display:none; }
  .portfolio-nav .view-choices { width:100%; }
  .portfolio-nav .view-choice { flex:1; }
}
@media(max-height:500px) { .portfolio-nav { position:relative; } html { scroll-padding-top:16px; } .reading-guide { top:16px; } }
@media print { .portfolio-nav,.original-page-controls { display:none; } }
`;
