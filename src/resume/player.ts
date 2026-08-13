// ----------------------------------------------------------------------------
// Resume page chrome: tabs, blueprint timeline, prev/next arrows, job header.
// The scene animation itself is delegated to the shared SceneEngine (see
// ../scene-engine.ts). This file only owns the page-specific UI around it.
// ----------------------------------------------------------------------------

export const PLAYER_STYLES = `
  .wrap.resumewrap { max-width: 1030px; }
  .resume { max-width: 1030px; margin: 0 auto; }
  .resume-nav { margin-bottom: 26px; }
  .resume-nav a { color: var(--muted); text-decoration: none; font-size: 13px; }
  .resume-nav a:hover { color: var(--accent); }
  .resume-h1 { font-size: clamp(24px, 4vw, 32px); margin: 0 0 5px; letter-spacing: -0.02em; }
  .resume-lede { color: var(--muted); font-size: 14px; margin: 0 0 22px; }
  /* Equal-size bubbles, centered rows; wide enough that no name truncates. */
  .tabs { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 22px; }
  .tab { flex: 0 1 170px; min-width: 0; font: inherit; background: var(--panel); border: 1px solid var(--line); color: var(--muted); padding: 6px 10px; border-radius: 999px; cursor: pointer; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tab:hover { color: var(--fg); }
  .tab.on { color: var(--bg); background: var(--accent); border-color: var(--accent); }
  .job-line { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin: 2px 0 10px; }
  .jd-role { font-size: 18px; font-weight: 600; color: var(--fg); }
  .jd-meta { color: var(--accent); font-size: 13px; }
  .stage { margin: 16px 0 6px; padding: 6px; }
  .player-controls { display: flex; align-items: center; gap: 12px; margin-top: 10px; }
  .player-controls .beat-dots { margin-left: auto; }
  .caption { margin-top: 18px; min-height: 62px; padding-bottom: 100px; }
  .caption-title { color: var(--fg); font-weight: 600; }
  .caption-text { color: var(--muted); max-width: 74ch; margin-top: 5px; line-height: 1.55; }
  .timeline { display: flex; align-items: center; gap: 14px; margin: 6px 0 26px; }
  .tl-year { color: var(--muted); font-size: 13px; font-variant-numeric: tabular-nums; min-width: 40px; text-align: center; }
  .tl-track { position: relative; flex: 1; height: 1px; background: var(--line); margin: 0 4px; }
  .tl-track::before, .tl-track::after { content: ""; position: absolute; top: -4px; height: 9px; width: 1px; background: var(--line); }
  .tl-track::before { left: 0; }
  .tl-track::after { right: 0; }
  .tl-co { position: absolute; top: 50%; transform: translate(-50%, -50%); background: var(--bg); padding: 0 7px; font-size: 11px; letter-spacing: .02em; color: var(--muted); white-space: nowrap; }
  .tl-co.on { color: var(--accent); font-weight: 600; }
  .tl-arrow { background: none; border: none; padding: 2px; color: var(--muted); cursor: pointer; flex: none; display: flex; align-items: center; transition: color .2s ease, transform .2s ease; }
  .tl-arrow:hover:not(:disabled) { color: var(--accent); transform: scale(1.18); }
  .tl-arrow:disabled { opacity: .22; cursor: default; }
  .tl-ico { width: 18px; height: 18px; fill: currentColor; display: block; }
  @media (max-width: 640px) {
    .resume-nav { margin-bottom: 18px; }
    .timeline { gap: 8px; margin-bottom: 20px; }
    .tl-co:not(.on) { display: none; } /* only the active company label — the rest overlap */
    .caption { padding-bottom: 48px; }
  }
  @media (pointer: coarse) {
    .tl-arrow { padding: 8px; }
    .tab { padding: 8px 14px; }
  }
`;

