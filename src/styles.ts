// ----------------------------------------------------------------------------
// All CSS for the site lives here as one string, injected into the page <head>.
// ----------------------------------------------------------------------------

export const styles = `
  :root {
    --bg: #0a0a0b; --panel: #141417; --line: #232327;
    --fg: #ededef; --muted: #8a8a93; --accent: #6ee7b7;
    /* GitHub-style heatmap scale */
    --hm0: #1b1b1f; --hm1: #0e4429; --hm2: #006d32; --hm3: #26a641; --hm4: #39d353;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--fg);
    font: 16px/1.6 ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace;
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; }
  header.hero { padding: 96px 0 56px; }
  .tag { color: var(--accent); font-size: 13px; letter-spacing: .08em; text-transform: uppercase; }
  h1 { font-size: clamp(34px, 6vw, 56px); line-height: 1.1; margin: 14px 0 18px; letter-spacing: -0.02em; }
  .sub { color: var(--muted); max-width: 60ch; font-size: 17px; }
  .outcomes { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin: 44px 0 0; }
  .outcome { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 16px; }
  .outcome b { display: block; font-size: 22px; color: var(--fg); }
  .outcome span { color: var(--muted); font-size: 12px; }
  section { padding: 24px 0 80px; }
  .sec-head { display: flex; align-items: baseline; justify-content: space-between; margin: 0 0 18px; }
  .sec-head h2 { font-size: 15px; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); margin: 0; font-weight: 600; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .panel { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 20px; min-height: 130px; display: flex; flex-direction: column; }
  .panel.span2 { grid-column: 1 / -1; }
  .panel h3 { margin: 0; font-size: 16px; }
  .panel .note { color: var(--muted); font-size: 13px; flex: 1; }
  .panel-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
  .badge { align-self: flex-start; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); border: 1px solid var(--line); border-radius: 999px; padding: 3px 10px; text-decoration: none; }
  a.badge:hover { color: var(--accent); border-color: var(--accent); }
  /* GitHub panel */
  .stats { display: flex; flex-wrap: wrap; gap: 22px; margin-bottom: 16px; }
  .stat b { display: block; font-size: 20px; line-height: 1.2; }
  .stat span { color: var(--muted); font-size: 12px; }
  .hm { display: flex; gap: 3px; overflow-x: auto; padding-bottom: 4px; }
  .hm-col { display: flex; flex-direction: column; gap: 3px; }
  .hm-d { width: 11px; height: 11px; border-radius: 2px; flex: none; }
  .gh-latest { color: var(--muted); font-size: 13px; margin-top: 14px; }
  .gh-latest a { color: var(--accent); text-decoration: none; }
  /* LeetCode panel */
  .lc-total { display: flex; align-items: baseline; gap: 8px; margin-bottom: 16px; }
  .lc-total b { font-size: 34px; line-height: 1; font-variant-numeric: tabular-nums; }
  .lc-total span { color: var(--muted); font-size: 13px; }
  .lc-breakdown { display: flex; flex-direction: column; gap: 9px; }
  .lc-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); }
  .lc-row b { margin-left: auto; color: var(--fg); font-variant-numeric: tabular-nums; }
  .lc-dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }
  .lc-dot.easy { background: #00b8a3; }
  .lc-dot.med { background: #ffc01e; }
  .lc-dot.hard { background: #ff375f; }
  .lc-streak { margin-top: 16px; color: var(--muted); font-size: 12px; }
  /* Shipping log panel */
  .ship { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 16px; }
  .ship-row { display: flex; align-items: center; gap: 8px; }
  .ship-dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }
  .ship-dot.shipped { background: var(--accent); }
  .ship-dot.building { background: #ffc01e; }
  .ship-dot.planned { background: var(--muted); }
  .ship-title { font-size: 14px; color: var(--fg); text-decoration: none; }
  a.ship-title:hover { color: var(--accent); }
  .ship-date { margin-left: auto; color: var(--muted); font-size: 11px; }
  .ship-blurb { color: var(--muted); font-size: 12px; margin: 3px 0 0 16px; }
  footer { color: var(--muted); font-size: 13px; padding: 0 0 60px; }
  footer a { color: var(--accent); text-decoration: none; }
  @media (max-width: 640px) { .outcomes, .grid { grid-template-columns: 1fr 1fr; } }
`;
