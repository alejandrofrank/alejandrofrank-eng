// ----------------------------------------------------------------------------
// Vanilla SVG "scene player" — renders a compiled scene (nodes/flows/beats) and
// animates it keynote-style. No framework; mirrors how the site's other
// animations are done (plain JS injected as a <script>).
//
// The script avoids template literals / backticks / "</script>" so it stays
// safe inside this module's template literal and inside the HTML page.
// ----------------------------------------------------------------------------

export const PLAYER_STYLES = `
  .resume { max-width: 1000px; margin: 0 auto; }
  .resume-nav { margin-bottom: 26px; }
  .resume-nav a { color: var(--muted); text-decoration: none; font-size: 13px; }
  .resume-nav a:hover { color: var(--accent); }
  .resume-h1 { font-size: clamp(28px, 5vw, 40px); margin: 0 0 6px; letter-spacing: -0.02em; }
  .resume-lede { color: var(--muted); margin: 0 0 26px; }
  .tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 22px; }
  .tab { font: inherit; background: var(--panel); border: 1px solid var(--line); color: var(--muted); padding: 6px 13px; border-radius: 999px; cursor: pointer; }
  .tab:hover { color: var(--fg); }
  .tab.on { color: var(--bg); background: var(--accent); border-color: var(--accent); }
  .job-header h2 { margin: 0; font-size: 20px; }
  .job-meta { color: var(--accent); font-size: 13px; margin: 4px 0 8px; }
  .job-summary { color: var(--muted); max-width: 72ch; margin: 0; }
  .stage { margin: 16px 0 6px; padding: 6px; }
  #scene { width: 100%; height: auto; display: block; }
  .node-box { fill: #14141a; stroke-width: 1.5; }
  .node-label { font-family: inherit; font-size: 15px; font-weight: 600; }
  .node-sub { font-family: inherit; font-size: 11px; fill: var(--muted); }
  .node .node-inner { opacity: 0; transform: scale(.82); transform-box: fill-box; transform-origin: center; transition: opacity .5s ease, transform .5s cubic-bezier(.2,.8,.2,1); }
  .node.on .node-inner { opacity: 1; transform: scale(1); }
  .flow-path { fill: none; stroke: var(--flow-color, #3f3f49); stroke-width: 1.6; stroke-dasharray: 1; stroke-dashoffset: 1; opacity: .38; transition: stroke-dashoffset .8s ease, opacity .5s ease; }
  .flow.on .flow-path { stroke-dashoffset: 0; }
  .flow.on.active .flow-path { opacity: 1; }
  .flow.glow .flow-path { stroke: var(--accent); stroke-width: 2.4; }
  .flow.glow.on .flow-path { opacity: .82; }
  .flow.glow.on.active .flow-path { opacity: 1; }
  .flow-label { font-family: inherit; font-size: 11px; fill: var(--accent); opacity: 0; transition: opacity .4s ease .3s; }
  .flow.on .flow-label { opacity: .9; }
  .flow-pulse { fill: var(--accent); opacity: 0; }
  /* End state: hold on the last beat and let every drawn path glow. */
  @keyframes flowGlow { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }
  .done .flow.on .flow-path { stroke: var(--accent); filter: url(#glow); animation: flowGlow 2.6s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) { .done .flow.on .flow-path { animation: none; } }
  .player-controls { display: flex; align-items: center; gap: 12px; margin-top: 10px; }
  .player-controls button { font: inherit; background: var(--panel); border: 1px solid var(--line); color: var(--fg); padding: 6px 13px; border-radius: 8px; cursor: pointer; }
  .player-controls button:hover { border-color: var(--accent); }
  .beat-dots { display: flex; gap: 8px; margin-left: auto; }
  .beat-dot { width: 11px; height: 11px; border-radius: 50%; background: var(--line); border: none; cursor: pointer; padding: 0; }
  .beat-dot.on { background: var(--accent); }
  .caption { margin-top: 18px; min-height: 62px; }
  .caption-title { color: var(--fg); font-weight: 600; }
  .caption-text { color: var(--muted); max-width: 74ch; margin-top: 5px; line-height: 1.55; }
`;