export const PLAYER_SCRIPT = `<script>
(function () {
  var scenes = window.__SCENES__ || [];
  if (!scenes.length || !window.SceneEngine) return;

  var svg = document.getElementById('scene');
  var tabsEl = document.getElementById('jobTabs');
  var roleEl = document.getElementById('jobRole');
  var metaEl = document.getElementById('jobMeta');
  var playEl = document.getElementById('playBtn');
  var fullEl = document.querySelector('.fulltext');
  var dotsEl = document.getElementById('beatDots');
  var capTitle = document.getElementById('capTitle');
  var capText = document.getElementById('capText');
  var tlStart = document.getElementById('tlStart');
  var tlEnd = document.getElementById('tlEnd');
  var tlTrack = document.getElementById('tlTrack');
  var tlPrev = document.getElementById('tlPrev');
  var tlNext = document.getElementById('tlNext');

  var sceneIdx = 0, controller = null;

  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }

  function years(period) {
    var m = String(period).match(/\\d{4}/g);
    return m ? [m[0], m[m.length - 1]] : ['', ''];
  }

  var frac = window.SceneEngine.period;

  function buildTimeline(scene) {
    clear(tlTrack);
    var w = frac(scene.period);
    if (!w) return;
    var lo = w[0], hi = w[1];
    if (hi <= lo) { lo = w[0] - 0.5; hi = w[1] + 0.5; }
    for (var i = 0; i < scenes.length; i++) {
      var f = frac(scenes[i].period);
      if (!f || f[1] < lo || f[0] > hi) continue;
      var pos = ((f[0] + f[1]) / 2 - lo) / (hi - lo);
      // Neighbours whose midpoint falls outside the window would clamp onto
      // the track edges (over the year labels) — drop them instead.
      if (i !== sceneIdx && (pos < 0.03 || pos > 0.97)) continue;
      pos = Math.max(0.06, Math.min(0.94, pos));
      var d = document.createElement('div');
      d.className = 'tl-co' + (i === sceneIdx ? ' on' : '');
      d.textContent = scenes[i].title;
      d.style.left = (pos * 100) + '%';
      tlTrack.appendChild(d);
    }
  }

  function selectScene(idx, link) {
    if (controller) controller.stop();
    sceneIdx = idx;
    var scene = scenes[idx];
    roleEl.textContent = scene.role;
    metaEl.textContent = scene.title + ' \\u00B7 ' + scene.period;
    if (window.FullText) window.FullText.show(fullEl, scene.id);
    var tabs = tabsEl.children;
    for (var t = 0; t < tabs.length; t++) {
      tabs[t].classList.toggle('on', t === idx);
      tabs[t].setAttribute('aria-pressed', t === idx ? 'true' : 'false');
    }
    var yr = years(scene.period);
    tlStart.textContent = yr[0]; tlEnd.textContent = yr[1];
    tlPrev.disabled = (idx === 0);
    tlNext.disabled = (idx === scenes.length - 1);
    buildTimeline(scene);
    // Deep link: /resume#sanofi opens straight on that role (and stays shareable
    // as you click around). replaceState so back still leaves the page.
    if (link && history.replaceState) history.replaceState(null, '', '#' + scene.id);
    controller = window.SceneEngine.mount(scene, {
      svg: svg, dots: dotsEl, capTitle: capTitle, capText: capText, play: playEl
    });
  }

  tlPrev.addEventListener('click', function () { if (sceneIdx > 0) selectScene(sceneIdx - 1, true); });
  tlNext.addEventListener('click', function () { if (sceneIdx < scenes.length - 1) selectScene(sceneIdx + 1, true); });

  for (var i = 0; i < scenes.length; i++) {
    var tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tab'; tab.textContent = scenes[i].title;
    (function (idx) { tab.addEventListener('click', function () { selectScene(idx, true); }); })(i);
    tabsEl.appendChild(tab);
  }

  // Reading the full text and watching it animate are two different intents.
  if (window.FullText) window.FullText.wire(fullEl, function () { if (controller) controller.pause(); });

  function indexFromHash() {
    var id = (location.hash || '').replace('#', '');
    for (var h = 0; h < scenes.length; h++) if (scenes[h].id === id) return h;
    return 0;
  }
  selectScene(indexFromHash(), false);
  window.addEventListener('hashchange', function () { selectScene(indexFromHash(), false); });
})();
</script>`;
