import { createRunner } from './runner-engine.mjs';

export function readTimelineGeometry(chart) {
  const baseline = Number.parseFloat(chart.querySelector('.tlp-line')?.style.top);
  const bars = [...chart.querySelectorAll('.tlp-bar')].map(bar => ({
    id: bar.dataset.role, label: bar.dataset.title,
    category: bar.classList.contains('job') ? 'job' : bar.classList.contains('contract') ? 'contract' : 'project',
    x: Number.parseFloat(bar.style.left), width: Number.parseFloat(bar.style.width),
    bottom: baseline - Number.parseFloat(bar.style.top) - Number.parseFloat(bar.style.height), height: Number.parseFloat(bar.style.height),
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
  const floodElement = find('flood'), floodStatus = find('flood-status'), snoozeButton = find('snooze');
  const generated = find('generated'), nodes = new Map(), held = new Set();
  let engine = null, geometry, frameId = null, lastTime = null, active = false, savedScroll = 0, checkpointLabel = '', floodPhase = '', best = 0;
  try { best = Math.max(0, Number(win.localStorage.getItem('experience-platformer-best')) || 0); } catch { /* optional */ }
  if (!Number.isFinite(best)) best = 0;
  const digits = value => String(value).padStart(5, '0');
  find('best').textContent = digits(best);
  function positionIdle() {
    if (active) return;
    avatar.style.left = '6px'; avatar.style.top = `${readTimelineGeometry(chart).baseline - 44}px`;
    avatar.dataset.running = 'false'; avatar.dataset.duck = 'false'; avatar.dataset.facing = 'right';
  }
  invitation.hidden = false; avatar.hidden = false; positionIdle();
  function stopFrame() {
    if (frameId !== null) win.cancelAnimationFrame(frameId);
    frameId = null; lastTime = null;
  }
  function announce(text) { find('announcement').textContent = text; }
  function saveBest() {
    best = Math.max(best, engine.snapshot().score); find('best').textContent = digits(best);
    try { win.localStorage.setItem('experience-platformer-best', String(best)); } catch { /* play still works */ }
  }
  function clearHeld() {
    held.clear();
    if (engine) { engine.move(0); engine.crouch(false); }
    for (const control of ['left', 'right', 'duck']) find(control).setAttribute('aria-pressed', 'false');
  }
  function updateHeld() {
    if (!active) return;
    const left = [...held].some(key => ['ArrowLeft', 'a', 'A', 'left'].includes(key));
    const right = [...held].some(key => ['ArrowRight', 'd', 'D', 'right'].includes(key));
    const duck = [...held].some(key => ['ArrowDown', 's', 'S', 'duck'].includes(key));
    engine.move(Number(right) - Number(left)); engine.crouch(duck);
    find('left').setAttribute('aria-pressed', String(left)); find('right').setAttribute('aria-pressed', String(right));
    duckButton.setAttribute('aria-pressed', String(duck));
  }
  function drawFlood(flood, baseline, running) {
    const seconds = Math.ceil(flood.remaining);
    floodElement.style.top = `${baseline - flood.height}px`;
    floodElement.style.setProperty('--flood-drift', `${(flood.elapsed * 9) % 780}px`);
    floodElement.style.setProperty('--flood-bob', `${Math.sin(flood.elapsed * 1.6) * 3}px`);
    floodElement.dataset.phase = flood.phase; floodStatus.dataset.phase = flood.phase;
    find('unread').textContent = flood.unread > 99 ? '99+' : String(flood.unread);
    const warnings = {
      quiet: `Pings in ${seconds}s`, warning: `Incoming! ${seconds}s`,
      rising: `Wave ${flood.wave} · Climb!`, high: 'Stay above the inbox',
      falling: 'Pings receding…', muted: `Peace and quiet · ${seconds}s`,
    };
    find('flood-warning').textContent = warnings[flood.phase];
    const available = running && flood.cooldown === 0;
    snoozeButton.setAttribute('aria-disabled', String(!available));
    snoozeButton.textContent = flood.phase === 'muted' ? `Snoozed ${seconds}s` : flood.cooldown > 0 ? `Recharge ${Math.ceil(flood.cooldown)}s` : 'Do not disturb · M';
    snoozeButton.setAttribute('aria-label', available ? 'Do not disturb: drain notifications for five seconds. Shortcut M.' : flood.cooldown > 0 ? `Do not disturb recharges in ${Math.ceil(flood.cooldown)} seconds.` : 'Do not disturb is available while playing.');
    const phase = `${flood.wave}-${flood.phase}`;
    if (phase !== floodPhase) {
      floodPhase = phase;
      if (flood.phase === 'warning') announce('Notification flood incoming. Climb, or press M for Do not disturb.');
      if (flood.phase === 'rising') announce(`Wave ${flood.wave}. The notification sea is rising. Head to higher platforms.`);
      if (flood.phase === 'falling') announce('The notification sea is receding. Lower routes are opening.');
    }
  }
  function draw() {
    const state = engine.snapshot(), width = viewport.clientWidth || 1100;
    // Follow exploration in both directions; high jumps get vertical headroom.
    const camera = Math.max(0, state.x - width * .38);
    const restingBaseline = Math.min(geometry.baseline, (viewport.clientHeight || geometry.baseline + 44) - 132);
    const baseline = restingBaseline + Math.max(0, state.y - Math.max(90, restingBaseline - 175));
    chart.style.transform = `translate3d(${-camera}px,${baseline - geometry.baseline}px,0)`;
    avatar.style.left = `${state.x - camera - 6}px`; avatar.style.top = `${baseline - 44 - state.y}px`;
    avatar.dataset.duck = String(state.duck && state.grounded); avatar.dataset.facing = state.facing < 0 ? 'left' : 'right';
    avatar.dataset.running = String(state.status === 'running' && state.grounded && Math.abs(state.vx) > 15);
    find('ground').style.top = `${baseline}px`;
    drawFlood(state.flood, baseline, state.status === 'running');
    find('score').textContent = digits(state.score);
    find('progress').textContent = `${state.realVisited} / ${state.totalRoles} roles reached · ${state.gems} diamonds`;
    find('phase').textContent = state.phase === 'bonus' ? 'Bonus platforms' : 'Explore the experience';
    find('checkpoint').textContent = `Checkpoint: ${state.checkpoint.label}`;
    if (checkpointLabel !== state.checkpoint.label) {
      checkpointLabel = state.checkpoint.label;
      if (state.checkpoint.platform) announce(`${checkpointLabel} reached. Checkpoint saved.`);
    }
    for (const bar of chart.querySelectorAll('.tlp-bar')) bar.dataset.landed = String(state.platforms.some(item => item.id === bar.dataset.role && item.visited));
    const visible = [];
    for (const bar of state.platforms) if (!bar.real) visible.push({ ...bar, kind: 'platform' });
    for (const hazard of state.hazards) visible.push({ ...hazard, kind: 'spike' });
    for (const coin of state.coins) visible.push({ ...coin, x: coin.x - 6, bottom: coin.y - 6, width: 12, height: 12, kind: 'gem' });
    const onScreen = visible.filter(item => item.x + item.width > camera - 20 && item.x < camera + width + 30);
    const ids = new Set(onScreen.map(item => item.id));
    for (const [id, node] of nodes) if (!ids.has(id)) { node.remove(); nodes.delete(id); }
    for (const item of onScreen) {
      let node = nodes.get(item.id);
      if (!node) {
        node = doc.createElement('div'); node.className = `runner-${item.kind}`;
        // Added platforms are purely visual: no invented role or obstacle labels.
        generated.append(node); nodes.set(item.id, node);
      }
      node.dataset.visited = String(Boolean(item.visited));
      Object.assign(node.style, { left: `${item.x - camera}px`, top: `${baseline - item.bottom - item.height}px`, width: `${item.width}px`, height: `${item.height}px` });
    }
  }
  function finish() {
    stopFrame(); clearHeld(); saveBest();
    const state = engine.snapshot(), flooded = state.hit?.type === 'flood';
    message.hidden = false; find('title').textContent = flooded ? 'This could have been an email.' : 'Watch the spikes';
    find('result').textContent = `${flooded ? 'The quick call was not quick. ' : ''}Return to ${state.checkpoint.label} with a fresh warning period. Your diamonds and visited roles are saved.`;
    retry.textContent = 'Back to checkpoint'; retry.focus(); pauseButton.disabled = true;
    announce(`${flooded ? 'Caught by the notification flood.' : 'Spikes!'} Return to the ${state.checkpoint.label} checkpoint.`);
  }
  function frame(now) {
    frameId = null;
    if (!active || engine.snapshot().status !== 'running') return;
    const delta = lastTime === null ? 0 : (now - lastTime) / 1000; lastTime = now;
    const state = engine.step(delta); draw();
    if (state.status === 'over') finish();
    else frameId = win.requestAnimationFrame(frame);
  }
  function beginFrames() {
    message.hidden = true; pauseButton.disabled = false; pauseButton.textContent = 'Pause';
    region.focus({ preventScroll: true }); lastTime = null; draw(); frameId = win.requestAnimationFrame(frame);
  }
  function start() {
    stopFrame(); clearHeld();
    if (!active) {
      geometry = readTimelineGeometry(chart); engine = createRunner(geometry.bars);
      savedScroll = viewport.scrollLeft; viewport.scrollLeft = 0;
    }
    active = true; checkpointLabel = ''; floodPhase = '';
    chart.dataset.runnerActive = 'true'; chart.inert = true; chart.setAttribute('aria-hidden', 'true');
    stage.classList.add('is-running'); invitation.hidden = true; region.hidden = false;
    engine.start(); beginFrames();
    announce('Move left or right. Space or up jumps onto bars. The notification sea rises after eight seconds. M snoozes it for five seconds. Avoid red spikes. Escape exits.');
  }
  function pause(takeFocus = true) {
    if (!active || engine.snapshot().status !== 'running') return;
    clearHeld(); engine.pause(); stopFrame(); draw(); message.hidden = false;
    find('title').textContent = 'Paused'; find('result').textContent = 'Even the notifications can wait. Your place and the tide are frozen.';
    retry.textContent = 'Resume'; pauseButton.textContent = 'Resume'; announce('Game paused.');
    if (takeFocus) retry.focus();
  }
  function resume() {
    if (!active || engine.snapshot().status !== 'paused') return;
    engine.resume(); beginFrames();
  }
  function exit() {
    if (!active) return;
    stopFrame(); saveBest(); clearHeld(); active = false; engine = null;
    chart.style.transform = ''; delete chart.dataset.runnerActive; chart.inert = false; chart.removeAttribute('aria-hidden');
    stage.classList.remove('is-running'); region.hidden = true; invitation.hidden = false;
    generated.replaceChildren(); nodes.clear(); chart.dispatchEvent(new win.Event('runner-exit'));
    viewport.scrollLeft = savedScroll; positionIdle(); launch.focus({ preventScroll: true });
  }
  function jump() { if (active) engine.jump(); }
  function snooze() {
    if (active && engine.snooze()) {
      draw(); announce('Do not disturb enabled for five seconds. Notifications are draining.');
    }
  }
  launch.addEventListener('click', start); find('exit').addEventListener('click', exit);
  find('restart').addEventListener('click', start);
  retry.addEventListener('click', () => {
    if (engine.snapshot().status === 'paused') resume();
    else { clearHeld(); engine.respawn(); floodPhase = ''; beginFrames(); }
  });
  pauseButton.addEventListener('click', () => engine.snapshot().status === 'paused' ? resume() : pause());
  find('jump').addEventListener('click', jump);
  snoozeButton.addEventListener('click', snooze);
  for (const name of ['left', 'right', 'duck']) {
    const button = find(name);
    button.addEventListener('pointerdown', event => {
      if (!active || engine.snapshot().status !== 'running') return;
      event.preventDefault(); button.setPointerCapture?.(event.pointerId); held.add(name); updateHeld();
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(type, () => { held.delete(name); updateHeld(); });
    button.addEventListener('keydown', event => {
      if ([' ', 'Enter'].includes(event.key)) { event.preventDefault(); held.add(name); updateHeld(); }
    });
    button.addEventListener('keyup', event => {
      if ([' ', 'Enter'].includes(event.key)) { held.delete(name); updateHeld(); }
    });
  }
  const movementKeys = ['ArrowLeft', 'a', 'A', 'ArrowRight', 'd', 'D', 'ArrowDown', 's', 'S'];
  region.addEventListener('keydown', event => {
    if (!active) return;
    if (event.key === 'Escape') { event.preventDefault(); exit(); return; }
    if (event.target.closest('button') && [' ', 'Enter'].includes(event.key)) return;
    if ([' ', 'ArrowUp', 'w', 'W'].includes(event.key)) { event.preventDefault(); if (!event.repeat) jump(); }
    if (movementKeys.includes(event.key)) { event.preventDefault(); held.add(event.key); updateHeld(); }
    if (['p', 'P'].includes(event.key) && !event.repeat) { event.preventDefault(); engine.snapshot().status === 'paused' ? resume() : pause(); }
    if (['m', 'M'].includes(event.key) && !event.repeat) { event.preventDefault(); snooze(); }
  });
  doc.addEventListener('keyup', event => { if (movementKeys.includes(event.key)) { held.delete(event.key); updateHeld(); } });
  doc.addEventListener('visibilitychange', () => { if (doc.hidden) pause(false); });
  win.addEventListener('blur', () => pause(false)); win.addEventListener('pagehide', () => pause(false));
  win.addEventListener('resize', () => { if (active) { pause(false); draw(); } else win.setTimeout(positionIdle, 170); });
  win.addEventListener('beforeprint', () => pause(false));
  region.addEventListener('focusout', event => { if (event.relatedTarget && !region.contains(event.relatedTarget)) pause(false); });
  return { start, exit, pause, resume, snapshot: () => engine?.snapshot() ?? { status: 'idle' } };
}
