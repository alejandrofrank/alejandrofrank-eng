// ----------------------------------------------------------------------------
// /timeline — the career timeline as the centerpiece. A big horizontal
// blueprint axis (years across, companies placed by date). Click a company and
// its keynote opens in a modal, animated by the shared SceneEngine.
// ----------------------------------------------------------------------------

import { styles } from "../styles";
import { FAVICON } from "../favicon";
import { FONTS_LINK, sectionLabel, media } from "../ui";
import { SITE } from "../content";
import { SCENES } from "../resume/data/scenes.generated";
import { SCENE_STYLES, SCENE_ENGINE_SCRIPT, playButton } from "../scene-engine";
import { renderFullText, FULLTEXT_STYLES, FULLTEXT_SCRIPT } from "../resume/fulltext";
import { PRINT_STYLES, PRINT_SCRIPT } from "../print";

const TIMELINE_STYLES = `
  .tlp-wrap { max-width: 1240px; }
  .tlp-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .tlp { position: relative; width: 100%; height: 76vh; min-height: 540px; }
  .tlp-grid { position: absolute; width: 1px; background: var(--dim); opacity: .35; transform: translateX(-50%); }
  .tlp-line { position: absolute; height: 1px; background: var(--dim); }
  .tlp-line::before, .tlp-line::after { content: ""; position: absolute; top: -6px; height: 13px; width: 1px; background: var(--dim); }
  .tlp-line::before { left: 0; } .tlp-line::after { right: 0; }
  .tlp-tick { position: absolute; width: 1px; background: var(--dim); transform: translateX(-50%); }
  .tlp-year { position: absolute; transform: translateX(-50%); color: var(--muted); font: 500 11px/1 var(--mono); font-variant-numeric: tabular-nums; }
  .tlp-bar { position: absolute; height: 12px; border: 0; cursor: pointer; padding: 0; overflow: visible; transition: background .2s, box-shadow .2s; }
  .tlp-bar::after { content: ""; position: absolute; inset: -10px -6px; } /* bigger touch target */
  .tlp-bar.job { background: var(--orange); }
  .tlp-bar.job:hover { background: #ff7040; }
  .tlp-bar.contract { background: var(--cream); }
  .tlp-bar.contract:hover { background: #fff; }
  .tlp-bar.project { background: transparent; box-shadow: inset 0 0 0 1px var(--cream); }
  .tlp-bar.project:hover { background: rgba(233,226,211,.2); }
  .tlp-bar-name { position: absolute; left: 0; top: -20px; white-space: nowrap; color: var(--fg); font: 500 13px/1 var(--sans); }
  .tlp-bar-name small { color: var(--muted); font: 500 10px/1 var(--mono); letter-spacing: .04em; margin-left: 7px; }
  .tlp-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
  .tlp-head .page-lede { margin-bottom: 8px; }
  .tlp-legend { display: flex; flex-direction: column; gap: 7px; flex: none; margin-bottom: 8px; }
  .tlp-legend .lg { display: flex; align-items: center; gap: 9px; font: 500 10px/1 var(--mono); text-transform: uppercase; letter-spacing: .12em; color: var(--muted); }
  .tlp-legend .lg i { width: 10px; height: 10px; display: inline-block; flex: none; }
  .tlp-legend .lg.job i { background: var(--orange); }
  .tlp-legend .lg.contract i { background: var(--cream); }
  .tlp-legend .lg.project i { box-shadow: inset 0 0 0 1px var(--cream); }
  .tlp-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; padding-bottom: 40px; }
  .tlp-foot span { color: var(--muted); font: 500 10px/1 var(--mono); text-transform: uppercase; letter-spacing: .12em; }
  .tlp-foot a { color: var(--muted); text-decoration: none; font: 500 11px/1 var(--mono); text-transform: uppercase; letter-spacing: .14em; }
  .tlp-foot a:hover { color: var(--cream); }
  .tlp-hint-mobile { display: none; }
  @media (max-width: 700px) {
    .tlp { min-width: 780px; height: 62vh; min-height: 430px; }
    /* tilt year labels so they never crowd each other on small screens */
    .tlp-year { transform: rotate(35deg); transform-origin: 0 0; font-size: 10px; }
    .tlp-hint-desktop { display: none; }
    .tlp-hint-mobile { display: inline; }
    .tlp-head { flex-direction: column; align-items: flex-start; gap: 8px; }
    .tlp-legend { flex-direction: row; flex-wrap: wrap; gap: 14px; }
  }
  /* modal */
  .tlp-modal { position: fixed; inset: 0; z-index: 50; display: none; }
  .tlp-modal.open { display: block; }
  .tlp-backdrop { position: absolute; inset: 0; background: rgba(22,21,15,.72); backdrop-filter: blur(2px); }
  .tlp-dialog { position: relative; width: min(1000px, calc(100% - 20px)); margin: 4vh auto; padding: 22px 26px 26px; max-height: 92vh; overflow: auto; }
  @media (max-width: 700px) {
    .tlp-dialog { margin: 2.5vh auto; padding: 18px 14px; max-height: 95vh; }
    .tlp-role { padding-right: 30px; } /* keep clear of the close button */
  }
  .tlp-close { position: absolute; top: 14px; right: 18px; background: none; border: none; color: var(--muted); font-size: 26px; line-height: 1; cursor: pointer; }
  .tlp-close:hover { color: var(--accent); }
  .tlp-role { font-size: 20px; font-weight: 600; letter-spacing: -0.02em; }
  .tlp-meta { font: 500 10px/1 var(--mono); text-transform: uppercase; letter-spacing: .14em; color: var(--muted); margin: 6px 0 16px; }
  .tlp-controls { display: flex; align-items: center; justify-content: center; gap: 16px; margin: 14px 0 0; }
  .tlp-dialog .ft-panel { max-width: none; }
  .tlp-dialog .stage { margin: 12px 0 0; padding: 0; }
  .tlp-cap { margin-top: 16px; min-height: 52px; }
  .tlp-cap-title { color: var(--fg); font-weight: 600; }
  .tlp-cap-text { color: var(--muted); margin-top: 5px; line-height: 1.55; max-width: 74ch; }
`;

