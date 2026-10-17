import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { Window } from 'happy-dom';
import { initBasketGame } from '../public/play/games/basket.mjs';
import { initPaletteGame } from '../public/play/games/palette.mjs';
import { initIngestionGame } from '../public/play/games/ingestion.mjs';
import { initIdentityGames } from '../public/play/games/identity.mjs';
import { initQueryGame } from '../public/play/games/query.mjs';

// Exercise the shipped markup and listeners, without claiming browser layout QA.
// Canvas calls are captured here; renderer pixel behavior has separate real tests.
async function markupModule(name) {
  const source = await readFile(new URL(`../src/play/games/${name}.ts`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const modules = await Promise.all(['basket', 'palette', 'ingestion', 'identity', 'query'].map(markupModule));
const markup = modules.flatMap(module => Object.entries(module).filter(([key]) => key.startsWith('render')).map(([, render]) => `<div data-station-panel>${render()}</div>`)).join('');
let win;
const el = selector => document.querySelector(selector);
const click = selector => { const element = el(selector); assert.ok(element, `missing ${selector}`); assert.equal(element.disabled, false, `disabled ${selector}`); element.click(); };
const select = (selector, value) => { el(selector).value = value; el(selector).dispatchEvent(new win.Event('change', { bubbles: true })); };

beforeEach(() => {
  win = new Window({ url: 'https://portfolio.test/play', settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true } });
  for (const key of ['document', 'MutationObserver']) globalThis[key] = win[key];
  globalThis.ImageData = class { constructor(data, width, height) { Object.assign(this, { data, width, height }); } };
  win.HTMLCanvasElement.prototype.getContext = function () { return { putImageData: frame => { this.lastFrame = frame; }, clearRect: () => { this.lastFrame = null; } }; };
  document.body.innerHTML = markup;
  initBasketGame(); initPaletteGame(); initIngestionGame(); initIdentityGames(); initQueryGame();
});
afterEach(async () => { await win.happyDOM.close(); for (const key of ['document', 'MutationObserver', 'ImageData']) delete globalThis[key]; });

test('basket controls reject an empty order, solve all markets and focus the next task', () => {
  click('#bk-checkout'); assert.match(el('#bk-status').textContent, /Fill exactly/);
  for (let level = 0; level < 3; level++) {
    const milk = level === 2 ? 2 : 1, rice = level === 2 ? 4 : 3;
    for (let n = 0; n < 2; n++) click(`[data-offer="${milk}"] [data-delta="1"]`);
    click(`[data-offer="${rice}"] [data-delta="1"]`); click('#bk-checkout');
    assert.equal(el('#bk-status').dataset.outcome, 'won');
    assert.match(el('#bk-ledger').textContent, /per pack/);
    if (level < 2) { assert.equal(document.activeElement.id, 'bk-next'); click('#bk-next'); assert.equal(document.activeElement.id, 'bk-title'); }
  }
  click('#bk-reset'); assert.equal(el('#bk-total').textContent, '$0.00');
  for (let n = 0; n < 3; n++) click('#bk-checkout');
  assert.equal(el('#bk-status').dataset.outcome, 'lost'); assert.equal(document.activeElement.id, 'bk-reset');
});

test('palette controls enforce four choices, provide feedback, recover recipes and bound attempts', () => {
  click('#pl-submit'); assert.match(el('#pl-status').textContent, /2\/4 palette colors/);
  const solutions = [[0, 1, 2, 3], [0, 1, 4, 5], [0, 1, 6, 7]];
  for (let level = 0; level < 3; level++) {
    document.querySelectorAll('[data-color]').forEach(button => {
      if ((button.getAttribute('aria-pressed') === 'true') !== solutions[level].includes(Number(button.dataset.color))) button.click();
    });
    if (level === 2) select('#pl-method', 'bayer');
    click('#pl-submit'); assert.equal(el('#pl-status').dataset.outcome, 'won');
    assert.equal(el('#pl-output').lastFrame.data.length, 48 * 32 * 4);
    if (level < 2) { click('#pl-next'); assert.equal(document.activeElement.id, 'pl-title'); }
  }
  select('#pl-level', '0');
  click('[data-color="0"]'); assert.equal(el('#pl-submit').disabled, true);
  click('[data-color="0"]');
  for (let n = 0; n < 5; n++) click('#pl-submit');
  assert.equal(el('#pl-status').dataset.outcome, 'lost'); assert.equal(el('#pl-history').children.length, 5);
  click('#pl-reset'); assert.equal(el('#pl-history').children.length, 0);
});

test('factory UI repairs duplicate delivery, time ordering and a failed commit', () => {
  const finish = () => { for (let n = 0; n < 20 && !el('#pf-step').disabled; n++) click('#pf-step'); };
  finish(); assert.equal(el('#pf-status').dataset.outcome, 'failed');
  click('[aria-label="Move Check receipt up"]'); finish(); assert.equal(el('#pf-status').dataset.outcome, 'won');
  click('#pf-next'); finish(); assert.equal(el('#pf-status').dataset.outcome, 'failed');
  select('#pf-rule', 'newest'); finish(); assert.equal(el('#pf-status').dataset.outcome, 'won');
  click('#pf-next'); finish(); assert.equal(el('#pf-status').dataset.outcome, 'failed');
  click('[aria-label="Move Save receipt down"]'); finish(); assert.equal(el('#pf-status').dataset.outcome, 'won');
  assert.match(el('#pf-row').textContent, /3.15 USD/); click('#pf-reset'); assert.equal(el('#pf-row').textContent, 'Empty');
});

test('query controls preserve output while reducing scans and reset on replay', () => {
  click('#qg-run'); assert.equal(el('#qg-result').dataset.outcome, 'retry');
  for (let level = 0; level < 3; level++) {
    click('[data-qg-field="notes"]'); click('[data-qg-field="image"]');
    if (level > 0) { click('[data-qg-partition="2026-10-14"]'); click('[data-qg-partition="2026-10-15"]'); }
    if (level === 2) select('#qg-limit', '1');
    click('#qg-run'); assert.equal(el('#qg-result').dataset.outcome, 'won');
    assert.equal(el('#qg-scan').textContent, level === 0 ? '9 u' : '3 u');
    click('#qg-next'); assert.equal(document.activeElement.id, 'qg-heading');
  }
  assert.equal(el('#qg-progress').textContent, '01 / 03'); assert.equal(el('#qg-scan').textContent, '54 u');
});

test('catalog stamps expose actual evidence, complete the manifest and stop after three errors', () => {
  const decisions = ['yes', 'uncertain', 'no', 'no', 'yes', 'uncertain', 'no', 'yes', 'uncertain'];
  decisions.forEach((decision, i) => {
    click(`[data-customs-decision="${decision}"]`);
    assert.match(el('[data-customs-feedback]').textContent, /Stamp accepted/);
    assert.ok(el('[data-customs-checks]').children.length > 0);
    if (i < 8) click('[data-customs-next]');
  });
  assert.match(el('[data-customs-summary]').textContent, /9 correct decisions/);
  click('[data-customs-restart]');
  ['no', 'yes', 'yes'].forEach((decision, i) => { click(`[data-customs-decision="${decision}"]`); if (i < 2) click('[data-customs-next]'); });
  assert.match(el('[data-customs-summary]').textContent, /Desk closed/);
  assert.equal(el('[data-customs-next]').hidden, true);
});

test('garment controls reveal failed constraints, complete each rack and replay', () => {
  click('[data-option="0"]'); click('[data-garment-check]');
  assert.match(el('[data-garment-feedback]').textContent, /Not quite/);
  [2, 4, 0].forEach((option, i) => {
    click(`[data-option="${option}"]`); click('[data-garment-check]');
    assert.match(el('[data-garment-feedback]').textContent, /Rack cleared/);
    if (i < 2) click('[data-garment-next]');
  });
  assert.match(el('[data-garment-summary]').textContent, /3 \/ 3 racks cleared/);
  click('[data-garment-restart]'); assert.equal(el('[data-garment-score]').textContent, '0 racks cleared');
});
