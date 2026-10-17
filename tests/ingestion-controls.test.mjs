import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { Window } from 'happy-dom';
import { initIngestionGame } from '../public/play/games/ingestion.mjs';

const source = await readFile(new URL('../src/play/games/ingestion.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { renderIngestionGame } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
let win;
const q = id => document.querySelector(id);
const click = selector => { const element = q(selector); assert.ok(element, selector); assert.equal(element.disabled, false, selector); element.click(); };
const select = (selector, value) => { q(selector).value = String(value); q(selector).dispatchEvent(new win.Event('change', { bubbles: true })); };
function put(cell, tool, direction = 1) { click(`[data-tool="${tool}"]`); select('#pf-direction', direction); click(`#pf-cell-${cell}`); }
function finish() { for (let n = 0; n < 200 && !q('#pf-step').disabled; n++) click('#pf-step'); }
beforeEach(() => {
  win = new Window({ url: 'https://portfolio.test/play' });
  globalThis.document = win.document; globalThis.MutationObserver = win.MutationObserver;
  document.body.innerHTML = `<section data-station-panel>${renderIngestionGame()}</section>`; initIngestionGame();
});
afterEach(async () => {
  if (q('#pf-run')?.textContent.includes('Pause')) q('#pf-run').click();
  await win.happyDOM.close(); delete globalThis.document; delete globalThis.MutationObserver;
});

test('spatial controls place actual machines, solve all five shifts, undo edits, and retain keyboard focus', () => {
  assert.equal(q('#pf-board').querySelectorAll('[role=gridcell]').length, 35);
  put('C2','read'); put('D2','latest'); put('E2','receipt'); finish();
  assert.equal(q('#pf-status').dataset.outcome, 'won');
  click('#pf-next'); assert.equal(document.activeElement.id, 'pf-level');
  put('B3','check',0); put('C3','belt',2); put('C4','belt',3); put('B4','belt',2); finish();
  assert.equal(q('#pf-status').dataset.outcome, 'won'); assert.equal(q('#pf-deliveries').textContent, '1 / 1 / 0');
  click('#pf-next'); finish(); assert.equal(q('#pf-status').dataset.outcome, 'failed');
  put('D2','latest'); finish(); assert.equal(q('#pf-status').dataset.outcome, 'won');
  click('#pf-next'); finish(); assert.equal(q('#pf-status').dataset.outcome, 'failed');
  put('D1','erase'); put('E1','erase'); put('D1','latest'); put('E1','receipt'); finish();
  assert.equal(q('#pf-status').dataset.outcome, 'won');
  click('#pf-next');
  for (const [cell,kind,direction] of [['B3','check',0],['B2','belt',0],['B1','belt',1],['C1','read',1],['D1','latest',1],['E1','receipt',1],['F1','belt',2],['F2','belt',2],['F3','belt',1],['C3','belt',2],['C4','belt',2],['C5','belt',3]]) put(cell,kind,direction);
  finish(); assert.equal(q('#pf-status').dataset.outcome, 'won'); assert.equal(q('#pf-deliveries').textContent, '2 / 2 / 1');
  click('#pf-reset'); assert.equal(q('#pf-row').textContent, 'Empty');
  put('D1','erase'); assert.equal(q('#pf-cell-D1').dataset.kind, 'empty');
  click('#pf-undo'); assert.equal(q('#pf-cell-D1').dataset.kind, 'latest');
});

test('grid keyboard movement, rotation, erasure and fixed-tile feedback work without dragging', () => {
  put('C2','read'); assert.equal(document.activeElement.id, 'pf-cell-C2');
  q('#pf-cell-C2').dispatchEvent(new win.KeyboardEvent('keydown', { key: 'r', bubbles: true }));
  assert.match(q('#pf-cell-C2').getAttribute('aria-label'), /south/);
  q('#pf-cell-C2').dispatchEvent(new win.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  assert.equal(document.activeElement.id, 'pf-cell-D2');
  q('#pf-cell-C2').dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
  assert.equal(q('#pf-cell-C2').dataset.kind, 'empty');
  click('#pf-cell-D3'); assert.match(q('#pf-status').textContent, /fixed/);
});

test('switching stations pauses the real route and preserves it for Resume', async () => {
  click('#pf-run'); assert.match(q('#pf-run').textContent, /Pause/);
  document.querySelector('[data-station-panel]').hidden = true;
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.match(q('#pf-run').textContent, /Resume/);
  const ticks = q('#pf-ticks').textContent;
  await new Promise(resolve => setTimeout(resolve, 170));
  assert.equal(q('#pf-ticks').textContent, ticks);
});
