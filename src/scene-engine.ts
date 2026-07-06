// ----------------------------------------------------------------------------
// Shared scene engine — the SVG keynote renderer used by BOTH the resume page
// and the timeline modal. One source of truth for the animation.
//
//   window.SceneEngine.mount(scene, { svg, dots, capTitle, capText }) -> { stop }
//
// Builds the scene into `svg`, wires the beat dots, autoplays through the beats
// and holds on the last one (glowing). Call the returned .stop() to halt (e.g.
// when a modal closes). Reduced-motion jumps straight to the final frame.
// ----------------------------------------------------------------------------

export const SCENE_STYLES = `
  .scene-svg { width: 100%; height: auto; display: block; }
  .node-box { fill: #14141a; stroke-width: 1.5; }
  .node-label { font-family: inherit; font-size: 16px; font-weight: 600; }
  .node-sub { font-family: inherit; font-size: 11px; fill: var(--muted); }
  .node .node-inner { opacity: 0; transform: scale(.82); transform-box: fill-box; transform-origin: center; transition: opacity .5s ease, transform .5s cubic-bezier(.2,.8,.2,1); }
  .node.on .node-inner { opacity: 1; transform: scale(1); }
  .flow-path { fill: none; stroke: var(--flow-color, #4d4d5a); stroke-width: 1.7; stroke-dasharray: 1; stroke-dashoffset: 1; opacity: .5; transition: stroke-dashoffset .8s ease, opacity .5s ease; }
  .flow.on .flow-path { stroke-dashoffset: 0; }
  .flow.on.active .flow-path { opacity: 1; }
  .flow.glow .flow-path { stroke: var(--accent); stroke-width: 2.4; }
  .flow.glow.on .flow-path { opacity: .82; }
  .flow.glow.on.active .flow-path { opacity: 1; }
  .flow-pulse { fill: var(--accent); opacity: 0; }
  @keyframes flowGlow { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }
  .done .flow.on .flow-path { stroke: var(--accent); filter: url(#glow); animation: flowGlow 2.6s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) { .done .flow.on .flow-path { animation: none; } }
  .beat-dots { display: flex; gap: 8px; }
  .beat-dot { width: 11px; height: 11px; border-radius: 50%; background: var(--line); border: none; cursor: pointer; padding: 0; }
  .beat-dot.on { background: var(--accent); }
  /* On phones the diagram scrolls sideways instead of shrinking to unreadable. */
  .scene-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  @media (max-width: 700px) {
    .scene-scroll .scene-svg { min-width: 640px; }
  }
  @media (pointer: coarse) {
    .beat-dots { gap: 12px; }
    .beat-dot { width: 16px; height: 16px; }
  }
`;

export const SCENE_ENGINE_SCRIPT = `<script>
window.SceneEngine = (function () {
  var NS = 'http://www.w3.org/2000/svg';
  var VB_W = 1180, VB_H = 560, PAD_X = 100, PAD_Y = 78;
  var NODE_W = 180, NODE_H = 64, BEAT_MS = 2900;
  var KIND = { source: '#6ea8fe', core: '#6ee7b7', sink: '#ffb020', science: '#c792ea' };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function X(nx) { return PAD_X + nx * (VB_W - 2 * PAD_X); }
  function Y(ny) { return PAD_Y + ny * (VB_H - 2 * PAD_Y); }
  function el(name) { return document.createElementNS(NS, name); }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }

  function mount(scene, els) {
    var svg = els.svg, dotsEl = els.dots, capTitle = els.capTitle, capText = els.capText;
    var timer = null, nodeEls = {}, flowEls = {};

    clear(svg);
    svg.setAttribute('viewBox', '0 0 ' + VB_W + ' ' + VB_H);

    var defs = el('defs');
    var f = el('filter');
    f.setAttribute('id', 'glow');
    f.setAttribute('filterUnits', 'userSpaceOnUse');
    f.setAttribute('x', '0'); f.setAttribute('y', '0');
    f.setAttribute('width', VB_W); f.setAttribute('height', VB_H);
    var b = el('feGaussianBlur'); b.setAttribute('stdDeviation', '3.4'); b.setAttribute('result', 'b');
    var mg = el('feMerge');
    var m1 = el('feMergeNode'); m1.setAttribute('in', 'b');
    var m2 = el('feMergeNode'); m2.setAttribute('in', 'SourceGraphic');
    mg.appendChild(m1); mg.appendChild(m2);
    f.appendChild(b); f.appendChild(mg); defs.appendChild(f); svg.appendChild(defs);

    var flowLayer = el('g'); svg.appendChild(flowLayer);
    var nodeLayer = el('g'); svg.appendChild(nodeLayer);

    var byId = {};
    for (var i = 0; i < scene.nodes.length; i++) byId[scene.nodes[i].id] = scene.nodes[i];

    for (var j = 0; j < scene.flows.length; j++) {
      var fl = scene.flows[j];
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

    for (var k = 0; k < scene.nodes.length; k++) {
      var n = scene.nodes[k];
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

    function showBeat(i) {
      var showN = {}, showF = {};
      for (var b2 = 0; b2 <= i; b2++) {
        var bt = scene.beats[b2];
        for (var a2 = 0; a2 < bt.nodes.length; a2++) showN[bt.nodes[a2]] = 1;
        for (var c2 = 0; c2 < bt.flows.length; c2++) showF[bt.flows[c2]] = 1;
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
      for (var p = 0; p < cur.flows.length; p++) {
        (function (fe) {
          if (!fe) return;
          setTimeout(function () { fe.pulse.style.opacity = '1'; try { fe.mo.beginElement(); } catch (e) {} }, 380);
        })(flowEls[cur.flows[p]]);
      }
      svg.classList.toggle('done', i === scene.beats.length - 1);
      if (dotsEl) {
        var dts = dotsEl.children;
        for (var q = 0; q < dts.length; q++) dts[q].classList.toggle('on', q === i);
      }
      if (capTitle) capTitle.textContent = cur.title;
      if (capText) capText.textContent = cur.caption;
    }

    function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }
    function runFrom(i) {
      clearTimer();
      showBeat(i);
      if (!reduce && i < scene.beats.length - 1) timer = setTimeout(function () { runFrom(i + 1); }, BEAT_MS);
    }

    if (dotsEl) {
      clear(dotsEl);
      for (var di = 0; di < scene.beats.length; di++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'beat-dot'; dot.title = scene.beats[di].title;
        dot.setAttribute('aria-label', 'beat ' + (di + 1) + ': ' + scene.beats[di].title);
        (function (idx) { dot.addEventListener('click', function () { runFrom(idx); }); })(di);
        dotsEl.appendChild(dot);
      }
    }

    if (reduce) showBeat(scene.beats.length - 1); else runFrom(0);

    return { stop: clearTimer };
  }

  return { mount: mount };
})();
</script>`;
