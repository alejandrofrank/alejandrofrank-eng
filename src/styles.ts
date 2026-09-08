// ----------------------------------------------------------------------------
// All CSS for the site lives here as one string, injected into every page.
//
// The look: a warm ink ground with a faint blueprint grid, cream and orange
// blocks with chamfered corners, Inter Tight for words, JetBrains Mono for
// labels and numbers. Colours are "on-surface" tokens — --fg / --muted /
// --line / --panel / --accent are defined once for the ink ground and
// re-scoped by .on-cream and .on-orange, so any component reads correctly on
// whichever block it lands on.
// ----------------------------------------------------------------------------

export const styles = `
  :root {
    --ink: #2b2b29; --ink2: #33332f; --ink3: #3d3d39;
    --cream: #e9e2d3; --cream2: #e2dac9; --sand: #d8cdb4;
    --orange: #f4551d; --orange2: #ea4f1a; --near: #16150f;
    /* on-surface tokens: the ink ground */
    --bg: var(--ink); --panel: var(--ink2); --line: var(--ink3);
    --fg: var(--cream); --muted: rgba(233,226,211,.55); --dim: rgba(233,226,211,.26);
    --accent: var(--orange);
    /* contribution heatmap, orange scale on cream */
    --hm0: rgba(22,21,15,.07); --hm1: #f6c3ab; --hm2: #f7935f; --hm3: #f4551d; --hm4: #b4380e;
    --sans: "Inter Tight", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    --mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    --ease-out: cubic-bezier(.23, 1, .32, 1);
    --ease-in-out: cubic-bezier(.77, 0, .175, 1);
    --c: 13px; /* chamfer size */
    color-scheme: dark;
  }
  .on-cream {
    --bg: var(--cream); --panel: var(--cream2); --line: rgba(22,21,15,.16);
    --fg: var(--near); --muted: rgba(22,21,15,.58); --dim: rgba(22,21,15,.22);
    --accent: var(--orange);
    background: var(--bg); color: var(--fg); color-scheme: light;
  }
  .on-orange {
    --bg: var(--orange); --panel: rgba(22,21,15,.09); --line: rgba(22,21,15,.26);
    --fg: var(--near); --muted: rgba(22,21,15,.66); --dim: rgba(22,21,15,.3);
    --accent: var(--near);
    background: var(--bg); color: var(--fg); color-scheme: light;
  }

  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
  body {
    margin: 0; min-height: 100dvh; background: var(--ink); color: var(--cream);
    font: 400 15px/1.55 var(--sans); -webkit-font-smoothing: antialiased;
    /* faint blueprint grid behind everything */
    background-image:
      linear-gradient(to right, rgba(255,255,255,.045) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,.045) 1px, transparent 1px);
    background-size: 84px 84px; background-position: center top;
  }
  h1, h2, h3 { font-weight: 600; letter-spacing: -0.02em; }
  .wrap { max-width: 1000px; margin: 0 auto; padding: 0 24px; }
  .wrap.narrow { max-width: 760px; }
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

  /* Type utilities */
  .label { font: 500 10px/1 var(--mono); text-transform: uppercase; letter-spacing: .18em; }
  .badge { font: 500 10px/1 var(--mono); text-transform: uppercase; letter-spacing: .12em; color: var(--muted); text-decoration: none; }
  .badge.handle { text-transform: none; letter-spacing: .04em; }
  .badge.strong { color: var(--fg); }
  a.badge:hover { color: var(--fg); text-decoration: underline; text-underline-offset: 3px; }
  .dot-live { color: var(--accent); }
  .sep { margin: 0 8px; opacity: .4; }

  /* Chamfered silhouette — the one shape the whole site is built from */
  .chamfer {
    clip-path: polygon(
      var(--c) 0, calc(100% - var(--c)) 0,
      100% var(--c), 100% calc(100% - var(--c)),
      calc(100% - var(--c)) 100%, var(--c) 100%,
      0 calc(100% - var(--c)), 0 var(--c)
    );
  }

  /* Section label: diamond, mono caps, dotted leader */
  .sec-label { display: flex; align-items: center; gap: 12px; margin: 0 0 12px; font: 500 10px/1 var(--mono); text-transform: uppercase; letter-spacing: .18em; color: var(--muted); }
  .sec-label svg { flex: none; }
  .sec-label > span { flex: none; }
  .leader { flex: 1 1 auto !important; height: 6px; background-image: radial-gradient(currentColor 1px, transparent 1px); background-size: 6px 6px; background-position: 0 center; background-repeat: repeat-x; opacity: .7; }

  /* Media panel: dotted ground + corner crop brackets */
  .media { position: relative; overflow: hidden; background: var(--panel); }
  .media.square { aspect-ratio: 1; }
  .media-inner { position: relative; padding: 14px; }
  .media.square > .media-inner { position: absolute; inset: 0; padding: 0; }
  .dotgrid { position: absolute; inset: 0; background-image: radial-gradient(currentColor 1px, transparent 1px); background-size: 7px 7px; opacity: .2; pointer-events: none; }
  .bracket { position: absolute; width: 13px; height: 13px; pointer-events: none; opacity: .6; transform-origin: center; transition: transform 240ms var(--ease-out); z-index: 1; }
  .bracket::before, .bracket::after { content: ""; position: absolute; background: currentColor; }
  .bracket::before { width: 100%; height: 1px; }
  .bracket::after { width: 1px; height: 100%; }
  .bracket.tl { top: 0; left: 0; } .bracket.tl::before { top: 0; left: 0; } .bracket.tl::after { top: 0; left: 0; }
  .bracket.tr { top: 0; right: 0; } .bracket.tr::before { top: 0; right: 0; } .bracket.tr::after { top: 0; right: 0; }
  .bracket.bl { bottom: 0; left: 0; } .bracket.bl::before { bottom: 0; left: 0; } .bracket.bl::after { bottom: 0; left: 0; }
  .bracket.br { bottom: 0; right: 0; } .bracket.br::before { bottom: 0; right: 0; } .bracket.br::after { bottom: 0; right: 0; }
  .art-svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }

  /* Motion: entrance rise, line-art draw-on, hover lift. CSS only, gated. */
  @keyframes rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
  @keyframes draw { to { stroke-dashoffset: 0; } }
  @keyframes fadein { to { opacity: 1; } }
  .rise { animation: rise .5s var(--ease-out) both; animation-delay: calc(var(--i, 0) * 70ms); }
  .draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: draw .9s var(--ease-in-out) forwards; animation-delay: var(--d, .2s); }
  .fade { opacity: 0; animation: fadein .5s var(--ease-out) forwards; animation-delay: calc(.55s + var(--k, 0) * 14ms); }

  /* Cards: two chamfered blocks with a seam between them */
  .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .card-shell { position: relative; min-width: 0; }
  .card-shell.span2 { grid-column: 1 / -1; }
  .card { display: flex; flex-direction: column; gap: 6px; height: 100%; transition: transform 240ms var(--ease-out); }
  .block { position: relative; min-width: 0; }
  .block.main { flex: 1; padding: 16px 16px 18px; display: flex; flex-direction: column; }
  .block.foot { flex: none; height: 46px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 16px; }
  .foot-l { min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 12.5px; }
  .card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
  .card-head h3 { margin: 0; font-size: 20px; line-height: 1; letter-spacing: -0.02em; }
  .card-idx { font: 500 10px/1 var(--mono); padding-top: 3px; opacity: .5; flex: none; }
  .grip { display: flex; flex-direction: column; gap: 3px; opacity: .4; flex: none; }
  .grip i { display: block; width: 2.5px; height: 2.5px; border-radius: 50%; background: currentColor; }
  /* divider node parked on the seam, between this card and its right neighbour */
  .card-shell.has-node::after { content: ""; position: absolute; right: -11px; bottom: 43px; width: 12px; height: 12px; background: var(--ink); transform: rotate(45deg); z-index: 2; pointer-events: none; }
  @media (hover: hover) and (pointer: fine) {
    .card-shell:hover .card { transform: translateY(-4px); }
    .card-shell:hover .bracket { transform: scale(1.35); }
  }
  .card-shell:active .card { transform: translateY(-2px) scale(.985); transition-duration: 140ms; }

  /* Top nav */
  .topnav { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 26px 0 8px; position: relative; z-index: 3; }
  .topnav-brand { color: var(--cream); text-decoration: none; font-weight: 600; letter-spacing: -0.02em; font-size: 16px; }
  .topnav-brand:hover { color: var(--orange); }
  .topnav-links { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
  .topnav-links > a:not(.btn) { color: var(--muted); text-decoration: none; font: 500 11px/1 var(--mono); text-transform: uppercase; letter-spacing: .14em; }
  .topnav-links > a:not(.btn):hover { color: var(--cream); }
  .btn { display: inline-flex; align-items: center; gap: 8px; font: 500 11px/1 var(--mono); text-transform: uppercase; letter-spacing: .14em; padding: 12px 16px; text-decoration: none; --c: 8px; white-space: nowrap; transition: transform .2s var(--ease-out), background .2s; }
  .btn.primary { background: var(--orange); color: var(--near); }
  .btn.primary:hover { background: #ff6a35; }
  .btn.secondary { background: var(--cream); color: var(--near); }
  .btn.secondary:hover { background: #f5efe2; }
  .btn:active { transform: scale(.97); }
  .btn:focus-visible { outline: 2px solid currentColor; outline-offset: -5px; }
  .cta-arrow { display: inline-block; transition: transform .15s; }
  .btn.primary:hover .cta-arrow { transform: translateX(3px); }
  .btn.secondary:hover .cta-arrow { transform: translate(2px, -2px); }
  .email-pop { position: relative; }
  .email-pop > summary { list-style: none; cursor: pointer; color: var(--muted); font: 500 11px/1 var(--mono); text-transform: uppercase; letter-spacing: .14em; }
  .email-pop > summary::-webkit-details-marker { display: none; }
  .email-pop > summary:hover, .email-pop[open] > summary { color: var(--cream); }
  .email-box { position: absolute; top: calc(100% + 12px); right: 0; --c: 8px; padding: 10px 12px; display: flex; align-items: center; gap: 12px; white-space: nowrap; z-index: 5; font-size: 13px; }
  .email-box a { color: var(--fg); text-decoration: none; }
  .email-box a:hover { color: var(--accent); }
  .email-copy { font: 500 10px/1 var(--mono); text-transform: uppercase; letter-spacing: .12em; background: var(--near); color: var(--cream); border: 0; padding: 7px 10px; cursor: pointer; --c: 5px; }
  .email-copy:hover { color: var(--orange); }

  /* Hero */
  .hero { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(280px, .8fr); gap: 36px; align-items: center; padding: 44px 0 40px; }
  .hero-eyebrow { display: flex; align-items: center; gap: 10px; color: var(--muted); }
  .hero h1 { font-size: clamp(42px, 6.6vw, 74px); line-height: .98; letter-spacing: -0.035em; margin: 20px 0 20px; color: var(--cream); text-wrap: balance; }
  .hero .sub { color: var(--muted); font-size: 17px; line-height: 1.5; max-width: 44ch; margin: 0; }
  .hero-art { --i: 0; }
  .hero-art .card-head h3 { font-size: 18px; }

  /* Outcomes: four small cream tiles */
  .outcomes { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin: 8px 0 52px; }
  .outcome { --c: 10px; padding: 14px 14px 13px; display: flex; flex-direction: column; gap: 10px; min-height: 100px; }
  .outcome-idx { font: 500 10px/1 var(--mono); opacity: .5; }
  .outcome b { display: block; font-size: 26px; line-height: 1; letter-spacing: -0.025em; font-weight: 600; margin-top: auto; }
  .outcome .lab { font: 500 10px/1.4 var(--mono); text-transform: uppercase; letter-spacing: .12em; color: var(--muted); }

  section.dash { padding: 0 0 64px; }
  .note { color: var(--muted); font-size: 13px; flex: 1; }

  /* Stats row (GitHub, Bakiano) */
  .stats { display: flex; flex-wrap: wrap; gap: 10px 26px; margin-bottom: 16px; }
  .stat b { display: block; font-size: 22px; line-height: 1.1; letter-spacing: -0.02em; }
  .stat span { font: 500 10px/1.5 var(--mono); text-transform: uppercase; letter-spacing: .1em; color: var(--muted); }

  /* GitHub panel */
  .gh-today { font: 500 10px/1 var(--mono); text-transform: uppercase; letter-spacing: .14em; margin-bottom: 12px; }
  .gh-today.on { color: var(--accent); }
  .gh-today.off { color: var(--muted); }
  .hm { display: flex; gap: 3px; width: 100%; }
  .hm-col { display: flex; flex-direction: column; gap: 3px; flex: 1 1 0; min-width: 0; }
  .hm-d { width: 100%; aspect-ratio: 1; }

  /* LeetCode panel */
  .lc-total { display: flex; align-items: baseline; gap: 10px; margin-bottom: 14px; }
  .lc-total b { font-size: 40px; line-height: 1; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
  .lc-total span { font: 500 10px/1 var(--mono); text-transform: uppercase; letter-spacing: .12em; color: var(--muted); }
  .lc-breakdown { display: flex; flex-direction: column; gap: 8px; }
  .lc-row { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--muted); }
  .lc-row b { margin-left: auto; color: var(--fg); font-variant-numeric: tabular-nums; }
  .diamond { width: 7px; height: 7px; flex: none; transform: rotate(45deg); }
  .lc-dot.easy { background: rgba(22,21,15,.3); }
  .lc-dot.med { background: rgba(22,21,15,.6); }
  .lc-dot.hard { background: var(--orange); }

  /* Service status panel */
  .svc { display: flex; flex-direction: column; gap: 10px; flex: 1; }
  .svc-row { display: flex; align-items: center; gap: 10px; font-size: 13px; }
  .svc-dot.up { background: #2f8a5a; }
  .svc-dot.down { background: #c9301c; }
  .svc-name { color: var(--fg); text-decoration: none; }
  a.svc-name:hover { color: var(--accent); }
  .svc-state { margin-left: auto; font: 500 10px/1 var(--mono); text-transform: uppercase; letter-spacing: .1em; }
  .svc-state.up, .badge.up { color: #2f8a5a; }
  .svc-state.down, .badge.down { color: #c9301c; }

  /* Shipping log panel */
  .ship { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
  .ship-row { display: flex; align-items: center; gap: 10px; }
  .ship-dot.shipped { background: var(--orange); }
  .ship-dot.building { background: rgba(22,21,15,.55); }
  .ship-dot.planned { background: transparent; box-shadow: inset 0 0 0 1px rgba(22,21,15,.5); }
  .ship-title { font-size: 14px; font-weight: 500; color: var(--fg); text-decoration: none; }
  a.ship-title:hover { color: var(--accent); }
  .ship-date { margin-left: auto; font: 500 10px/1 var(--mono); letter-spacing: .06em; color: var(--muted); white-space: nowrap; }
  .ship-blurb { color: var(--muted); font-size: 12.5px; margin: 3px 0 0 17px; line-height: 1.5; }

  /* Bakiano — the venture card. Same skeleton, orange ground, its own scale. */
  .v-eyebrow { color: var(--muted); }
  .v-headline { margin: 12px 0 0; font-size: 26px; line-height: 1.08; letter-spacing: -0.025em; font-weight: 600; max-width: 30ch; }
  .v-blurb { margin: 10px 0 0; color: var(--muted); font-size: 13.5px; max-width: 66ch; line-height: 1.55; }
  .v-stats { margin: 20px 0 2px; }
  .v-label { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin: 22px 0 10px; font: 500 10px/1 var(--mono); text-transform: uppercase; letter-spacing: .18em; color: var(--muted); }
  .v-label .leader { min-width: 40px; }
  .v-note { font: 400 11px/1.4 var(--sans); letter-spacing: 0; text-transform: none; color: var(--muted); flex: 1 1 100%; margin-top: 2px; }
  .vsets { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
  .vset { background: var(--panel); padding: 11px 12px 12px; --c: 8px; }
  .vset-name { display: flex; align-items: center; justify-content: space-between; gap: 6px; font-size: 13px; font-weight: 500; }
  .vset-flag { font: 500 9px/1 var(--mono); letter-spacing: .1em; text-transform: uppercase; padding: 3px 6px; flex: none; }
  .vset-flag.live { background: var(--near); color: var(--orange); }
  .vset-flag.soon { color: var(--muted); box-shadow: inset 0 0 0 1px var(--line); }
  .vset-blurb { color: var(--muted); font-size: 11.5px; margin-top: 5px; line-height: 1.45; }
  .vprods { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px 18px; }
  .vprod-head b { display: block; font-size: 14px; font-weight: 600; }
  .vprod-head span { display: block; font: 500 9.5px/1.4 var(--mono); letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin-top: 1px; }
  .vprod-blurb { color: var(--muted); font-size: 12px; margin-top: 5px; line-height: 1.5; }

  /* Footer */
  footer.site { padding: 0 0 56px; display: flex; align-items: center; flex-wrap: wrap; font: 500 10px/1.8 var(--mono); text-transform: uppercase; letter-spacing: .14em; color: var(--muted); }
  footer.site a { color: var(--cream); text-decoration: none; }
  footer.site a:hover { color: var(--orange); }

  /* Sub-pages: nav row + page title */
  .subnav { display: flex; gap: 22px; margin: 26px 0 22px; }
  .subnav a { color: var(--muted); text-decoration: none; font: 500 11px/1 var(--mono); text-transform: uppercase; letter-spacing: .14em; }
  .subnav a:hover { color: var(--cream); }
  .page-h1 { font-size: clamp(30px, 4.6vw, 44px); line-height: 1; letter-spacing: -0.03em; margin: 14px 0 8px; }
  .page-lede { color: var(--muted); font-size: 15px; margin: 0 0 26px; max-width: 60ch; }

  @media (max-width: 760px) {
    .hero { grid-template-columns: 1fr; gap: 26px; }
    .hero-art { max-width: 420px; }
    .vprods { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 640px) {
    :root { --c: 11px; }
    .wrap { padding: 0 16px; }
    .topnav { padding: 18px 0 4px; gap: 12px; }
    .topnav-links { gap: 14px; }
    .btn { padding: 11px 14px; }
    .hero { padding: 28px 0 28px; }
    .hero h1 { font-size: clamp(36px, 11vw, 50px); }
    .hero .sub { font-size: 16px; }
    .outcomes { grid-template-columns: 1fr 1fr; margin-bottom: 40px; }
    .outcome { min-height: 92px; }
    .grid { grid-template-columns: 1fr; }
    .card-shell.has-node::after { display: none; }
    .rise { animation-delay: 0s !important; }
    .vsets { grid-template-columns: 1fr 1fr; }
    .vprods { grid-template-columns: 1fr; }
    .v-headline { font-size: 22px; }
    .stats { gap: 10px 18px; }
    /* heatmap: show the most recent ~6 months, larger cells */
    .hm, .hm-col { gap: 2px; }
    .hm-col:nth-child(-n + 27) { display: none; }
    .email-box { max-width: calc(100vw - 32px); white-space: normal; flex-wrap: wrap; }
    .email-box a { word-break: break-all; }
  }
  @media (pointer: coarse) {
    .email-copy { padding: 9px 12px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .rise, .fade { animation: none; opacity: 1; }
    .draw { animation: none; stroke-dashoffset: 0; }
    .card, .bracket, .btn, .cta-arrow { transition: none; }
    .card-shell:hover .card, .card-shell:hover .bracket { transform: none; }
  }
`;