const TIMELINE_SCRIPT = `<script>
(function () {
  var scenes = window.__SCENES__ || [];
  if (!scenes.length || !window.SceneEngine) return;

  var tlp = document.getElementById('tlp');
  var modal = document.getElementById('tlpModal');
  var backdrop = document.getElementById('tlpBackdrop');
  var closeBtn = document.getElementById('tlpClose');
  var roleEl = document.getElementById('tlpRole');
  var metaEl = document.getElementById('tlpMeta');
  var fullEl = modal.querySelector('.fulltext');
  var els = {
    svg: document.getElementById('tlpScene'),
    dots: document.getElementById('tlpDots'),
    capTitle: document.getElementById('tlpCapTitle'),
    capText: document.getElementById('tlpCapText'),
    play: document.getElementById('tlpPlay')
  };
  var controller = null;

  // Bar colour comes from the scene's own category (set in resume/scenes/*.py),
  // so a new role can't quietly land in the wrong colour.
  function catOf(s) { return s.category || 'project'; }

  var frac = window.SceneEngine.period;
  function yrLabel(period) {
    var m = String(period).match(/\\d{4}/g);
    if (!m) return '';
    return m[0] === m[m.length - 1] ? m[0] : (m[0] + '\\u2013' + m[m.length - 1]);
  }

  var minY = Infinity, maxY = -Infinity, items = [];
  for (var i = 0; i < scenes.length; i++) {
    var f = frac(scenes[i].period); if (!f) continue;
    if (f[0] < minY) minY = f[0];
    if (f[1] > maxY) maxY = f[1];
    items.push({ i: i, title: scenes[i].title, mid: (f[0] + f[1]) / 2 });
  }
  minY = Math.floor(minY); maxY = Math.ceil(maxY);
  items.sort(function (a, b) { return a.mid - b.mid; });

  function build() {
    while (tlp.firstChild) tlp.removeChild(tlp.firstChild);
    var W = tlp.clientWidth || 900, H = tlp.clientHeight || 540;
    var padX = 48;
    var innerW = Math.max(1, W - padX * 2);
    var baseY = H - 44;
    function xf(y) { return padX + (y - minY) / (maxY - minY) * innerW; }

    // faint vertical gridline per year
    for (var gy = minY; gy <= maxY; gy++) {
      var grid = document.createElement('div');
      grid.className = 'tlp-grid';
      grid.style.left = xf(gy) + 'px'; grid.style.top = '6px'; grid.style.height = (baseY - 6) + 'px';
      tlp.appendChild(grid);
    }

    // baseline + year ticks/labels
    var line = document.createElement('div');
    line.className = 'tlp-line';
    line.style.left = padX + 'px'; line.style.right = padX + 'px'; line.style.top = baseY + 'px';
    tlp.appendChild(line);
    for (var y = minY; y <= maxY; y++) {
      var tx = xf(y);
      var tick = document.createElement('div');
      tick.className = 'tlp-tick';
      tick.style.left = tx + 'px'; tick.style.top = (baseY - 5) + 'px'; tick.style.height = '11px';
      tlp.appendChild(tick);
      var yl = document.createElement('div');
      yl.className = 'tlp-year';
      yl.style.left = tx + 'px'; yl.style.top = (baseY + 12) + 'px';
      yl.textContent = y;
      tlp.appendChild(yl);
    }

    // roles as range bars, packed into lanes (Gantt-style)
    var roles = [];
    for (var ri = 0; ri < scenes.length; ri++) {
      var f = frac(scenes[ri].period); if (!f) continue;
      var s = f[0], e = f[1];
      if (e <= s) { s = Math.floor(s); e = s + 1; } // year-only -> full-year block
      roles.push({ i: ri, title: scenes[ri].title, s: s, e: e });
    }
    roles.sort(function (a, b) { return a.s - b.s; });

    var lanes = [], laneH = 42, barH = 12, gap = 10;
    for (var k = 0; k < roles.length; k++) {
      var it = roles[k];
      var sx = xf(it.s), ex = xf(it.e);
      var barW = Math.max(12, ex - sx);
      var nameW = it.title.length * 8 + 72;
      var occR = Math.max(sx + barW, sx + nameW);
      var lane = -1;
      for (var r = 0; r < lanes.length; r++) { if (lanes[r] + gap <= sx) { lane = r; break; } }
      if (lane === -1) { lane = lanes.length; lanes.push(0); }
      lanes[lane] = occR;
      var barTop = baseY - 34 - lane * laneH;

      var bar = document.createElement('button');
      bar.type = 'button';
      bar.setAttribute('aria-label', it.title + ', ' + yrLabel(scenes[it.i].period));
      bar.className = 'tlp-bar ' + catOf(scenes[it.i]);
      bar.style.left = sx + 'px'; bar.style.width = barW + 'px'; bar.style.top = barTop + 'px'; bar.style.height = barH + 'px';
      var name = document.createElement('span');
      name.className = 'tlp-bar-name';
      name.innerHTML = it.title + ' <small>' + yrLabel(scenes[it.i].period) + '</small>';
      bar.appendChild(name);
      (function (idx) { bar.addEventListener('click', function () { open(idx); }); })(it.i);
      tlp.appendChild(bar);
    }
  }

  var lastFocus = null;
  function open(idx) {
    var s = scenes[idx];
    roleEl.textContent = s.role;
    metaEl.textContent = s.title + ' \\u00B7 ' + s.period;
    if (window.FullText) window.FullText.show(fullEl, s.id);
    lastFocus = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    closeBtn.focus();
    if (controller) controller.stop();
    controller = window.SceneEngine.mount(s, els);
  }
  function close() {
    if (!modal.classList.contains('open')) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (controller) { controller.stop(); controller = null; }
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); lastFocus = null; }
  }
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  if (window.FullText) window.FullText.wire(fullEl, function () { if (controller) controller.pause(); });

  build();
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 150); });
})();
</script>`;

