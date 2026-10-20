import test, { afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { Window } from 'happy-dom';
import { createAimRound, INTRO_SECONDS, BURST_SECONDS } from '../public/play/aim-engine.mjs';
import { initAimRange } from '../public/play/aim-range.mjs';

const weeks = Array.from({ length: 53 }, (_, column) => ({ contributionDays: Array.from({ length: 7 }, (_, row) => ({
  date: new Date(Date.UTC(2025, 9, 19 + column * 7 + row)).toISOString().slice(0, 10), contributionCount: (column + row) % 11,
})).filter((_, row) => column === 0 ? row >= 4 : column === 52 ? row <= 2 : true) }));
const liveCalendar = { totalContributions: weeks.flatMap(week => week.contributionDays).reduce((sum, day) => sum + day.contributionCount, 0), weeks };
let calendar = liveCalendar;
mock.method(globalThis, 'fetch', async () => Response.json({ data: { user: { contributionsCollection: { contributionCalendar: calendar } } } }));
const { outputFiles } = await build({ entryPoints: [fileURLToPath(new URL('../src/index.ts', import.meta.url))], bundle: true, write: false, platform: 'node', format: 'esm' });
const { default: app } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].contents).toString('base64')}`);
const fixtures = [];
afterEach(async () => { calendar = liveCalendar; await Promise.all(fixtures.splice(0).map(f => { f.controller?.destroy(); return f.win.happyDOM.close(); })); });

async function fixture({ width = 1100, reduced = false, hash = '', random = () => .5 } = {}) {
  const response = await app.request('https://portfolio.test/', { headers: { Cookie: 'portfolio_view=arcade' } }, { GITHUB_USER: 'fixture-user', GITHUB_TOKEN: 'test-only' });
  assert.equal(response.status, 200);
  const win = new Window({ url: 'https://portfolio.test/' + hash, settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true } });
  win.document.documentElement.innerHTML = await response.text();
  const media = new win.EventTarget(); media.matches = reduced; win.matchMedia = () => media;
  const root = win.document.querySelector('[data-aim-range]'), board = root.querySelector('[data-range-board]');
  const grid = root.querySelector('[data-grid]'), scroll = root.querySelector('[data-grid-scroll]');
  const columns = +grid.dataset.columns;
  const size = Math.max(width <= 600 ? 22 : 16, (width - (columns - 1) * 4) / columns);
  const gridWidth = columns * (size + 4) - 4, height = 7 * (size + 4) - 4;
  Object.defineProperty(scroll, 'clientWidth', { value: width }); Object.defineProperty(scroll, 'scrollWidth', { value: gridWidth });
  scroll.getBoundingClientRect = () => ({ left: 0, right: width, top: 0, width, height });
  grid.getBoundingClientRect = () => ({ left: -scroll.scrollLeft, top: 0, width: gridWidth, height });
  for (const cell of grid.querySelectorAll('.range-day')) cell.getBoundingClientRect = () => {
    const left = +cell.dataset.column * (size + 4) - scroll.scrollLeft;
    return { left, right: left + size, top: +cell.dataset.row * (size + 4), width: size, height: size };
  };
  const pending = new Map(); let sequence = 0, time = 0;
  const f = { win, root, board, grid, scroll, media, pending, size,
    get: name => root.querySelector(`[data-${name}]`),
    tick(seconds) {
      for (let index = 0; index < Math.round(seconds * 60); index++) {
        time += 1000 / 60; const callbacks = [...pending.values()]; pending.clear(); callbacks.forEach(fn => fn(time));
      }
    },
    pointer(node, extra = {}) { node.dispatchEvent(new win.PointerEvent('pointerdown', { bubbles: true, cancelable: true, isPrimary: true, button: 0, clientX: width / 2, clientY: 70, ...extra })); },
    key(key, repeat = false) { win.document.dispatchEvent(new win.KeyboardEvent('keydown', { key, repeat, bubbles: true, cancelable: true })); },
    play() { f.get('start').click(); f.tick(1.3); assert.equal(f.controller.snapshot().status, 'running'); },
  };
  f.controller = initAimRange(root, { random, frames: { request(fn) { const id = ++sequence; pending.set(id, fn); return id; }, cancel(id) { pending.delete(id); } } });
  fixtures.push(f); return f;
}

test('the ordinary daily graph is visible first, with a top-center Play control and no game overlay', async () => {
  const f = await fixture(), doc = f.win.document;
  assert.equal(doc.body.dataset.view, 'arcade');
  assert.deepEqual([...doc.querySelectorAll('.lobby-menu > a')].map(link => link.getAttribute('href')), ['/play', '/timeline']);
  assert.ok(doc.querySelector('#about summary')); assert.ok(doc.querySelector('#contact a[href^="mailto:"]'));
  assert.equal(f.controller.snapshot().status, 'ready'); assert.equal(f.pending.size, 0);
  assert.equal(f.get('start').disabled, false); assert.equal(f.get('start').hidden, false);
  assert.ok(f.get('start').closest('.range-launch'));
  assert.ok([...f.root.children].indexOf(f.get('start').closest('.range-launch')) < [...f.root.children].indexOf(f.board));
  assert.equal(winStyle(f, '.range-launch', 'justifyContent'), 'center');
  assert.equal(doc.querySelector('.range-overlay,.range-floor,.aim-orb'), null);
  assert.equal(f.get('metrics').hidden, true); assert.equal(f.get('targets').hidden, true);
  const cells = [...doc.querySelectorAll('.range-day[data-date]')];
  assert.deepEqual(cells.map(cell => [cell.dataset.date, +cell.dataset.count]), weeks.flatMap(week => week.contributionDays.map(day => [day.date, day.contributionCount])));
  assert.match(doc.querySelector('.range-caption').textContent, new RegExp(liveCalendar.totalContributions.toLocaleString() + ' contributions'));
  const unchanged = cells.map(cell => cell.outerHTML);
  f.play(); f.pointer(f.get('target-id')); f.get('stop').click();
  assert.equal(f.root.dataset.status, 'ready'); assert.equal(f.grid.dataset.boot, '');
  assert.deepEqual(cells.map(cell => cell.outerHTML), unchanged, 'exit restores every original cell, color, date and count');
});

function winStyle(f, selector, property) { return f.win.getComputedStyle(f.root.querySelector(selector))[property]; }

test('Play lights the whole graph, turns it off, then starts the clock and four-square targets', async () => {
  const f = await fixture(); f.get('start').click();
  assert.equal(f.controller.snapshot().status, 'starting'); assert.equal(f.grid.dataset.boot, 'lit');
  assert.equal(f.get('start').hidden, true); assert.equal(f.root.querySelectorAll('.is-target').length, 0);
  f.pointer(f.grid); assert.equal(f.controller.snapshot().shots, 0);
  f.tick(.7); assert.equal(f.grid.dataset.boot, 'dark'); assert.equal(f.controller.snapshot().remaining, 30);
  f.tick(.6); assert.equal(f.controller.snapshot().status, 'running'); assert.equal(f.grid.dataset.boot, '');
  assert.ok(f.controller.snapshot().remaining > 29.8);
  assert.equal(f.root.querySelectorAll('.range-day.is-target').length, 12);
  for (const target of f.controller.snapshot().targets) {
    const button = f.root.querySelector(`[data-target-id="${target.id}"]`);
    assert.equal(button.style.gridColumn, `${target.column + 1} / span 2`);
    assert.equal(button.style.gridRow, `${target.row + 1} / span 2`);
    for (const column of [target.column, target.column + 1]) for (const row of [target.row, target.row + 1]) {
      assert.ok(f.root.querySelector(`.range-day.is-target[data-column="${column}"][data-row="${row}"]`));
    }
  }
});

test('startup can pause, resume and exit; reduced motion skips the light-up entirely', async () => {
  const f = await fixture(); f.get('start').click(); f.tick(.3); f.key('Escape');
  const paused = f.controller.snapshot(); f.tick(10); assert.deepEqual(f.controller.snapshot(), paused);
  assert.equal(f.grid.dataset.boot, ''); assert.equal(f.pending.size, 0);
  f.get('start').click(); assert.equal(f.controller.snapshot().status, 'starting'); f.tick(1); assert.equal(f.controller.snapshot().status, 'running');
  f.get('stop').click(); f.get('start').click(); f.get('stop').click(); f.tick(10);
  assert.equal(f.controller.snapshot().status, 'ready'); assert.equal(f.grid.dataset.boot, ''); assert.equal(f.pending.size, 0);
  const still = await fixture({ reduced: true }); still.get('start').click();
  assert.equal(still.controller.snapshot().status, 'running'); assert.equal(still.grid.dataset.boot, '');
});

test('every clump uses four existing cells, never overlaps another target or spills into missing/future days', () => {
  const cells = weeks.flatMap((week, column) => week.contributionDays.map(day => ({ column, row: new Date(day.date + 'T00:00:00Z').getUTCDay() })));
  const available = new Set(cells.map(cell => `${cell.column}:${cell.row}`));
  const round = createAimRound({ cells, columns: 53, random: () => .99 }); round.start({ skipIntro: true, window: { first: 40, last: 52 } });
  for (let index = 0; index < 290; index++) {
    const occupied = new Set();
    for (const target of round.snapshot().targets) {
      for (const other of round.snapshot().targets.filter(other => other.id !== target.id)) {
        assert.ok(Math.abs(target.column - other.column) >= 3 || Math.abs(target.row - other.row) >= 3, 'a dark row or column separates each clump');
      }
      assert.ok(target.column >= 40 && target.column + 1 <= 52); assert.ok(target.row >= 0 && target.row < 6);
      for (const column of [target.column, target.column + 1]) for (const row of [target.row, target.row + 1]) {
        const position = `${column}:${row}`; assert.ok(available.has(position)); assert.ok(!occupied.has(position)); occupied.add(position);
      }
    }
    round.step(.1); if (index % 3 === 0) round.shoot(round.snapshot().targets[0]?.id);
  }
  const sparse = createAimRound({ columns: 2, cells: [{ column: 0, row: 0 }, { column: 1, row: 1 }] });
  assert.equal(sparse.start().canPlay, false); assert.equal(sparse.snapshot().status, 'ready');
});

test('difficulty shortens time windows while keeping four-square targets and scoring honest', () => {
  const round = createAimRound({ random: () => .5 }); round.start(); round.step(INTRO_SECONDS);
  round.step(.5); const first = round.snapshot().targets[0];
  const hit = round.shoot(first.id); assert.ok(hit.points > 100); assert.equal(round.shoot(first.id), null);
  assert.equal(round.snapshot().shots, 1); assert.equal(round.snapshot().reaction, 500);
  round.shoot(round.snapshot().targets[0].id); const score = round.snapshot().score; round.shoot();
  assert.equal(round.snapshot().score, score - 25); assert.equal(round.snapshot().accuracy, 67); assert.equal(round.snapshot().combo, 0);
  round.step(3); assert.ok(round.snapshot().escaped > 0); assert.equal(round.snapshot().shots, 3);
  round.step(6.5); assert.equal(round.snapshot().stage, 1); const quick = round.snapshot().targets[0].lifetime;
  assert.ok(quick < first.lifetime); round.step(10); assert.equal(round.snapshot().stage, 2);
  assert.ok(round.snapshot().targets[0].lifetime < quick);
  const copy = round.snapshot(); copy.targets[0].column = -1; assert.ok(round.snapshot().targets[0].column >= 0);
  round.pause(); const paused = round.snapshot(); round.step(50); round.shoot(); assert.deepEqual(round.snapshot(), paused);
  round.resume(); round.step(100); assert.equal(round.snapshot().status, 'finished'); assert.equal(round.snapshot().remaining, 0);
});

test('only timeouts produce short-lived bursts; shots, transitions and pauses cannot leave stale explosions', () => {
  const round = createAimRound({ random: () => .5 }); round.start({ skipIntro: true });
  const initial = round.snapshot().targets;
  round.shoot(initial[0].id); round.shoot();
  assert.deepEqual(round.snapshot().bursts, [], 'neither hits nor fired misses cause timeout feedback');
  const score = round.snapshot().score;
  round.step(2.8); let state = round.snapshot();
  assert.deepEqual(state.bursts.map(burst => [burst.id, burst.column, burst.row]), initial.slice(1).map(target => [target.id, target.column, target.row]));
  assert.equal(state.escaped, 2); assert.equal(state.shots, 2); assert.equal(state.score, score);
  state.bursts[0].column = -999; assert.ok(round.snapshot().bursts[0].column >= 0);
  round.step(BURST_SECONDS / 2); assert.ok(round.snapshot().bursts.every(burst => burst.age > 0));
  round.step(BURST_SECONDS); assert.deepEqual(round.snapshot().bursts, []);
  round.start({ skipIntro: true }); round.step(2.8); round.pause();
  assert.deepEqual(round.snapshot().bursts, []); round.resume(); assert.deepEqual(round.snapshot().bursts, []);
  round.start({ skipIntro: true }); round.step(10); assert.deepEqual(round.snapshot().bursts, [], 'a difficulty transition is not a timeout');
  round.step(1.9); assert.ok(round.snapshot().bursts.length > 0);
  round.step(30); assert.deepEqual(round.snapshot().bursts, []); assert.equal(round.snapshot().status, 'finished');
});

test('timeouts briefly redden nearby existing visible cells, protect live targets and restore the graph', async () => {
  for (const settings of [{ width: 1100, random: () => 0 }, { width: 360, random: () => 0 }, { reduced: true }]) {
    const f = await fixture(settings), days = [...f.grid.querySelectorAll('.range-day')];
    const data = () => days.map(day => [day.dataset.date, day.dataset.count, day.style.getPropertyValue('--cell')]);
    const original = data(); f.play(); const before = f.controller.snapshot();
    f.tick(before.targets[0].lifetime - before.elapsed + .1);
    const expired = f.controller.snapshot(), red = [...f.grid.querySelectorAll('.is-burst')];
    assert.ok(red.length > 4, 'the timeout colors surrounding squares, not just a text marker');
    assert.ok(red.some(day => !before.targets.some(target => +day.dataset.column >= target.column && +day.dataset.column <= target.column + 1 && +day.dataset.row >= target.row && +day.dataset.row <= target.row + 1)), 'some red squares must be outside every expired clump');
    for (const day of red) {
      const column = +day.dataset.column, row = +day.dataset.row;
      assert.ok(column >= expired.window.first && column <= expired.window.last);
      assert.ok(expired.bursts.some(burst => Math.hypot(column - burst.column - .5, row - burst.row - .5) < 4.4));
      assert.equal(day.classList.contains('is-target'), false);
      assert.ok(Number(day.style.getPropertyValue('--burst')) > 0);
    }
    f.tick(.15); assert.equal(f.grid.querySelector('.is-burst.is-target'), null, 'respawned targets must stay green');
    f.tick(BURST_SECONDS); assert.equal(f.grid.querySelector('.is-burst'), null);
    assert.ok(days.every(day => day.style.getPropertyValue('--burst') === ''));
    assert.deepEqual(data(), original);
    // Interrupt another burst and ensure it cannot return on Resume or replay.
    for (let frame = 0; frame < 200 && !f.grid.querySelector('.is-burst'); frame++) f.tick(1 / 60);
    assert.ok(f.grid.querySelector('.is-burst')); f.get('pause').click();
    assert.equal(f.grid.querySelector('.is-burst'), null); assert.equal(f.pending.size, 0);
    f.get('start').click(); assert.equal(f.grid.querySelector('.is-burst'), null);
    f.get('stop').click(); assert.deepEqual(data(), original); assert.equal(f.grid.querySelector('.is-burst'), null);
  }
});

test('timeout ripples travel in a circular wave, reaching sides before corners and clearing the center', async () => {
  let random = .51;
  const f = await fixture({ random: () => random }); f.play();
  const initial = f.controller.snapshot(), target = initial.targets[0];
  // Let one central clump expire; move other targets away from its ripple.
  random = .95;
  f.tick(target.lifetime - initial.elapsed - .05);
  for (const other of initial.targets.slice(1)) f.pointer(f.root.querySelector(`[data-target-id="${other.id}"]`));
  for (let frame = 0; frame < 10 && !f.controller.snapshot().bursts.length; frame++) f.tick(1 / 60);
  assert.equal(f.controller.snapshot().bursts.length, 1);
  const cell = (dx, dy) => f.grid.querySelector(`.range-day[data-column="${target.column + dx}"][data-row="${target.row + dy}"]`);
  const red = (dx, dy) => cell(dx, dy).classList.contains('is-burst');
  assert.ok(red(0, 0)); assert.equal(red(-1, 0), false);
  f.tick(.1);
  assert.ok(red(-1, 0), 'the nearer side receives the wave first');
  assert.equal(red(-1, -1), false, 'the diagonal corner is farther away, despite the same square-grid offset');
  assert.equal(cell(-1, 0).style.getPropertyValue('--burst'), cell(2, 0).style.getPropertyValue('--burst'), 'equal radial distances light equally');
  f.tick(.1);
  assert.equal(red(0, 0), false, 'the core goes dark behind the wave');
  assert.ok(red(-1, -1), 'the wave reaches the diagonal next');
  f.tick(.1);
  assert.ok(red(-2, -1), 'the wave continues outward');
  assert.equal(red(-1, -1), false, 'the inner ring clears too');
  assert.equal(red(-3, -3), false, 'distant corners never become a rectangular flash');
  f.tick(.15); assert.equal(f.grid.querySelector('.is-burst'), null);
});

test('reduced motion keeps the circular timeout cue stationary', async () => {
  const f = await fixture({ reduced: true }); f.play();
  const state = f.controller.snapshot(); f.tick(state.targets[0].lifetime - state.elapsed + .02);
  const redCells = () => [...f.grid.querySelectorAll('.is-burst')].map(day => [day.dataset.column, day.dataset.row, day.style.getPropertyValue('--burst')]);
  const first = redCells(); assert.ok(first.length > 0);
  f.tick(.05); assert.deepEqual(redCells(), first, 'no outward movement or pulsing');
  f.tick(BURST_SECONDS); assert.deepEqual(redCells(), []);
});

test('small screens use visible weeks with tappable clumps and recalculate after scrolling', async () => {
  const f = await fixture({ width: 360 }); assert.ok(f.scroll.scrollLeft > 0);
  assert.ok(f.size * 2 + 4 >= 44, 'the clump remains at least 44px across');
  f.play(); let state = f.controller.snapshot(); assert.ok(state.window.first > 0);
  for (const target of state.targets) assert.ok(target.column >= state.window.first && target.column + 1 <= state.window.last);
  f.scroll.scrollLeft = 0; f.scroll.dispatchEvent(new f.win.Event('scroll')); assert.equal(f.controller.snapshot().status, 'paused');
  f.get('start').click(); state = f.controller.snapshot(); assert.equal(state.window.first, 0);
  for (const target of state.targets) assert.ok(target.column >= state.window.first && target.column + 1 <= state.window.last);
});

test('mouse, touch, results, replay and Escape restore the graph without duplicate shots', async () => {
  for (const width of [360, 1100]) {
    const f = await fixture({ width }); f.play(); assert.equal(f.win.document.activeElement, f.board);
    const target = f.get('target-id'); f.pointer(target, { pointerType: 'touch' });
    target.dispatchEvent(new f.win.MouseEvent('click', { detail: 1, bubbles: true })); assert.equal(f.controller.snapshot().hits, 1);
    f.pointer(f.grid, { button: 2 }); f.pointer(f.grid, { isPrimary: false }); assert.equal(f.controller.snapshot().shots, 1);
    f.pointer(f.grid); assert.equal(f.get('stat="accuracy"').textContent, '50%');
    f.get('pause').click(); const paused = f.controller.snapshot(); f.tick(8); assert.deepEqual(f.controller.snapshot(), paused);
    assert.equal(f.root.querySelectorAll('.is-target').length, 0); assert.equal(f.win.document.activeElement, f.get('start'));
    f.get('start').click(); f.tick(31); assert.equal(f.controller.snapshot().status, 'finished'); assert.equal(f.pending.size, 0);
    assert.equal(f.root.querySelectorAll('.is-target').length, 0); assert.match(f.get('result').textContent, /50% accuracy/);
    assert.ok(Number(f.win.localStorage.getItem('portfolio-grid-aim-best-v2-pointer')) > 0);
    f.get('start').click(); assert.equal(f.controller.snapshot().status, 'starting'); assert.equal(f.controller.snapshot().score, 0);
    f.key('Escape'); f.key('Escape'); assert.equal(f.controller.snapshot().status, 'ready'); assert.equal(f.pending.size, 0);
  }
});

test('menu focus, tab hiding and resizing freeze gameplay without trapping navigation', async () => {
  const f = await fixture(); f.play(); const link = f.win.document.querySelector('.lobby-menu>a'); link.focus();
  assert.equal(f.controller.snapshot().status, 'paused'); assert.equal(f.win.document.activeElement, link);
  const panel = f.win.document.querySelector('#about'); panel.open = true; panel.dispatchEvent(new f.win.Event('toggle'));
  f.key('Escape'); assert.equal(panel.open, false); assert.equal(f.win.document.activeElement, panel.querySelector('summary'));
  for (const event of ['blur', 'resize', 'pagehide']) { f.get('start').click(); f.win.dispatchEvent(new f.win.Event(event)); assert.equal(f.controller.snapshot().status, 'paused'); }
  f.get('start').click(); Object.defineProperty(f.win.document, 'hidden', { configurable: true, value: true });
  f.win.document.dispatchEvent(new f.win.Event('visibilitychange')); assert.equal(f.controller.snapshot().status, 'paused');
  const deep = await fixture({ hash: '#contact' }); assert.equal(deep.win.document.querySelector('#contact').open, true);
});

test('keyboard practice and blocked storage remain playable, with scores separate from the old range', async () => {
  const f = await fixture({ reduced: true }); f.root.querySelector('#aim-input').value = 'keyboard'; f.get('start').click();
  f.key('1'); f.key('2', true); assert.equal(f.controller.snapshot().hits, 1); f.key('2'); f.key('3'); assert.equal(f.controller.snapshot().hits, 3);
  f.tick(31); assert.ok(Number(f.win.localStorage.getItem('portfolio-grid-aim-best-v2-keyboard')) > 0);
  assert.equal(f.win.localStorage.getItem('portfolio-grid-aim-best-v2-pointer'), null);
  assert.equal(f.win.localStorage.getItem('portfolio-aim-best-v1-keyboard'), null);
  mock.method(f.win.localStorage, 'setItem', () => { throw new Error('Storage blocked'); });
  f.get('start').click(); f.tick(31); assert.equal(f.controller.snapshot().status, 'finished'); assert.match(f.get('result').textContent, /Keyboard practice/);
});

test('missing GitHub data uses labeled practice squares; an incomplete calendar never invents real days', async () => {
  for (const value of [null, { totalContributions: 12, weeks: [] }]) {
    calendar = value; const f = await fixture();
    assert.equal(f.root.querySelectorAll('.range-day[data-date]').length, 0);
    assert.match(f.root.textContent, /Practice grid · GitHub activity unavailable/); f.play();
  }
  calendar = { totalContributions: 2, weeks: [{ contributionDays: [{ date: '2026-10-20', contributionCount: 2 }] }] };
  const f = await fixture(); assert.equal(f.root.querySelectorAll('.range-day').length, 1); assert.equal(f.get('start').disabled, true);
  assert.match(f.root.textContent, /Not enough adjacent days/);
});
