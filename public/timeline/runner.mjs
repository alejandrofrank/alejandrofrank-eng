import { createRunner, RUNNER } from './runner-engine.mjs';

export function readTimelineGeometry(chart) {
  const baseline = Number.parseFloat(chart.querySelector('.tlp-line')?.style.top);
  const bars = [...chart.querySelectorAll('.tlp-bar')].map(bar => ({
    id: bar.dataset.role, label: bar.dataset.title,
    category: bar.classList.contains('job') ? 'job' : bar.classList.contains('contract') ? 'contract' : 'project',
    x: Number.parseFloat(bar.style.left), width: Number.parseFloat(bar.style.width),
    bottom: baseline - Number.parseFloat(bar.style.top) - Number.parseFloat(bar.style.height),
    height: Number.parseFloat(bar.style.height),
  }));
  return { baseline, bars };
}

export function initTimelineRunner(doc = document) {
  const stage = doc.querySelector('[data-timeline-stage]');
  if (!stage || stage.dataset.runnerMounted) return null;
  const win = doc.defaultView, chart = stage.querySelector('#tlp'), viewport = stage.querySelector('.tlp-scroll');
  if (!chart.querySelector('.tlp-bar')) return null;
  stage.dataset.runnerMounted = 'true';
  const find = name => stage.querySelector(`[data-runner-${name}]`);
  const region = stage.querySelector('[data-timeline-runner]');
  const launch = find('start'), invitation = find('invitation'), avatar = find('avatar');
  const message = find('message'), retry = find('retry'), pauseButton = find('pause'), duckButton = find('duck');
  const generated = find('generated'), generatedNodes = new Map();
  let engine = null, geometry, frameId = null, lastTime = null, active = false, savedScroll = 0, phase = '', best = 0;
  try { best = Math.max(0, Number(win.localStorage.getItem('experience-runner-best')) || 0); } catch { /* optional */ }
  if (!Number.isFinite(best)) best = 0;
  const digits = value => String(value).padStart(5, '0');
  find('best').textContent = digits(best);

  function positionIdle() {
    if (active) return;
    const baseline = readTimelineGeometry(chart).baseline;
    avatar.style.left = '12px'; avatar.style.top = `${baseline - 44}px`;
    avatar.dataset.running = 'false'; avatar.dataset.duck = 'false';
  }
  invitation.hidden = false; avatar.hidden = false; positionIdle();

  function stopFrame() {
    if (frameId !== null) win.cancelAnimationFrame(frameId);
    frameId = null; lastTime = null;
  }
  function announce(text) { find('announcement').textContent = text; }
  function draw() {
    const state = engine.snapshot();
    const baseline = Math.min(geometry.baseline, (viewport.clientHeight || geometry.baseline + 44) - 94);
    const camera = state.x - 50;
    chart.style.transform = `translate3d(${-camera}px,${baseline - geometry.baseline}px,0)`;
    avatar.style.left = '44px'; avatar.style.top = `${baseline - 44 - state.y}px`;
    avatar.dataset.duck = String(state.duck && state.y === 0);
    avatar.dataset.running = String(state.status === 'running' && state.y === 0);
    duckButton.setAttribute('aria-pressed', String(state.duck));
    find('ground').style.top = `${baseline}px`;
    find('score').textContent = digits(state.score);
    find('progress').textContent = state.phase === 'experience' ? `${state.realCleared} / ${state.totalRoles} roles cleared` : `${(state.speed / 155).toFixed(1)}× speed`;
    find('phase').textContent = state.phase === 'experience' ? 'Real experience · opening course' : 'Endless course · generated bars';
    if (phase !== state.phase) {
      phase = state.phase;
      if (phase === 'endless') announce('All real experience bars cleared. Endless course: generated obstacles, increasing speed.');
    }
    const visible = state.obstacles.filter(bar => !bar.real && bar.x + bar.width > camera - 20 && bar.x < camera + (viewport.clientWidth || 1100) + 50);
    const ids = new Set(visible.map(bar => bar.id));
    for (const [id, node] of generatedNodes) if (!ids.has(id)) { node.remove(); generatedNodes.delete(id); }
    for (const bar of visible) {
      let node = generatedNodes.get(bar.id);
      if (!node) {
        node = doc.createElement('div'); node.className = `runner-obstacle ${bar.category}`;
        const label = doc.createElement('span'); label.textContent = bar.label; node.append(label);
        generated.append(node); generatedNodes.set(bar.id, node);
      }
      Object.assign(node.style, { left: `${bar.x - camera}px`, top: `${baseline - bar.bottom - bar.height}px`, width: `${bar.width}px`, height: `${bar.height}px` });
    }
  }
  function finish() {
    stopFrame();
    const state = engine.snapshot();
    best = Math.max(best, state.score); find('best').textContent = digits(best);
    try { win.localStorage.setItem('experience-runner-best', String(best)); } catch { /* play still works */ }
    message.hidden = false; find('title').textContent = 'End of the run';
    const advice = state.hit.bottom === 0 ? 'Jump over low blocks.' : state.hit.bottom < RUNNER.height ? 'Hold down to crouch under long bars.' : 'Stay on the ground beneath high beams.';
    find('result').textContent = `${state.hit.label} caught you. ${advice} Score: ${state.score}.`;
    retry.textContent = 'Run again'; retry.focus(); pauseButton.disabled = true;
    announce(`Run ended at ${state.hit.label}. Score ${state.score}.`);
  }
  function frame(now) {
    frameId = null;
    if (!active || engine.snapshot().status !== 'running') return;
    const delta = lastTime === null ? 0 : (now - lastTime) / 1000; lastTime = now;
    const state = engine.step(delta, viewport.clientWidth || 1100); draw();
    if (state.status === 'over') finish();
    else frameId = win.requestAnimationFrame(frame);
  }
  function start() {
    stopFrame();
    if (!active) {
      geometry = readTimelineGeometry(chart); engine = createRunner(geometry.bars);
      savedScroll = viewport.scrollLeft; viewport.scrollLeft = 0;
    }
    active = true; phase = '';
    chart.dataset.runnerActive = 'true'; chart.inert = true; chart.setAttribute('aria-hidden', 'true');
    stage.classList.add('is-running'); invitation.hidden = true; region.hidden = false; message.hidden = true;
    pauseButton.disabled = false; pauseButton.textContent = 'Pause';
    engine.start(); region.focus({ preventScroll: true }); draw();
    announce('Run started. Space or up to jump, hold down to crouch, release to run. Escape exits.');
    frameId = win.requestAnimationFrame(frame);
  }
  function pause(takeFocus = true) {
    if (!active || engine.snapshot().status !== 'running') return;
    engine.pause(); stopFrame(); draw(); message.hidden = false;
    find('title').textContent = 'Paused'; find('result').textContent = 'Your place is saved. Continue when you’re ready.';
    retry.textContent = 'Resume run'; pauseButton.textContent = 'Resume'; announce('Run paused.');
    if (takeFocus) retry.focus();
  }
  function resume() {
    if (!active || engine.snapshot().status !== 'paused') return;
    engine.resume(); message.hidden = true; pauseButton.textContent = 'Pause';
    region.focus({ preventScroll: true }); lastTime = null; draw(); frameId = win.requestAnimationFrame(frame);
  }
  function exit() {
    if (!active) return;
    stopFrame(); active = false; engine = null;
    chart.style.transform = ''; delete chart.dataset.runnerActive; chart.inert = false; chart.removeAttribute('aria-hidden');
    stage.classList.remove('is-running'); region.hidden = true; invitation.hidden = false;
    generated.replaceChildren(); generatedNodes.clear();
    chart.dispatchEvent(new win.Event('runner-exit'));
    viewport.scrollLeft = savedScroll; positionIdle(); launch.focus({ preventScroll: true });
  }
  function jump() { if (active) { engine.jump(); region.focus({ preventScroll: true }); } }
  function releaseDuck() { if (active) { engine.crouch(false); draw(); } }
  launch.addEventListener('click', start);
  find('exit').addEventListener('click', exit);
  retry.addEventListener('click', () => engine.snapshot().status === 'paused' ? resume() : start());
  pauseButton.addEventListener('click', () => engine.snapshot().status === 'paused' ? resume() : pause());
  find('jump').addEventListener('click', jump);
  duckButton.addEventListener('pointerdown', event => {
    if (!active || engine.snapshot().status !== 'running') return;
    event.preventDefault(); duckButton.setPointerCapture?.(event.pointerId); engine.crouch(true); draw();
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) duckButton.addEventListener(type, releaseDuck);
  duckButton.addEventListener('keydown', event => {
    if (active && [' ', 'Enter'].includes(event.key)) { event.preventDefault(); engine.crouch(true); draw(); }
  });
  duckButton.addEventListener('keyup', event => { if ([' ', 'Enter'].includes(event.key)) releaseDuck(); });
  region.addEventListener('keydown', event => {
    if (!active) return;
    if (event.key === 'Escape') { event.preventDefault(); exit(); return; }
    if (event.target.closest('button')) return;
    if ([' ', 'ArrowUp', 'w', 'W'].includes(event.key)) { event.preventDefault(); if (!event.repeat) jump(); }
    if (['ArrowDown', 's', 'S'].includes(event.key)) { event.preventDefault(); engine.crouch(true); draw(); }
    if (['p', 'P'].includes(event.key) && !event.repeat) { event.preventDefault(); engine.snapshot().status === 'paused' ? resume() : pause(); }
  });
  doc.addEventListener('keyup', event => { if (['ArrowDown', 's', 'S'].includes(event.key)) releaseDuck(); });
  doc.addEventListener('visibilitychange', () => { if (doc.hidden) pause(false); });
  win.addEventListener('blur', () => pause(false));
  win.addEventListener('pagehide', () => pause(false));
  win.addEventListener('resize', () => {
    if (active) { pause(false); draw(); }
    else win.setTimeout(positionIdle, 170); // after the timeline's responsive layout
  });
  win.addEventListener('beforeprint', () => pause(false));
  region.addEventListener('focusout', event => {
    if (event.relatedTarget && !region.contains(event.relatedTarget)) pause(false);
  });
  return { start, exit, pause, resume, snapshot: () => engine?.snapshot() ?? { status: 'idle' } };
}
