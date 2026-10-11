/** Two explicit views: the original homepage remains the default at /. */
export function appearanceSwitch(active: 'original' | 'tech'): string {
  return `<nav class="appearance-switch" aria-label="Appearance"><span class="appearance-label">Appearance</span><a href="/"${active === 'original' ? ' aria-current="true"' : ''}>Original</a><a href="/tech"${active === 'tech' ? ' aria-current="true"' : ''}>Tech</a></nav>`;
}

export const appearanceStyles = `
.appearance-switch { display:inline-flex; align-items:center; gap:3px; padding:4px; border:1px solid var(--line); border-radius:8px; background:var(--panel,var(--surface)); color:var(--fg); font:500 12px/1.4 var(--sans); }
.appearance-label { padding:0 9px; color:var(--muted); }
.appearance-switch a { display:inline-flex; align-items:center; justify-content:center; min-height:36px; padding:8px 12px; border-radius:5px; color:inherit; text-decoration:none; }
.appearance-switch a:hover { text-decoration:underline; text-underline-offset:3px; }
.appearance-switch a[aria-current] { background:var(--fg); color:var(--bg); }
.appearance-switch a:focus-visible { outline:2px solid var(--accent); outline-offset:3px; }
.original-appearance { position:absolute; top:22px; right:36px; }
.view-controls { display:flex; flex-wrap:wrap; align-items:center; gap:12px; }
.view-controls .mode-toggle { margin-left:0; }
@media(max-width:760px) { .original-appearance { right:22px; } }
@media(max-width:480px) { .view-controls { gap:8px; margin-top:6px; }.appearance-label { padding:0 6px; } }
@media print { .appearance-switch,.view-controls,.original-appearance { display:none; } }
`;
