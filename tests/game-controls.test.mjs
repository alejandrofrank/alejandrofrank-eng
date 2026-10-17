import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { Window } from 'happy-dom';
import { initBasketGame } from '../public/play/games/basket.mjs';
import { initPaletteGame } from '../public/play/games/palette.mjs';
import { createShuffleSession } from '../public/play/games/palette-model.mjs';
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

test('basket controls solve four distinct markets, show receipts and focus the next task', () => {
  click('#bk-checkout'); assert.match(el('#bk-status').textContent, /Fill exactly/);
  const recipes = [[0,2,0,1,1,0],[0,1,0,1,0,1],[1,2,1,1,1,0],[0,0,0,3,1,0,1,0,0]];
  for (let level = 0; level < 4; level++) {
    recipes[level].forEach((count,i)=>{ for(let n=0;n<count;n++) click(`[data-offer="${i}"] [data-delta="1"]`); });
    click('#bk-checkout');
    assert.equal(el('#bk-status').dataset.outcome, 'won');
    assert.match(el('#bk-ledger').textContent, /per pack/);
    if (level < 3) { const previous = el('#bk-title').textContent; assert.equal(document.activeElement.id, 'bk-next'); click('#bk-next'); assert.equal(document.activeElement.id, 'bk-title'); assert.notEqual(el('#bk-title').textContent,previous); assert.equal(el('#bk-total').textContent,'$0.00'); }
  }
  assert.match(el('#bk-status').textContent,/All four/);
  click('#bk-replay'); assert.match(el('#bk-progress').textContent,/0 CLEARED/);
  click('#bk-reset'); assert.equal(el('#bk-total').textContent, '$0.00');
  for (let n = 0; n < 3; n++) click('#bk-checkout');
  assert.equal(el('#bk-status').dataset.outcome, 'lost'); assert.equal(document.activeElement.id, 'bk-reset');
});

test('basket drag uses only local products, respects stock and supports removing packs', () => {
  const drop = () => el('#bk-basket').dispatchEvent(new win.Event('drop',{bubbles:true,cancelable:true}));
  drop(); assert.equal(el('#bk-total').textContent,'$0.00');
  const drag = () => el('[data-drag-offer="1"]').dispatchEvent(new win.Event('dragstart',{bubbles:true,cancelable:true}));
  drag(); drop(); assert.equal(el('#bk-total').textContent,'$1.90');
  drag(); drop(); assert.equal(el('#bk-total').textContent,'$3.80');
  drag(); drop(); assert.equal(el('#bk-total').textContent,'$3.80');
  assert.equal(el('[data-offer="1"] button').disabled,true);
  click('[data-remove="1"]'); assert.equal(el('#bk-total').textContent,'$1.90'); assert.equal(document.activeElement.dataset.remove,'1');
  click('[data-remove="1"]'); assert.equal(el('#bk-total').textContent,'$0.00'); assert.equal(document.activeElement.closest('[data-offer]').dataset.offer,'1');
  drag(); select('#bk-level','1'); drop(); assert.equal(el('#bk-total').textContent,'$0.00');
  select('#bk-level','0'); el('[data-offer="4"] button').focus(); click('[data-offer="4"] button'); assert.equal(document.activeElement.dataset.remove,'4');
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

test('pixel shuffle solves five pictures through direct tile controls without a submit step', () => {
  const reference=createShuffleSession(), choose=i=>{click(`[data-tile="${i}"]`);reference.choose(i);};
  assert.equal(el('#pl-submit'),null);assert.equal(el('#pl-rotate').hidden,true);
  for(let level=0;level<5;level++) {
    for(let i=0;i<reference.state.board.length&&!reference.state.won;i++) {
      const board=reference.state.board;
      if(board[i].id!==i){const from=board.findIndex(t=>t.id===i);choose(i);choose(from);}
    }
    for(let i=0;i<reference.state.board.length&&!reference.state.won;i++) {
      if(reference.state.board[i].turns){choose(i);while(reference.state.board[i].turns&&!reference.state.won){click('#pl-rotate');reference.rotate();}if(reference.state.selected!==null)choose(i);}
    }
    assert.equal(el('#pl-status').dataset.outcome,'won');assert.equal(el('#pl-target').lastFrame.data.length,48*48*4);
    assert.equal(document.activeElement.id,level<4?'pl-next':'pl-replay');
    if(level<4){click('#pl-next');reference.next();assert.equal(document.activeElement.id,'pl-title');}
  }
  assert.match(el('#pl-status').textContent,/All five/);click('#pl-replay');assert.match(el('#pl-completed').textContent,/0 \/ 5/);
});

test('pixel shuffle has keyboard movement, rotation, free undo and a fresh solvable shuffle',()=>{
  click('[data-tile="0"]');assert.equal(el('#pl-moves').textContent,'0');assert.equal(el('[data-tile="0"]').getAttribute('aria-pressed'),'true');
  click('[data-tile="1"]');assert.equal(el('#pl-moves').textContent,'1');click('#pl-undo');assert.equal(el('#pl-moves').textContent,'0');assert.equal(document.activeElement.dataset.tile,'0');
  el('[data-tile="0"]').dispatchEvent(new win.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));assert.equal(document.activeElement.dataset.tile,'1');
  select('#pl-level','2');assert.equal(el('#pl-rotate').hidden,false);el('[data-tile="0"]').focus();
  el('[data-tile="0"]').dispatchEvent(new win.KeyboardEvent('keydown',{key:'r',bubbles:true}));assert.equal(el('#pl-moves').textContent,'1');
  click('#pl-undo');click('#pl-reset');assert.equal(el('#pl-rotate').disabled,true);
  const before=[...el('[data-tile="0"] canvas').lastFrame.data];click('#pl-shuffle');assert.equal(el('#pl-moves').textContent,'0');
  assert.notDeepEqual([...el('[data-tile="0"] canvas').lastFrame.data],before);assert.equal(document.activeElement.id,'pl-title');
});

test('catalog finds verified products across eight checkpoints and stops after three errors', () => {
  const decisions = ['yes', 'uncertain', 'ML-1', 'RC-1', 'FL-1', 'CF-1', 'none', 'BR-1'];
  decisions.forEach((decision, i) => {
    if (i<2) click(`[data-customs-decision="${decision}"]`);
    else { assert.equal(el('[data-customs-commit]').disabled,true); click(decision==='none' ? '[data-customs-none]' : `[data-customs-product="${decision}"]`); click('[data-customs-commit]'); }
    assert.equal(el('[data-customs-feedback]').dataset.correct,'true');
    assert.ok(el('[data-customs-checks]').children.length > 0);
    if (i < 7) click('[data-customs-next]');
  });
  assert.match(el('[data-customs-summary]').textContent, /8 \/ 8 inspections correct/);
  click('[data-customs-restart]');
  ['no', 'yes'].forEach(decision => { click(`[data-customs-decision="${decision}"]`); click('[data-customs-next]'); });
  click('[data-customs-none]'); click('[data-customs-commit]');
  assert.match(el('[data-customs-summary]').textContent, /Shift closed/);
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
