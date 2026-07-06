// ----------------------------------------------------------------------------
// /timeline — the career timeline as the centerpiece. A big horizontal
// blueprint axis (years across, companies placed by date). Click a company and
// its keynote opens in a modal, animated by the shared SceneEngine.
// ----------------------------------------------------------------------------

import { styles } from "../styles";
import { FAVICON } from "../favicon";
import { RAIN_CANVAS, RAIN_SCRIPT } from "../anim";
import { SITE } from "../content";
import { SCENES } from "../resume/data/scenes.generated";
import { SCENE_STYLES, SCENE_ENGINE_SCRIPT } from "../scene-engine";

const TIMELINE_STYLES = `
  .tlp-wrap { max-width: 1240px; }
  .tlp-nav { display: flex; gap: 18px; margin-bottom: 14px; }
  .tlp-nav a { color: var(--muted); text-decoration: none; font-size: 13px; }
  .tlp-nav a:hover { color: var(--accent); }
  .tlp-h1 { font-size: clamp(24px, 4vw, 34px); margin: 0 0 4px; letter-spacing: -0.02em; }
  .tlp-lede { color: var(--muted); font-size: 14px; margin: 0 0 8px; }
  .tlp-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .tlp { position: relative; width: 100%; height: 76vh; min-height: 540px; }
  .tlp-grid { position: absolute; width: 1px; background: var(--line); opacity: .3; transform: translateX(-50%); }
  .tlp-line { position: absolute; height: 1px; background: var(--line); }
  .tlp-line::before, .tlp-line::after { content: ""; position: absolute; top: -6px; height: 13px; width: 1px; background: var(--line); }
  .tlp-line::before { left: 0; } .tlp-line::after { right: 0; }
  .tlp-tick { position: absolute; width: 1px; background: var(--line); transform: translateX(-50%); }
  .tlp-year { position: absolute; transform: translateX(-50%); color: var(--muted); font-size: 12px; font-variant-numeric: tabular-nums; }
  .tlp-bar { position: absolute; height: 13px; border: 1px solid; border-radius: 7px; cursor: pointer; padding: 0; overflow: visible; transition: background .2s, border-color .2s; }
  .tlp-bar::after { content: ""; position: absolute; inset: -10px -6px; } /* bigger touch target */
  .tlp-bar.job { background: rgba(110,231,183,.15); border-color: rgba(110,231,183,.55); }
  .tlp-bar.job:hover { background: rgba(110,231,183,.34); border-color: #6ee7b7; }
  .tlp-bar.contract { background: rgba(199,146,234,.15); border-color: rgba(199,146,234,.55); }
  .tlp-bar.contract:hover { background: rgba(199,146,234,.34); border-color: #c792ea; }
  .tlp-bar.project { background: rgba(255,176,32,.15); border-color: rgba(255,176,32,.55); }
  .tlp-bar.project:hover { background: rgba(255,176,32,.34); border-color: #ffb020; }
  .tlp-bar-name { position: absolute; left: 0; top: -19px; white-space: nowrap; color: var(--fg); font: inherit; font-size: 13px; }
  .tlp-bar-name small { color: var(--muted); font-size: 11px; margin-left: 6px; }
  .tlp-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
  .tlp-legend { display: flex; flex-direction: column; gap: 6px; flex: none; }
  .tlp-legend .lg { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted); }
  .tlp-legend .lg i { width: 11px; height: 11px; border-radius: 3px; display: inline-block; flex: none; }
  .tlp-legend .lg.job i { background: #6ee7b7; }
  .tlp-legend .lg.contract i { background: #c792ea; }
  .tlp-legend .lg.project i { background: #ffb020; }
  .tlp-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
  .tlp-foot span { color: var(--fg); font-size: 13px; }
  .tlp-foot a { color: var(--muted); text-decoration: none; font-size: 13px; }
  .tlp-foot a:hover { color: var(--accent); }
  .tlp-hint-mobile { display: none; }
  @media (max-width: 700px) {
    .tlp { min-width: 780px; height: 62vh; min-height: 430px; }
    /* tilt year labels so they never crowd each other on small screens */
    .tlp-year { transform: rotate(35deg); transform-origin: 0 0; font-size: 11px; }
    .tlp-hint-desktop { display: none; }
    .tlp-hint-mobile { display: inline; }
    .tlp-head { flex-direction: column; gap: 8px; }
    .tlp-legend { flex-direction: row; flex-wrap: wrap; gap: 14px; }
  }
  /* modal */
  .tlp-modal { position: fixed; inset: 0; z-index: 50; display: none; }
  .tlp-modal.open { display: block; }
  .tlp-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.72); backdrop-filter: blur(2px); }
  .tlp-dialog { position: relative; width: min(1000px, calc(100% - 20px)); margin: 4vh auto; background: var(--bg); border: 1px solid var(--line); border-radius: 16px; padding: 22px 26px 26px; box-shadow: 0 24px 70px rgba(0,0,0,.6); max-height: 92vh; overflow: auto; }
  @media (max-width: 700px) {
    .tlp-dialog { margin: 2.5vh auto; padding: 18px 14px; max-height: 95vh; }
    .tlp-role { padding-right: 30px; } /* keep clear of the close button */
  }
  .tlp-close { position: absolute; top: 10px; right: 14px; background: none; border: none; color: var(--muted); font-size: 26px; line-height: 1; cursor: pointer; }
  .tlp-close:hover { color: var(--accent); }
  .tlp-role { font-size: 18px; font-weight: 600; }
  .tlp-meta { color: var(--accent); font-size: 13px; margin: 3px 0 16px; }
  .tlp-dialog .beat-dots { margin: 14px 0 0; justify-content: center; }
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
  var els = {
    svg: document.getElementById('tlpScene'),
    dots: document.getElementById('tlpDots'),
    capTitle: document.getElementById('tlpCapTitle'),
    capText: document.getElementById('tlpCapText')
  };
  var controller = null;

  // role classification -> bar colour (default: project)
  var CAT = { pompeii:'job', making_science:'job', accenture:'job', unipol:'contract', sanofi:'contract', adevinta:'contract', permira:'contract', airbus:'contract' };
  function catOf(s) { return CAT[s.id] || 'project'; }

  function frac(period) {
    var mon = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 };
    var re = /([A-Za-z]{3})?[a-z]*\\s*(\\d{4})/g;
    var m, pts = [];
    while ((m = re.exec(period))) {
      if (!m[2]) continue;
      var mm = m[1] ? (mon[m[1].toLowerCase()] || 0) : 0;
      pts.push(parseInt(m[2], 10) + mm / 12);
    }
    return pts.length ? [pts[0], pts[pts.length - 1]] : null;
  }
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

    var lanes = [], laneH = 42, barH = 13, gap = 10;
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
<meta name="theme-color" content="#0a0a0b" />
${FAVICON}
<title>${SITE.name} · timeline</title>
<meta name="description" content="A career timeline you can walk through, role by role." />
<style>${styles}${SCENE_STYLES}${TIMELINE_STYLES}</style>
</head>
<body>
  ${RAIN_CANVAS}
  <div class="wrap tlp-wrap">
    <nav class="tlp-nav"><a href="/">‹ dashboard</a></nav>
    <div class="tlp-head">
      <div>
        <h1 class="tlp-h1">My experience over the years</h1>
        <p class="tlp-lede">Every role on one line. Click any company to watch how it was built.</p>
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
    <div class="tlp-dialog" role="dialog" aria-modal="true">
      <button class="tlp-close" id="tlpClose" aria-label="close">×</button>
      <div class="tlp-role" id="tlpRole"></div>
      <div class="tlp-meta" id="tlpMeta"></div>
      <div class="scene-scroll">
        <svg id="tlpScene" class="scene-svg" viewBox="0 0 1180 560" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Systems diagram"></svg>
      </div>
      <div class="beat-dots" id="tlpDots"></div>
      <div class="tlp-cap">
        <div class="tlp-cap-title" id="tlpCapTitle"></div>
        <div class="tlp-cap-text" id="tlpCapText"></div>
      </div>
    </div>
  </div>

  <script>window.__SCENES__ = ${data};</script>
  ${RAIN_SCRIPT}
  ${SCENE_ENGINE_SCRIPT}
  ${TIMELINE_SCRIPT}
</body>
</html>`;
}
