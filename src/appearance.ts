type PortfolioView = 'original' | 'tech' | 'arcade';

const views: { id: PortfolioView; label: string; description: string; icon: string }[] = [
  { id: 'original', label: 'Original', description: 'The green portfolio', icon: '<rect x="3" y="3" width="14" height="14" rx="4"/><path d="M3 9h14M9 9v8"/>' },
  { id: 'tech', label: 'Tech', description: 'Explore the projects and systems', icon: '<path d="m4 5 5 5-5 5m8 0h5"/>' },
  { id: 'arcade', label: 'Arcade', description: 'Play and explore project game concepts', icon: '<path d="M6 6h8c2 0 3 2 3.5 4l1 5c.3 2-1.5 3-3 1l-2-2h-7l-2 2c-1.5 2-3.3 1-3-1l1-5C3 8 4 6 6 6Z"/><path d="M6 8v4m-2-2h4m5 0h.01m2 2h.01"/>' },
];

/** Explicit navigation, not a saved preference: / remains the green homepage. */
export function appearanceSwitch(active: PortfolioView, projectSlug = ''): string {
  const hash = projectSlug ? '#' + encodeURIComponent(projectSlug) : '';
  const destinations = { original: '/' + hash, tech: '/tech' + hash, arcade: '/play' + hash };
  return `<nav class="view-switcher" aria-label="Portfolio view"><span class="view-switcher-label" aria-hidden="true">View</span><div class="view-choices">${views.map(view => `<a class="view-choice" data-view="${view.id}" href="${destinations[view.id]}" title="${view.description}"${active === view.id ? ' aria-current="page"' : ''}><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${view.icon}</svg><span>${view.label}</span></a>`).join('')}</div></nav>`;
}

export const appearanceStyles = `
.view-switcher { display:inline-flex; align-items:center; gap:12px; max-width:100%; color:var(--fg); font:500 12px/1.2 var(--sans); }
.view-switcher-label { color:var(--muted); font:10px/1 var(--mono); letter-spacing:.08em; text-transform:uppercase; }
.view-choices { display:flex; padding:4px; gap:3px; border:1px solid var(--line); border-radius:12px; background:color-mix(in srgb,var(--bg) 88%,transparent); }
.view-choice { display:inline-flex; align-items:center; justify-content:center; gap:7px; min-height:40px; padding:0 12px; border:1px solid transparent; border-radius:8px; color:var(--muted); text-decoration:none; white-space:nowrap; }
.view-choice svg { width:17px; height:17px; flex:none; }
.view-choice[data-view=original] { --view-color:#c1d4a5; }
.view-choice[data-view=tech] { --view-color:#a9caff; }
.view-choice[data-view=arcade] { --view-color:#dcc0f6; }
.view-choice:hover { color:var(--fg); background:color-mix(in srgb,var(--fg) 7%,transparent); text-decoration:none; }
.view-choice[aria-current=page] { color:var(--view-color); border-color:color-mix(in srgb,var(--view-color) 32%,transparent); background:color-mix(in srgb,var(--view-color) 15%,var(--bg)); box-shadow:0 1px 3px #0002; }
.view-choice:focus-visible { outline:2px solid var(--fg); outline-offset:3px; }
.original-appearance { display:flex; justify-content:flex-end; padding-top:22px; position:relative; z-index:2; }
.view-controls { display:flex; align-items:center; min-width:0; }
@media(max-width:780px) { .view-controls { flex-basis:100%; }.view-controls .view-switcher { margin-left:auto; } }
@media(max-width:480px) {
  .view-controls { width:100%; margin-top:8px; }
  .view-switcher { width:100%; gap:0; }
  .view-switcher-label { display:none; }
  .view-choices { width:100%; }
  .view-choice { flex:1; min-height:44px; padding:0 8px; }
  .original-appearance { padding-top:18px; }
}
@media print { .view-switcher,.view-controls,.original-appearance { display:none; } }
`;
