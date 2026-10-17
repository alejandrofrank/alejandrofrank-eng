import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { mountCabinetScreen } from '../public/play/arcade-screen.mjs';

test('cabinet opens the live game, exits by button or Escape and restores the launching cabinet', async () => {
  const win = new Window(); globalThis.document = win.document;
  document.body.innerHTML = '<div class="station"><input id="launch" type="radio"></div><section data-station-panel="one" aria-labelledby="one-title" style="--station:#abc"><span class="console-slot">01 / Example</span><h2 id="one-title">Test game</h2><input id="game-value"></section><section data-station-panel="two" aria-labelledby="two-title"><h2 id="two-title">Other game</h2></section>';
  let exits = 0; const panels = [...document.querySelectorAll('[data-station-panel]')];
  const cabinet = mountCabinetScreen({panels,onExit:()=>exits++}), trigger = document.getElementById('launch');
  assert.ok(panels.every(p=>p.hidden)); assert.equal(cabinet.open('unknown',trigger),false);
  cabinet.open('one',trigger); assert.equal(cabinet.isOpen,true); assert.equal(panels[0].hidden,false); assert.equal(panels[1].hidden,true);
  assert.equal(document.body.style.overflow,'hidden'); assert.equal(document.activeElement.className,'screen-exit');
  document.getElementById('game-value').value='ongoing puzzle';
  document.querySelector('.screen-exit').click(); assert.equal(cabinet.isOpen,false); assert.ok(panels.every(p=>p.hidden)); assert.equal(document.activeElement,trigger); assert.equal(document.body.style.overflow,''); assert.equal(exits,1);
  cabinet.open('one',trigger); assert.equal(document.getElementById('game-value').value,'ongoing puzzle');
  document.getElementById('arcade-screen').dispatchEvent(new win.Event('cancel',{cancelable:true}));
  assert.equal(cabinet.isOpen,false); assert.equal(exits,2); assert.equal(document.activeElement,trigger);
  cabinet.open('two',trigger); assert.equal(document.getElementById('arcade-screen-title').textContent,'Other game');
  cabinet.close({notify:false}); assert.equal(exits,2); assert.equal(cabinet.isOpen,false);
  await win.happyDOM.close(); delete globalThis.document;
});
