import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {Window} from 'happy-dom';
import {initBotGame} from '../public/play/games/bots.mjs';
const {outputText}=ts.transpileModule(readFileSync(new URL('../src/play/games/bots.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}});
const {renderBotGame}=await import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));
function setup(reduced=false){
 const win=new Window(),doc=win.document,callbacks=new Map();let n=0;
 const media=new win.EventTarget();media.matches=reduced;win.matchMedia=()=>media;
 win.requestAnimationFrame=cb=>{callbacks.set(++n,cb);return n;};win.cancelAnimationFrame=id=>callbacks.delete(id);
 doc.body.innerHTML='<section data-station-panel="madrid-delivery-sim">'+renderBotGame()+'</section>';
 const root=doc.getElementById('bot-game'),app=initBotGame(root),click=id=>root.querySelector('#bw-'+id).click();
 return {win,doc,root,app,media,callbacks,click,tick:now=>{const list=[...callbacks.values()];callbacks.clear();list.forEach(cb=>cb(now));},dispose:async()=>{app.destroy();await win.happyDOM.close();}};
}
test('player can see a failed shift, repair its real attachment and finish without losing keyboard focus',async()=>{
 const f=setup();try{
  f.click('step');for(let i=0;i<30;i++)f.click('step');assert.equal(f.app.game.state.result.won,false);assert.equal(f.root.querySelector('#bw-next').hidden,true);
  f.click('repair');const button=f.root.querySelector('[data-choice="reassign"]');button.click();
  assert.equal(f.doc.activeElement.dataset.choice,'reassign');assert.match(f.root.querySelector('#bw-world').textContent,/ROUTE/);
  f.click('step');for(let i=0;i<30;i++)f.click('step');assert.equal(f.app.game.state.result.won,true);assert.equal(f.root.querySelector('#bw-next').hidden,false);
  f.click('next');assert.equal(f.app.game.state.round,1);assert.match(f.root.querySelector('#bw-title').textContent,/hear/);assert.equal(f.doc.activeElement.id,'bw-run');
 }finally{await f.dispose();}
});
test('visible message packets, trace and live counters follow steps instead of exposing the future result',async()=>{
 const f=setup();try{
  f.root.querySelector('[data-choice="reassign"]').click();f.click('step');assert.equal(f.root.querySelector('#bw-goal').textContent,'0 / 3 delivered');
  f.click('step');f.click('step');assert.equal(f.root.querySelector('#bw-packet').hasAttribute('hidden'),false);
  assert.match(f.root.querySelector('#bw-speech').textContent,/Inventory → Dispatch/);assert.equal(f.root.querySelectorAll('#bw-log li').length,3);
  f.click('repair');assert.equal(f.root.querySelector('#bw-packet').hasAttribute('hidden'),true);
 }finally{await f.dispose();}
});
test('part switches preserve keyboard focus and Repair focuses an editable fitted attachment',async()=>{
 const f=setup();try{
  const talk=f.root.querySelector('[data-part="radio"]');talk.focus();talk.click();assert.equal(f.doc.activeElement.dataset.part,'radio');
  const tools=f.root.querySelector('[data-part="tool"]');tools.focus();tools.click();assert.equal(f.doc.activeElement.dataset.part,'tool');
  f.click('step');for(let i=0;i<30;i++)f.click('step');assert.match(f.root.querySelector('#bw-part-help').textContent,/^Return/);
  f.root.querySelector('#bw-repair').focus();f.click('repair');assert.equal(f.doc.activeElement.dataset.choice,'notify');assert.equal(f.doc.activeElement.disabled,false);
 }finally{await f.dispose();}
});
test('run pauses on cabinet closure, browser blur and reduced-motion changes with no hidden-time catch-up',async()=>{
 const f=setup();try{
  f.click('run');assert.equal(f.app.playing,true);f.tick(100);f.tick(150);const cursor=f.app.game.state.cursor;
  f.win.dispatchEvent(new f.win.Event('blur'));assert.equal(f.app.playing,false);assert.equal(f.callbacks.size,0);f.tick(100000);assert.equal(f.app.game.state.cursor,cursor);
  f.click('run');f.tick(100100);assert.equal(f.app.game.state.cursor,cursor);f.media.matches=true;f.media.dispatchEvent(new f.win.Event('change'));assert.equal(f.app.playing,false);
  f.click('run');f.root.closest('section[data-station-panel]').hidden=true;f.tick(100200);assert.equal(f.app.playing,false);assert.equal(f.callbacks.size,0);
 }finally{await f.dispose();}
});
test('reduced-motion visitors can step the entire campaign and inspect all GCP mappings',async()=>{
 const f=setup(true);try{
  assert.equal(f.callbacks.size,0);assert.equal(f.root.querySelectorAll('#bw-gcp dt').length,5);
  for(let r=0;r<5;r++){
   const configs={tool:'reassign',radio:'addressed',memory:'scoped',engine:'hybrid',stock:'reserve'};
   for(const [key,val] of Object.entries(configs)){
    const role={tool:'dispatcher',radio:'dispatcher',engine:'dispatcher',memory:'support',stock:'inventory'}[key];
    f.root.querySelector('[data-bw-robot="'+role+'"]').click();f.root.querySelector('[data-part="'+key+'"]').click();
    const choice=f.root.querySelector('[data-choice="'+val+'"]');if(choice&&!choice.disabled)choice.click();
   }
   f.click('step');for(let i=0;i<50;i++)f.click('step');assert.equal(f.app.game.state.result.won,true);if(r<4)f.click('next');
  }
  assert.match(f.root.querySelector('#bw-result-title').textContent,/Workshop complete/);assert.equal(f.callbacks.size,0);
  f.click('restart');assert.equal(f.app.game.state.round,0);assert.equal(f.root.querySelector('#bw-result').hidden,true);
 }finally{await f.dispose();}
});
