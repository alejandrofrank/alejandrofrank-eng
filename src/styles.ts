// ----------------------------------------------------------------------------
// All CSS for the site lives here as one string, injected into the page <head>.
// ----------------------------------------------------------------------------

export const styles = `
  :root {
    --bg: #0a0a0b; --panel: #141417; --line: #232327;
    --fg: #ededef; --muted: #8a8a93; --accent: #6ee7b7;
    /* GitHub-style heatmap scale */
    --hm0: #1b1b1f; --hm1: #0e4429; --hm2: #006d32; --hm3: #26a641; --hm4: #39d353;
    color-scheme: dark;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--fg);
    font: 16px/1.6 ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace;
    -webkit-font-smoothing: antialiased;
    -webkit-text-size-adjust: 100%; text-size-adjust: 100%;
  }
  .wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 1; }
  .rain { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
  .topnav { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 22px 0; position: relative; z-index: 2; }
  .topnav-brand { color: var(--fg); text-decoration: none; font-weight: 600; letter-spacing: -0.01em; }
  .topnav-brand:hover { color: var(--accent); }
  .topnav-links { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
  .topnav-links a { color: var(--muted); text-decoration: none; font-size: 14px; }
  .topnav-links a:hover { color: var(--accent); }
  /* Primary CTA — the one filled button in the nav (LINKS entry with cta: "primary"). */
  .topnav-links a.cta {
    color: var(--bg); background: var(--accent); border: 1px solid var(--accent);
    font-size: 13px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase;
    padding: 9px 16px; border-radius: 999px; white-space: nowrap; margin-left: 4px;
    box-shadow: 0 0 0 4px rgba(110,231,183,.10), 0 6px 18px rgba(110,231,183,.20);
    transition: background .15s, transform .15s, box-shadow .15s;
  }
  .topnav-links a.cta:hover {
    color: var(--bg); background: #8df0cb; transform: translateY(-1px);
    box-shadow: 0 0 0 5px rgba(110,231,183,.16), 0 10px 26px rgba(110,231,183,.30);
  }
  .topnav-links a.cta:active { transform: translateY(0); box-shadow: 0 0 0 3px rgba(110,231,183,.14); }
  .topnav-links a.cta:focus-visible { outline: 2px solid var(--fg); outline-offset: 3px; }
  /* Secondary CTA (cta: "secondary") — same pill, outlined instead of filled.
     Keeps the shape and caps of the primary so they read as a pair, but drops
     the fill, the glow and a step of weight: above the plain links, below the
     one button that matters. */
  .topnav-links a.cta.cta-alt {
    color: var(--accent); background: transparent; border-color: rgba(110,231,183,.40);
    font-weight: 600; letter-spacing: .04em; padding: 8px 14px; box-shadow: none;
  }
  .topnav-links a.cta.cta-alt:hover {
    color: var(--accent); background: rgba(110,231,183,.10); border-color: var(--accent);
    box-shadow: none;
  }
  .topnav-links a.cta.cta-alt:active { transform: translateY(0); background: rgba(110,231,183,.16); box-shadow: none; }
  .cta-arrow { display: inline-block; transition: transform .15s; }
  .topnav-links a.cta:hover .cta-arrow { transform: translateX(3px); }
  .topnav-links a.cta.cta-alt:hover .cta-arrow { transform: translate(2px, -2px); }
  @media (prefers-reduced-motion: reduce) {
    .topnav-links a.cta, .cta-arrow { transition: none; }
    .topnav-links a.cta:hover { transform: none; }
    .topnav-links a.cta:hover .cta-arrow,
    .topnav-links a.cta.cta-alt:hover .cta-arrow { transform: none; }
    .venture-cta { transition: none; }
    .venture-cta:hover .cta-arrow { transform: none; }
  }
  .email-pop { position: relative; }
  .email-pop > summary { list-style: none; cursor: pointer; color: var(--muted); font-size: 14px; }
  .email-pop > summary::-webkit-details-marker { display: none; }
  .email-pop > summary:hover, .email-pop[open] > summary { color: var(--accent); }
  .email-box { position: absolute; top: 150%; right: 0; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 9px 11px; display: flex; align-items: center; gap: 10px; white-space: nowrap; z-index: 5; box-shadow: 0 8px 24px rgba(0,0,0,.45); }
  .email-box a { color: var(--fg); text-decoration: none; font-size: 14px; }
  .email-box a:hover { color: var(--accent); }
  .email-copy { font: inherit; font-size: 12px; background: var(--bg); border: 1px solid var(--line); color: var(--muted); border-radius: 6px; padding: 3px 9px; cursor: pointer; }
  .email-copy:hover { color: var(--accent); border-color: var(--accent); }
  header.hero { padding: 64px 0 56px; container-type: inline-size; position: relative; overflow: hidden; }
  .mobius { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
  .hero-content { position: relative; z-index: 1; }
  .tag { color: var(--accent); font-size: 13px; letter-spacing: .08em; text-transform: uppercase; }
  h1 { font-size: clamp(34px, 6vw, 56px); line-height: 1.1; margin: 14px 0 18px; letter-spacing: -0.02em; }
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
  /* Sized to the hero container (71 cols wide) so it always fits — no scrollbar. */
  .banner { color: var(--accent); font-size: min(2.05cqw, 11px); line-height: 1.05; margin: 16px 0 22px; overflow: hidden; white-space: pre; }
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
  .panel-head h3 { display: flex; align-items: center; }
  .panel-icon { display: inline-block; width: 1.5em; color: var(--accent); opacity: .8; font-weight: 400; }
  .badge { align-self: flex-start; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); border: 1px solid var(--line); border-radius: 999px; padding: 3px 10px; text-decoration: none; }
  a.badge:hover { color: var(--accent); border-color: var(--accent); }
  /* GitHub panel */
  .stats { display: flex; flex-wrap: wrap; gap: 22px; margin-bottom: 16px; }
  .stat b { display: block; font-size: 20px; line-height: 1.2; }
  .stat span { color: var(--muted); font-size: 12px; }
  .hm { display: flex; gap: 3px; width: 100%; }
  .hm-col { display: flex; flex-direction: column; gap: 3px; flex: 1 1 0; min-width: 0; }
  .hm-d { width: 100%; aspect-ratio: 1; border-radius: 2px; }
  .gh-today { font-size: 12px; margin-bottom: 14px; letter-spacing: .02em; }
  .gh-today.on { color: var(--accent); }
  .gh-today.off { color: #ffb020; }
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
  /* Service status panel */
  .svc { display: flex; flex-direction: column; gap: 11px; flex: 1; }
  .svc-row { display: flex; align-items: center; gap: 9px; font-size: 13px; }
  .svc-dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }
  .svc-dot.up { background: var(--accent); box-shadow: 0 0 6px rgba(110,231,183,.6); }
  .svc-dot.down { background: #ff375f; box-shadow: 0 0 6px rgba(255,55,95,.6); }
  .svc-name { color: var(--fg); text-decoration: none; }
  a.svc-name:hover { color: var(--accent); }
  .svc-state { margin-left: auto; font-weight: 400; font-size: 12px; }
  .svc-state.up { color: var(--accent); }
  .svc-state.down { color: #ff375f; }
  .svc-all.up { color: var(--accent); border-color: rgba(110,231,183,.45); }
  .svc-all.down { color: #ff375f; border-color: rgba(255,55,95,.45); }
  .svc-note { color: var(--muted); font-size: 11px; margin-top: 14px; }
  /* Bakiano venture section — full-width block inside the dashboard grid,
     directly under the GitHub card. Deliberately louder than a .panel: accent
     hairline along the top, tinted ground, its own type scale. */
  .venture {
    grid-column: 1 / -1; position: relative; overflow: hidden;
    background: linear-gradient(163deg, rgba(110,231,183,.075), rgba(20,20,23,0) 52%), var(--panel);
    border: 1px solid rgba(110,231,183,.22); border-radius: 16px;
    padding: 24px 24px 26px; margin: 0;
  }
  .venture::before {
    content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent); opacity: .75;
  }
  .venture-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .venture-top .tag { font-size: 11px; }
  .badge.venture-badge { color: var(--accent); border-color: rgba(110,231,183,.45); align-self: auto; }
  .venture-name { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin: 14px 0 0; font-size: 30px; letter-spacing: -0.02em; line-height: 1.1; }
  .venture-name a { color: var(--fg); text-decoration: none; }
  .venture-name a:hover { color: var(--accent); }
  .venture-host { font-size: 12px; font-weight: 400; letter-spacing: .04em; color: var(--muted); }
  .venture-headline { margin: 10px 0 0; font-size: 18px; color: var(--accent); letter-spacing: -0.01em; }
  .venture-blurb { margin: 10px 0 0; color: var(--muted); font-size: 14px; max-width: 68ch; }
  .stats.venture-stats { margin: 22px 0 4px; gap: 26px; }
  .venture-label { margin: 22px 0 12px; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
  /* Datasets — four chips, the shipped one badged. */
  .vsets { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .vset { background: rgba(10,10,11,.5); border: 1px solid var(--line); border-radius: 10px; padding: 12px; }
  .vset.live { border-color: rgba(110,231,183,.32); }
  .vset-name { display: flex; align-items: center; gap: 7px; font-size: 13px; color: var(--fg); }
  .vset-live { font-size: 9px; letter-spacing: .08em; text-transform: uppercase; color: var(--bg); background: var(--accent); border-radius: 999px; padding: 1px 6px; }
  .vset-blurb { color: var(--muted); font-size: 11px; margin-top: 5px; line-height: 1.45; }
  /* Products built on the data. */
  .vprods { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 14px 22px; }
  .vprod-head { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
  .vprod-head b { font-size: 14px; }
  .vprod-head span { font-size: 11px; letter-spacing: .05em; text-transform: uppercase; color: var(--accent); opacity: .75; }
  .vprod-blurb { color: var(--muted); font-size: 12px; margin-top: 3px; line-height: 1.5; }
  .venture-cta {
    display: inline-flex; align-items: center; gap: 7px; margin-top: 24px;
    color: var(--accent); background: transparent; border: 1px solid rgba(110,231,183,.40);
    font-size: 13px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase;
    padding: 9px 16px; border-radius: 999px; text-decoration: none;
    transition: background .15s, border-color .15s;
  }
  .venture-cta:hover { background: rgba(110,231,183,.10); border-color: var(--accent); }
  .venture-cta:hover .cta-arrow { transform: translate(2px, -2px); }
  .venture-cta:focus-visible { outline: 2px solid var(--fg); outline-offset: 3px; }
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
  @media (max-width: 640px) {
    .wrap { padding: 0 16px; }
    .topnav { padding: 18px 0; gap: 12px; }
    .topnav-links { gap: 16px; }
    .topnav-links a.cta { padding: 10px 15px; margin-left: 0; }
    .topnav-links a.cta.cta-alt { padding: 9px 13px; }
    header.hero { padding: 40px 0 36px; }
    section { padding: 16px 0 56px; }
    .outcomes { grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 32px; }
    .grid { grid-template-columns: 1fr; }
    .venture { padding: 20px 18px 22px; border-radius: 14px; }
    .venture-name { font-size: 25px; }
    .venture-headline { font-size: 16px; }
    .stats.venture-stats { gap: 18px; }
    .vsets { grid-template-columns: 1fr 1fr; }
    .vprods { grid-template-columns: 1fr; gap: 14px; }
    .venture-cta { width: 100%; justify-content: center; }
    .stats { gap: 16px; }
    /* heatmap: show the most recent ~6 months, larger cells */
    .hm, .hm-col { gap: 2px; }
    .hm-col:nth-child(-n + 27) { display: none; }
    .email-box { max-width: calc(100vw - 32px); white-space: normal; flex-wrap: wrap; }
    .email-box a { word-break: break-all; }
  }
  @media (pointer: coarse) {
    .email-copy { padding: 6px 12px; }
  }
`;
