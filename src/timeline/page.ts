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
  .tlp { position: relative; width: 100%; height: 66vh; min-height: 460px; }
  .tlp-line { position: absolute; height: 1px; background: var(--line); }
  .tlp-line::before, .tlp-line::after { content: ""; position: absolute; top: -6px; height: 13px; width: 1px; background: var(--line); }
  .tlp-line::before { left: 0; } .tlp-line::after { right: 0; }
  .tlp-tick { position: absolute; width: 1px; background: var(--line); transform: translateX(-50%); }
  .tlp-year { position: absolute; transform: translateX(-50%); color: var(--muted); font-size: 12px; font-variant-numeric: tabular-nums; }
  .tlp-dot { position: absolute; width: 10px; height: 10px; border-radius: 50%; background: var(--accent); transform: translate(-50%, -50%); box-shadow: 0 0 8px rgba(110,231,183,.5); }
  .tlp-conn { position: absolute; width: 1px; background: var(--line); transform: translateX(-50%); }
  .tlp-co { position: absolute; transform: translate(-50%, -100%); background: var(--panel); border: 1px solid var(--line); color: var(--fg); font: inherit; font-size: 13px; padding: 6px 12px; border-radius: 8px; cursor: pointer; white-space: nowrap; transition: border-color .2s, color .2s, transform .15s; }
  .tlp-co:hover { border-color: var(--accent); color: var(--accent); transform: translate(-50%, -100%) scale(1.05); }
  .tlp-co small { color: var(--muted); font-size: 11px; margin-left: 7px; }
  .tlp-hint { color: var(--muted); font-size: 13px; text-align: center; margin-top: 6px; }
  /* modal */
  .tlp-modal { position: fixed; inset: 0; z-index: 50; display: none; }
  .tlp-modal.open { display: block; }
  .tlp-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.72); backdrop-filter: blur(2px); }
  .tlp-dialog { position: relative; max-width: 1000px; margin: 4vh auto; background: var(--bg); border: 1px solid var(--line); border-radius: 16px; padding: 22px 26px 26px; box-shadow: 0 24px 70px rgba(0,0,0,.6); max-height: 92vh; overflow: auto; }
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
    var W = tlp.clientWidth || 900, H = tlp.clientHeight || 460;
    var padX = 48;
    var innerW = Math.max(1, W - padX * 2);
    var lineY = H - 74;
    function xf(y) { return padX + (y - minY) / (maxY - minY) * innerW; }

    var line = document.createElement('div');
    line.className = 'tlp-line';
    line.style.left = padX + 'px'; line.style.right = padX + 'px'; line.style.top = lineY + 'px';
    tlp.appendChild(line);

    for (var y = minY; y <= maxY; y++) {
      var tx = xf(y);
      var tick = document.createElement('div');
      tick.className = 'tlp-tick';
      tick.style.left = tx + 'px'; tick.style.top = (lineY - 5) + 'px'; tick.style.height = '11px';
      tlp.appendChild(tick);
      var yl = document.createElement('div');
      yl.className = 'tlp-year';
      yl.style.left = tx + 'px'; yl.style.top = (lineY + 13) + 'px';
      yl.textContent = y;
      tlp.appendChild(yl);
    }

    var rows = [], rowH = 36, gap = 10, baseGap = 24;
    for (var k = 0; k < items.length; k++) {
      var it = items[k];
      var cx = xf(it.mid);
      var w = it.title.length * 8 + 34;
      var L = cx - w / 2, R = cx + w / 2;
      var row = -1;
      for (var r = 0; r < rows.length; r++) { if (rows[r] + gap <= L) { row = r; break; } }
      if (row === -1) { row = rows.length; rows.push(0); }
      rows[row] = R;
      var labelY = lineY - baseGap - row * rowH;

      var conn = document.createElement('div');
      conn.className = 'tlp-conn';
      conn.style.left = cx + 'px'; conn.style.top = labelY + 'px'; conn.style.height = (lineY - labelY) + 'px';
      tlp.appendChild(conn);

      var dot = document.createElement('div');
      dot.className = 'tlp-dot';
      dot.style.left = cx + 'px'; dot.style.top = lineY + 'px';
      tlp.appendChild(dot);

      var co = document.createElement('button');
      co.className = 'tlp-co';
      co.style.left = cx + 'px'; co.style.top = labelY + 'px';
      co.innerHTML = it.title + ' <small>' + yrLabel(scenes[it.i].period) + '</small>';
      (function (idx) { co.addEventListener('click', function () { open(idx); }); })(it.i);
      tlp.appendChild(co);
    }
  }

  function open(idx) {
    var s = scenes[idx];
    roleEl.textContent = s.role;
    metaEl.textContent = s.title + ' \\u00B7 ' + s.period;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    if (controller) controller.stop();
    controller = window.SceneEngine.mount(s, els);
  }
  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (controller) { controller.stop(); controller = null; }
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
<meta name="viewport" content="width=device-width, initial-scale=1" />
${FAVICON}
<title>${SITE.name} · timeline</title>
<meta name="description" content="A career timeline you can walk through, role by role." />
<style>${styles}${SCENE_STYLES}${TIMELINE_STYLES}</style>
</head>
<body>
  ${RAIN_CANVAS}
  <div class="wrap tlp-wrap">
    <nav class="tlp-nav"><a href="/">‹ dashboard</a><a href="/resume">list view →</a></nav>
    <h1 class="tlp-h1">The build, year by year</h1>
    <p class="tlp-lede">Every role on one line. Click any company to watch how it was built.</p>
    <div class="tlp" id="tlp"></div>
    <p class="tlp-hint">click a company →</p>
  </div>

  <div class="tlp-modal" id="tlpModal" aria-hidden="true">
    <div class="tlp-backdrop" id="tlpBackdrop"></div>
    <div class="tlp-dialog" role="dialog" aria-modal="true">
      <button class="tlp-close" id="tlpClose" aria-label="close">×</button>
      <div class="tlp-role" id="tlpRole"></div>
      <div class="tlp-meta" id="tlpMeta"></div>
      <svg id="tlpScene" class="scene-svg" viewBox="0 0 1180 560" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Systems diagram"></svg>
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