export const PLAYER_SCRIPT = `<script>
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var scenes = window.__SCENES__ || [];
  if (!scenes.length) return;

  var VB_W = 1180, VB_H = 560, PAD_X = 100, PAD_Y = 78;
  var NODE_W = 176, NODE_H = 60, BEAT_MS = 2900;
  var KIND = { source: '#6ea8fe', core: '#6ee7b7', sink: '#ffb020', science: '#c792ea' };

  var svg = document.getElementById('scene');
  var tabsEl = document.getElementById('jobTabs');
  var roleEl = document.getElementById('jobRole');
  var metaEl = document.getElementById('jobMeta');
  var sumEl = document.getElementById('jobSummary');
  var dotsEl = document.getElementById('beatDots');
  var capTitle = document.getElementById('capTitle');
  var capText = document.getElementById('capText');

  var scene = null, beat = 0, timer = null;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nodeEls = {}, flowEls = {};

  function X(nx) { return PAD_X + nx * (VB_W - 2 * PAD_X); }
  function Y(ny) { return PAD_Y + ny * (VB_H - 2 * PAD_Y); }
  function el(name) { return document.createElementNS(NS, name); }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }

  function buildScene(s) {
    clear(svg);
    nodeEls = {}; flowEls = {};
    svg.setAttribute('viewBox', '0 0 ' + VB_W + ' ' + VB_H);

    var defs = el('defs');
    var f = el('filter');
    f.setAttribute('id', 'glow');
    f.setAttribute('x', '-60%'); f.setAttribute('y', '-60%');
    f.setAttribute('width', '220%'); f.setAttribute('height', '220%');
    var b = el('feGaussianBlur'); b.setAttribute('stdDeviation', '3.4'); b.setAttribute('result', 'b');
    var m = el('feMerge');
    var m1 = el('feMergeNode'); m1.setAttribute('in', 'b');
    var m2 = el('feMergeNode'); m2.setAttribute('in', 'SourceGraphic');
    m.appendChild(m1); m.appendChild(m2);
    f.appendChild(b); f.appendChild(m); defs.appendChild(f); svg.appendChild(defs);

    var flowLayer = el('g'); svg.appendChild(flowLayer);
    var nodeLayer = el('g'); svg.appendChild(nodeLayer);

    var byId = {};
    for (var i = 0; i < s.nodes.length; i++) byId[s.nodes[i].id] = s.nodes[i];

    // flows (drawn under nodes)
    for (var j = 0; j < s.flows.length; j++) {
      var fl = s.flows[j];
      var a = byId[fl.src], z = byId[fl.dst];
      var x1 = X(a.x) + NODE_W / 2, y1 = Y(a.y);
      var x2 = X(z.x) - NODE_W / 2, y2 = Y(z.y);
      var dx = Math.max(36, (x2 - x1) * 0.32);
      var d = 'M ' + x1 + ' ' + y1 + ' C ' + (x1 + dx) + ' ' + y1 + ', ' + (x2 - dx) + ' ' + y2 + ', ' + x2 + ' ' + y2;

      var g = el('g'); g.setAttribute('class', 'flow' + (fl.glow ? ' glow' : ''));
      if (fl.color) g.style.setProperty('--flow-color', fl.color);
      var path = el('path');
      path.setAttribute('d', d); path.setAttribute('pathLength', '1'); path.setAttribute('class', 'flow-path');
      if (fl.glow) path.setAttribute('filter', 'url(#glow)');
      g.appendChild(path);

      if (fl.label) {
        var t = el('text');
        t.setAttribute('class', 'flow-label'); t.setAttribute('text-anchor', 'middle');
        t.setAttribute('x', (x1 + x2) / 2); t.setAttribute('y', (y1 + y2) / 2 - 8);
        t.textContent = fl.label;
        g.appendChild(t);
      }

      var pulse = el('circle');
      pulse.setAttribute('r', fl.glow ? '5' : '3.6'); pulse.setAttribute('class', 'flow-pulse');
      if (fl.color) pulse.style.fill = fl.color;
      var mo = el('animateMotion');
      mo.setAttribute('dur', '1.05s'); mo.setAttribute('begin', 'indefinite');
      mo.setAttribute('path', d); mo.setAttribute('fill', 'remove');
      (function (pl) { mo.addEventListener('endEvent', function () { pl.style.opacity = '0'; }); })(pulse);
      pulse.appendChild(mo);
      g.appendChild(pulse);

      flowLayer.appendChild(g);
      flowEls[fl.id] = { g: g, pulse: pulse, mo: mo };
    }

    // nodes
    for (var k = 0; k < s.nodes.length; k++) {
      var n = s.nodes[k];
      var color = n.color || KIND[n.kind] || '#888';
      var outer = el('g'); outer.setAttribute('class', 'node');
      outer.setAttribute('transform', 'translate(' + X(n.x) + ',' + Y(n.y) + ')');
      var inner = el('g'); inner.setAttribute('class', 'node-inner');

      var rect = el('rect');
      rect.setAttribute('x', -NODE_W / 2); rect.setAttribute('y', -NODE_H / 2);
      rect.setAttribute('width', NODE_W); rect.setAttribute('height', NODE_H);
      rect.setAttribute('rx', '11'); rect.setAttribute('class', 'node-box'); rect.setAttribute('stroke', color);
      inner.appendChild(rect);

      var label = el('text');
      label.setAttribute('class', 'node-label'); label.setAttribute('text-anchor', 'middle');
      label.setAttribute('y', n.sublabel ? -3 : 5); label.setAttribute('fill', color);
      label.textContent = n.label;
      inner.appendChild(label);

      if (n.sublabel) {
        var sub = el('text');
        sub.setAttribute('class', 'node-sub'); sub.setAttribute('text-anchor', 'middle');
        sub.setAttribute('y', 14); sub.textContent = n.sublabel;
        inner.appendChild(sub);
      }

      outer.appendChild(inner);
      nodeLayer.appendChild(outer);
      nodeEls[n.id] = { g: outer };
    }
  }

  function showBeat(i) {
    beat = i;
    var showN = {}, showF = {};
    for (var b = 0; b <= i; b++) {
      var bt = scene.beats[b];
      for (var a = 0; a < bt.nodes.length; a++) showN[bt.nodes[a]] = 1;
      for (var c = 0; c < bt.flows.length; c++) showF[bt.flows[c]] = 1;
    }
    var cur = scene.beats[i];
    var activeF = {};
    for (var af = 0; af < cur.flows.length; af++) activeF[cur.flows[af]] = 1;

    for (var nid in nodeEls) nodeEls[nid].g.classList.toggle('on', !!showN[nid]);
    for (var fid in flowEls) {
      var on = !!showF[fid];
      flowEls[fid].g.classList.toggle('on', on);
      flowEls[fid].g.classList.toggle('active', !!activeF[fid]);
      if (!on) flowEls[fid].pulse.style.opacity = '0';
    }
    // pulse this beat's flows once the path has drawn
    for (var p = 0; p < cur.flows.length; p++) {
      (function (fe) {
        if (!fe) return;
        setTimeout(function () {
          fe.pulse.style.opacity = '1';
          try { fe.mo.beginElement(); } catch (e) {}
        }, 380);
      })(flowEls[cur.flows[p]]);
    }
    // final beat: freeze here and let every path glow (no reset)
    svg.classList.toggle('done', i === scene.beats.length - 1);

    // dots + caption
    var dots = dotsEl.children;
    for (var q = 0; q < dots.length; q++) dots[q].classList.toggle('on', q === i);
    capTitle.textContent = cur.title;
    capText.textContent = cur.caption;
  }

  function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }

  // Auto-run from beat i through the end, then hold on the last beat.
  function runFrom(i) {
    clearTimer();
    showBeat(i);
    if (!reduce && i < scene.beats.length - 1) {
      timer = setTimeout(function () { runFrom(i + 1); }, BEAT_MS);
    }
  }

  function buildDots() {
    clear(dotsEl);
    for (var i = 0; i < scene.beats.length; i++) {
      var dot = document.createElement('button');
      dot.className = 'beat-dot'; dot.title = scene.beats[i].title;
      (function (idx) { dot.addEventListener('click', function () { runFrom(idx); }); })(i);
      dotsEl.appendChild(dot);
    }
  }

  function selectScene(idx) {
    clearTimer();
    scene = scenes[idx]; beat = 0;
    roleEl.textContent = scene.role;
    metaEl.textContent = scene.title + ' \\u00B7 ' + scene.period;
    sumEl.textContent = scene.summary;
    buildScene(scene);
    buildDots();
    var tabs = tabsEl.children;
    for (var t = 0; t < tabs.length; t++) tabs[t].classList.toggle('on', t === idx);
    // autoplay through the beats; reduced-motion jumps straight to the end
    if (reduce) showBeat(scene.beats.length - 1); else runFrom(0);
  }

  // tabs
  for (var i = 0; i < scenes.length; i++) {
    var tab = document.createElement('button');
    tab.className = 'tab'; tab.textContent = scenes[i].title;
    (function (idx) { tab.addEventListener('click', function () { selectScene(idx); }); })(i);
    tabsEl.appendChild(tab);
  }

  selectScene(0);
})();
</script>`;
