import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { Window } from 'happy-dom';

// Exercise the real floor controller and dialog against live game markup.
// Happy DOM verifies routing, state and focus; this is not browser layout QA.
const source = await readFile(new URL('../src/play/games/identity.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { renderIdentityGame, renderGarmentGame } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

const stations = [
  ['catalog-match-lab', 'Catalog Customs'],
  ['bakiano', 'Basket Run'],
  ['vesti', 'Complete the rack'],
];
const fixture = `
  <nav aria-label="Portfolio view"><a class="view-choice" data-view="original" href="/">Original</a><a class="view-choice" data-view="tech" href="/tech">Tech</a><a class="view-choice" data-view="arcade" href="/play">Arcade</a></nav>
  <section id="arcade-room" hidden><fieldset id="station-controls"><legend>Choose a project station</legend><div class="room-scroll"><div class="arcade-floor">
    ${stations.map(([slug, title], index) => `<div class="station"><input type="radio" name="station" id="station-${slug}" value="${slug}"${index === 0 ? ' checked' : ''}><label for="station-${slug}"><span class="cabinet-face">${title}</span></label></div>`).join('')}
    <div id="room-player"></div></div></div></fieldset><span id="room-position"></span><a id="room-enter" href="#concept-catalog-match-lab">Enter cabinet</a></section>
  <div class="station-panels">
    <section id="concept-catalog-match-lab" data-station-panel="catalog-match-lab" aria-labelledby="catalog-panel-title"><span class="console-slot">03 / Catalog Match</span><h2 id="catalog-panel-title">Catalog Customs</h2>${renderIdentityGame()}</section>
    <section id="concept-bakiano" data-station-panel="bakiano" aria-labelledby="basket-panel-title"><span class="console-slot">01 / Bakiano</span><h2 id="basket-panel-title">Basket Run</h2><label>Saved basket note <input id="basket-note"></label></section>
    <section id="concept-vesti" data-station-panel="vesti" aria-labelledby="vesti-panel-title"><span class="console-slot">06 / Vesti</span><h2 id="vesti-panel-title">Complete the rack</h2>${renderGarmentGame()}</section>
  </div>
  <details id="image-inspector"><summary>Image inspector</summary><div id="image-demo" hidden><div id="image-demo-controls"></div><span id="image-demo-status"></span><button id="image-repeat" type="button">Repeat</button><div id="image-evidence" hidden></div><canvas id="image-source"></canvas><canvas id="image-plain"></canvas><canvas id="image-dithered"></canvas></div></details>
  <div id="match-demo" hidden><form id="match-form"><input id="match-request" value="Loma whole milk 1 L"><input id="match-candidate" value="Loma whole milk 1000 ml"></form><span id="match-baseline"></span><span id="match-decision"></span><span id="match-reason"></span><div id="match-identity"></div><table><tbody id="match-checks"></tbody></table></div>`;

let win;
const el = selector => document.querySelector(selector);
const radio = slug => document.getElementById(`station-${slug}`);
const panel = slug => document.querySelector(`[data-station-panel="${slug}"]`);
const settle = () => win.happyDOM.waitUntilComplete();
const clickCabinet = slug => el(`label[for="station-${slug}"] .cabinet-face`).click();
const cancelDialog = () => el('#arcade-screen').dispatchEvent(new win.Event('cancel', { cancelable: true }));

beforeEach(() => {
  win = new Window({ url: 'https://portfolio.test/play', settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true } });
  for (const key of ['window', 'document', 'history', 'location']) globalThis[key] = key === 'window' ? win : win[key];
  globalThis.ResizeObserver = class { observe() {} disconnect() {} };
  document.body.innerHTML = fixture;
});

afterEach(async () => {
  await win.happyDOM.close();
  for (const key of ['window', 'document', 'history', 'location', 'ResizeObserver']) delete globalThis[key];
});

async function mount(hash = '') {
  if (hash) history.replaceState(null, '', hash);
  // appearance.mjs reads document during module evaluation, so import after setup.
  const { initArcade } = await import('../public/play/arcade.mjs');
  initArcade();
  await settle();
}

function assertOpen(slug, title) {
  const dialog = el('#arcade-screen');
  assert.equal(dialog.open, true);
  assert.equal(panel(slug).closest('dialog'), dialog);
  assert.equal(panel(slug).hidden, false);
  assert.ok([...document.querySelectorAll('[data-station-panel]')].filter(item => item !== panel(slug)).every(item => item.hidden));
  assert.equal(el('#arcade-screen-title').textContent, title);
  assert.equal(document.activeElement, dialog.querySelector('.screen-exit'));
  assert.equal(document.body.style.overflow, 'hidden');
  assert.equal(radio(slug).checked, true);
  assert.equal(location.hash, `#concept-${slug}`);
}

function assertFloor(slug) {
  assert.equal(el('#arcade-screen').open, false);
  assert.ok([...document.querySelectorAll('[data-station-panel]')].every(item => item.hidden));
  assert.equal(document.activeElement, radio(slug));
  assert.equal(radio(slug).checked, true);
  assert.equal(document.body.style.overflow, '');
  assert.equal(location.hash, `#${slug}`);
  assert.equal(el('#room-enter').getAttribute('href'), `#concept-${slug}`);
}

test('cabinet clicks open the actual game; Back and Escape preserve its live progress', async () => {
  await mount();
  assert.equal(el('#arcade-room').hidden, false);
  assert.equal(el('#arcade-screen').open, false);
  const originalGame = el('#identity-game');
  clickCabinet('catalog-match-lab');
  assertOpen('catalog-match-lab', 'Catalog Customs');
  el('[data-customs-decision="yes"]').click();
  assert.match(el('[data-customs-feedback]').textContent, /Stamp accepted/);
  el('.screen-exit').click();
  await settle();
  assertFloor('catalog-match-lab');
  el('#room-enter').click();
  assertOpen('catalog-match-lab', 'Catalog Customs');
  assert.equal(el('#identity-game'), originalGame, 'opening must reuse the mounted game');
  assert.match(el('[data-customs-feedback]').textContent, /Stamp accepted/);
  assert.equal(el('[data-customs-decision="yes"]').disabled, true);
  el('[data-customs-next]').click();
  assert.match(el('[data-customs-progress]').textContent, /Checkpoint 2/);
  cancelDialog();
  await settle();
  assertFloor('catalog-match-lab');
  clickCabinet('catalog-match-lab');
  assert.match(el('[data-customs-progress]').textContent, /Checkpoint 2/);
});

test('leaving a different cabinet keeps that selection instead of returning to the previous floor hash', async () => {
  await mount('#catalog-match-lab');
  clickCabinet('bakiano');
  assertOpen('bakiano', 'Basket Run');
  el('#basket-note').value = 'Keep my selected products';
  el('.screen-exit').click();
  await settle();
  assertFloor('bakiano');
  assert.equal(el('.view-choice[data-view="tech"]').getAttribute('href'), '/tech#bakiano');
  clickCabinet('vesti');
  assertOpen('vesti', 'Complete the rack');
  cancelDialog();
  await settle();
  assertFloor('vesti');
  clickCabinet('bakiano');
  assert.equal(el('#basket-note').value, 'Keep my selected products');
});

test('radio selection and Enter open the selected cabinet with a working exit target', async () => {
  await mount();
  const selected = radio('vesti');
  selected.checked = true;
  selected.focus();
  selected.dispatchEvent(new win.Event('change', { bubbles: true }));
  assert.equal(location.hash, '#vesti');
  assert.equal(el('#arcade-screen').open, false);
  const enter = new win.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
  selected.dispatchEvent(enter);
  assert.equal(enter.defaultPrevented, true);
  assertOpen('vesti', 'Complete the rack');
  cancelDialog();
  await settle();
  assertFloor('vesti');
});

test('a direct concept link opens its cabinet and exits without navigating away', async () => {
  await mount('#concept-vesti');
  assertOpen('vesti', 'Complete the rack');
  const historyLength = history.length;
  el('.screen-exit').click();
  await settle();
  assertFloor('vesti');
  assert.equal(history.length, historyLength, 'direct-link exit replaces the route instead of creating history');
  assert.equal(location.pathname, '/play');
});

test('browser Back closes and Forward reopens the same live game', async () => {
  await mount('#catalog-match-lab');
  clickCabinet('vesti');
  assertOpen('vesti', 'Complete the rack');
  el('[data-option="2"]').click();
  el('[data-garment-check]').click();
  assert.match(el('[data-garment-feedback]').textContent, /Rack cleared/);
  history.back();
  await settle();
  assertFloor('vesti');
  history.forward();
  await settle();
  assertOpen('vesti', 'Complete the rack');
  assert.match(el('[data-garment-feedback]').textContent, /Rack cleared/);
  assert.equal(el('[data-garment-next]').hidden, false);
});
