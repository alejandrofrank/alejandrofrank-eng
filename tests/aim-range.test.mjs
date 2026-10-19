import test, { afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { Window } from 'happy-dom';
import { createAimRound } from '../public/play/aim-engine.mjs';
import { initAimRange } from '../public/play/aim-range.mjs';

const liveCalendar = { totalContributions: 17, weeks: [
  { contributionDays: [{ date: '2026-10-16', contributionCount: 2 }, { date: '2026-10-17', contributionCount: 0 }] },
  { contributionDays: [{ date: '2026-10-18', contributionCount: 10 }, { date: '2026-10-19', contributionCount: 5 }] },
] };
let calendar = liveCalendar;
mock.method(globalThis, 'fetch', async () => Response.json({ data: { user: { contributionsCollection: { contributionCalendar: calendar } } } }));
const { outputFiles } = await build({ entryPoints: [fileURLToPath(new URL('../src/index.ts', import.meta.url))], bundle: true, write: false, platform: 'node', format: 'esm' });
const { default: app } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].contents).toString('base64')}`);
const fixtures = [];
afterEach(async () => { calendar = liveCalendar; await Promise.all(fixtures.splice(0).map(f => { f.controller?.destroy(); return f.win.happyDOM.close(); })); });

async function fixture({ width = 1100, reduced = false, hash = '' } = {}) {
  const response = await app.request('https://portfolio.test/', { headers: { Cookie: 'portfolio_view=arcade' } }, { GITHUB_USER: 'fixture-user', GITHUB_TOKEN: 'test-only' });
  assert.equal(response.status, 200);
  const win = new Window({ url: 'https://portfolio.test/' + hash, settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true } });
  win.document.documentElement.innerHTML = await response.text();
  const media = new win.EventTarget(); media.matches = reduced; win.matchMedia = () => media;
  const root = win.document.querySelector('[data-aim-range]'), board = root.querySelector('[data-range-board]');
  board.getBoundingClientRect = () => ({ left: 0, top: 0, width, height: 400 });
  const pending = new Map(); let sequence = 0, time = 0;
  const f = { win, root, board, media, pending,
    get: name => root.querySelector(`[data-${name}]`),
    tick(seconds) {
      const frames = Math.round(seconds * 60);
      for (let index = 0; index < frames; index++) {
        time += 1000 / 60;
        const callbacks = [...pending.values()]; pending.clear(); callbacks.forEach(fn => fn(time));
      }
    },
    pointer(node, extra = {}) { node.dispatchEvent(new win.PointerEvent('pointerdown', { bubbles: true, cancelable: true, isPrimary: true, button: 0, clientX: width / 2, clientY: 100, ...extra })); },
    key(key, repeat = false) { win.document.dispatchEvent(new win.KeyboardEvent('keydown', { key, repeat, bubbles: true, cancelable: true })); },
  };
  f.controller = initAimRange(root, { random: () => .5, frames: { request(fn) { const id = ++sequence; pending.set(id, fn); return id; }, cancel(id) { pending.delete(id); } } });
  fixtures.push(f); return f;
}

test('Arcade has its own homepage, ungated portfolio menu and real contribution floor', async () => {
  const f = await fixture(), doc = f.win.document;
  assert.equal(doc.body.dataset.view, 'arcade');
  assert.equal(doc.querySelector('.lobby-name').getAttribute('href'), '/');
  assert.equal(doc.querySelector('.view-choice[aria-current=page]').dataset.view, 'arcade');
  assert.deepEqual([...doc.querySelectorAll('.lobby-menu > a')].map(link => link.getAttribute('href')), ['/play', '/timeline']);
  assert.ok(doc.querySelector('#about summary')); assert.ok(doc.querySelector('#contact a[href^="mailto:"]'));
  assert.equal(doc.querySelector('[data-start]').disabled, false);
  assert.equal(f.controller.snapshot().status, 'ready'); assert.equal(f.pending.size, 0);
  const cells = [...doc.querySelectorAll('.range-floor [data-date]')];
  assert.deepEqual(cells.map(cell => [cell.dataset.date, +cell.dataset.count]), liveCalendar.weeks.flatMap(week => week.contributionDays.map(day => [day.date, day.contributionCount])));
  assert.equal(cells.length, 4, 'no invented contribution dates in a partial calendar');
  assert.match(doc.querySelector('.range-caption').textContent, /17 contributions/);
  assert.match(doc.querySelector('.activity-grid').textContent, /2026-10-19: 5 contributions/);
  const unchanged = cells.map(cell => cell.outerHTML);
  f.get('start').click(); f.pointer(f.get('target-id')); f.tick(1);
  assert.deepEqual(cells.map(cell => cell.outerHTML), unchanged, 'shooting never edits GitHub data');
});

test('missing or malformed GitHub data leaves an honest, playable practice floor', async () => {
  for (const value of [null, { totalContributions: 12, weeks: [] }, { totalContributions: 12, weeks: [{ contributionDays: [{ date: 'bad-date', contributionCount: 2 }] }] }]) {
    calendar = value; const f = await fixture();
    assert.equal(f.win.document.querySelectorAll('.range-floor [data-date]').length, 0);
    assert.match(f.root.textContent, /Practice floor · GitHub activity unavailable/);
    assert.doesNotMatch(f.root.textContent, /12 contributions/);
    f.get('start').click(); assert.equal(f.controller.snapshot().status, 'running');
  }
});

test('round timing, streaks, misses and expirations reward aiming rather than clicking rapidly', () => {
  const round = createAimRound({ random: () => .5 });
  round.step(100); assert.equal(round.snapshot().status, 'ready');
  round.start(); round.step(.5);
  const first = round.snapshot().targets[0];
  const hit = round.shoot(first.id); assert.ok(hit.points > 100);
  assert.equal(round.shoot(first.id), null, 'queued duplicate shots cannot inflate the score');
  assert.equal(round.snapshot().shots, 1); assert.equal(round.snapshot().accuracy, 100);
  assert.equal(round.snapshot().reaction, 500);
  round.shoot(round.snapshot().targets[0].id); assert.equal(round.snapshot().combo, 2);
  const score = round.snapshot().score; round.shoot();
  assert.equal(round.snapshot().score, score - 25); assert.equal(round.snapshot().accuracy, 67);
  assert.equal(round.snapshot().combo, 0); assert.equal(round.snapshot().bestCombo, 2);
  round.step(3); assert.ok(round.snapshot().escaped > 0);
  assert.equal(round.snapshot().shots, 3, 'an expired target is reported separately from a fired miss');
  round.step(100); assert.equal(round.snapshot().remaining, 0); assert.equal(round.snapshot().status, 'finished');
  assert.equal(round.shoot(), null); assert.equal(round.snapshot().targets.length, 0);
  round.start(); assert.equal(round.snapshot().score, 0); assert.equal(round.snapshot().remaining, 30);
});

test('three stages shorten target windows and introduce bounded movement; pause is exact', () => {
  const round = createAimRound({ random: () => .5 }); round.start();
  const early = round.snapshot().targets[0]; round.step(10);
  assert.equal(round.snapshot().stage, 1); assert.ok(round.snapshot().targets[0].lifetime < early.lifetime);
  round.step(10); assert.equal(round.snapshot().stage, 2);
  const before = round.snapshot().targets[0]; round.step(.2);
  assert.notEqual(round.snapshot().targets[0].x, before.x);
  round.pause(); const paused = round.snapshot(); round.step(20); round.shoot();
  assert.deepEqual(round.snapshot(), paused);
  round.resume(); round.step(.1); assert.ok(round.snapshot().elapsed > paused.elapsed);
  for (let index = 0; index < 500; index++) {
    round.step(.01);
    for (const target of round.snapshot().targets) {
      assert.ok(target.x > .08 && target.x < .92); assert.ok(target.y > .25 && target.y < .8);
    }
  }
  const copy = round.snapshot(); copy.targets[0].x = -100;
  assert.ok(round.snapshot().targets[0].x > 0, 'snapshots cannot mutate the simulation');
});

test('reduced motion and keyboard practice keep targets stationary, even after a preference change', () => {
  for (const options of [{ still: true }, { mode: 'keyboard' }]) {
    const round = createAimRound({ random: () => .5 }); round.start(options); round.step(20);
    const first = round.snapshot().targets[0]; round.step(.3);
    assert.equal(round.snapshot().targets[0].x, first.x); assert.equal(round.snapshot().targets[0].y, first.y);
  }
  const round = createAimRound(); round.start(); round.step(20); round.pause(); round.resume({ still: true });
  const first = round.snapshot().targets[0]; round.step(.2); assert.equal(round.snapshot().targets[0].x, first.x);
});

test('mouse and touch shots, pause, resume, results, replay and exit use the shipped controls', async () => {
  for (const width of [360, 1100]) {
    const f = await fixture({ width });
    f.get('start').click(); assert.equal(f.win.document.activeElement, f.board);
    assert.equal(f.get('overlay').hidden, true); assert.equal(f.get('pause').hidden, false);
    f.tick(.5);
    const target = f.get('target-id');
    f.pointer(target, { pointerType: 'touch' });
    target.dispatchEvent(new f.win.MouseEvent('click', { detail: 1, bubbles: true }));
    assert.equal(f.controller.snapshot().hits, 1, 'one pointer gesture produces one shot');
    f.pointer(f.board, { button: 2 }); f.pointer(f.board, { isPrimary: false });
    assert.equal(f.controller.snapshot().shots, 1, 'right click and secondary touches are ignored');
    f.pointer(f.board); assert.equal(f.controller.snapshot().shots, 2);
    assert.equal(f.get('stat="accuracy"').textContent, '50%');
    f.get('pause').click(); const paused = f.controller.snapshot(); f.tick(8);
    assert.deepEqual(f.controller.snapshot(), paused); assert.equal(f.pending.size, 0);
    assert.equal(f.win.document.activeElement, f.get('start'));
    f.get('start').click(); f.tick(31);
    assert.equal(f.controller.snapshot().status, 'finished'); assert.equal(f.pending.size, 0);
    assert.equal(f.get('overlay').hidden, false); assert.match(f.get('overlay-copy').textContent, /50% accuracy/);
    assert.equal(f.win.document.activeElement, f.get('start'));
    assert.ok(Number(f.win.localStorage.getItem('portfolio-aim-best-v1-pointer')) > 0);
    f.get('start').click(); assert.equal(f.controller.snapshot().score, 0);
    f.key('Escape'); assert.equal(f.controller.snapshot().status, 'paused');
    f.key('Escape'); assert.equal(f.controller.snapshot().status, 'ready'); assert.equal(f.pending.size, 0);
    f.get('start').click(); f.get('stop').click(); assert.equal(f.controller.snapshot().status, 'ready');
  }
});

test('menu focus, opening a section, tab hiding and resizing freeze gameplay without trapping navigation', async () => {
  const f = await fixture();
  f.get('start').click(); f.tick(1);
  const link = f.win.document.querySelector('.lobby-menu>a'); link.focus();
  assert.equal(f.controller.snapshot().status, 'paused'); assert.equal(f.win.document.activeElement, link);
  const panel = f.win.document.querySelector('#about'); panel.open = true; panel.dispatchEvent(new f.win.Event('toggle'));
  f.key('Escape'); assert.equal(panel.open, false); assert.equal(f.win.document.activeElement, panel.querySelector('summary'));
  f.get('start').click(); assert.equal(f.controller.snapshot().status, 'running');
  f.win.dispatchEvent(new f.win.Event('blur')); assert.equal(f.controller.snapshot().status, 'paused');
  f.get('start').click(); f.win.dispatchEvent(new f.win.Event('resize')); assert.equal(f.controller.snapshot().status, 'paused');
  f.get('start').click(); Object.defineProperty(f.win.document, 'hidden', { configurable: true, value: true });
  f.win.document.dispatchEvent(new f.win.Event('visibilitychange')); assert.equal(f.controller.snapshot().status, 'paused');
  const deep = await fixture({ hash: '#contact' }); assert.equal(deep.win.document.querySelector('#contact').open, true);
});

test('keyboard practice ignores held keys, stays separate from pointer best scores, and tolerates blocked storage', async () => {
  const f = await fixture(); f.get('start').click(); f.get('stop').click();
  f.root.querySelector('#aim-input').value = 'keyboard'; f.get('start').click();
  f.key('1'); f.key('2', true); assert.equal(f.controller.snapshot().hits, 1);
  f.key('2'); f.key('3'); assert.equal(f.controller.snapshot().hits, 3);
  f.tick(31); assert.ok(Number(f.win.localStorage.getItem('portfolio-aim-best-v1-keyboard')) > 0);
  assert.equal(f.win.localStorage.getItem('portfolio-aim-best-v1-pointer'), null);
  mock.method(f.win.localStorage, 'setItem', () => { throw new Error('Storage blocked'); });
  f.get('start').click(); f.tick(31); assert.equal(f.controller.snapshot().status, 'finished');
  assert.match(f.get('overlay-kicker').textContent, /KEYBOARD PRACTICE/);
});