export function renderTimelinePage(): string {
  const data = JSON.stringify(SCENES).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#2b2b29" />
${FAVICON}
${FONTS_LINK}
<title>${SITE.name} · timeline</title>
<meta name="description" content="A career timeline you can walk through, role by role." />
<style>${styles}${SCENE_STYLES}${FULLTEXT_STYLES}${TIMELINE_STYLES}${PRINT_STYLES}</style>
</head>
<body>
  <div class="wrap tlp-wrap">
    <nav class="subnav"><a href="/">← dashboard</a><a href="/resume">list view →</a></nav>
    ${sectionLabel("Timeline", `${SCENES.length} roles`)}
    <div class="tlp-head">
      <div>
        <h1 class="page-h1">My experience over the years</h1>
        <p class="page-lede">Every role on one line. Click any company to watch how it was built.</p>
      </div>
      <div class="tlp-legend">
        <span class="lg job"><i></i> Regular job</span>
        <span class="lg contract"><i></i> Contractor</span>
        <span class="lg project"><i></i> Project</span>
      </div>
    </div>
    <div class="tlp-scroll">
      <div class="tlp" id="tlp"></div>
    </div>
    <div class="tlp-foot">
      <span class="tlp-hint-desktop">click a company</span>
      <span class="tlp-hint-mobile">swipe ↔ · tap a company</span>
      <a href="/resume">switch to list view →</a>
    </div>
  </div>

  <div class="tlp-modal" id="tlpModal" aria-hidden="true">
    <div class="tlp-backdrop" id="tlpBackdrop"></div>
    <div class="tlp-dialog on-cream chamfer" role="dialog" aria-modal="true" aria-labelledby="tlpRole">
      <button class="tlp-close" id="tlpClose" aria-label="close">×</button>
      <div class="tlp-role" id="tlpRole"></div>
      <div class="tlp-meta" id="tlpMeta"></div>
      ${renderFullText(SCENES)}
      <div class="stage">
        ${media(
          `<div class="scene-scroll"><svg id="tlpScene" class="scene-svg" viewBox="0 0 1180 560" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Systems diagram"></svg></div>`
        )}
      </div>
      <div class="tlp-controls">
        ${playButton("tlpPlay")}
        <div class="beat-dots" id="tlpDots"></div>
      </div>
      <div class="tlp-cap" aria-live="polite">
        <div class="tlp-cap-title" id="tlpCapTitle"></div>
        <div class="tlp-cap-text" id="tlpCapText"></div>
      </div>
    </div>
  </div>

  <script>window.__SCENES__ = ${data};</script>
  ${SCENE_ENGINE_SCRIPT}
  ${FULLTEXT_SCRIPT}
  ${PRINT_SCRIPT}
  ${TIMELINE_SCRIPT}
</body>
</html>`;
}
