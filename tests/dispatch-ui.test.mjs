import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import ts from 'typescript';
import {Window} from 'happy-dom';
import {initDispatchGame} from '../public/play/games/dispatch.mjs';
const {outputText}=ts.transpileModule(readFileSync(new URL('../src/play/games/dispatch.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}});
const {renderDispatchGame}=await import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));
function setup(width=1280,reduced=false){
 const win=new Window({width}),doc=win.document,callbacks=new Map();let serial=0;
 const media=new win.EventTarget();media.matches=reduced;win.matchMedia=()=>media;
 win.requestAnimationFrame=cb=>{callbacks.set(++serial,cb);return serial;};win.cancelAnimationFrame=id=>callbacks.delete(id);
 win.fetch=()=>{throw Error('Gameplay must not fetch');};doc.body.innerHTML='<section data-station-panel="madrid-delivery-sim">'+renderDispatchGame()+'</section>';
 const root=doc.getElementById('dispatch-game'),app=initDispatchGame(root),$=id=>doc.getElementById('rd-'+id),click=id=>$(id).click();
 function choose(name,value){const input=$('form').elements.namedItem(name);if(input.type==='checkbox')input.checked=value;else input.value=value;input.dispatchEvent(new win.Event('change',{bubbles:true}));}
 function solve(round){for(const q of ['normal','urgent','problem'])choose('route-'+q,q);if(round===1){for(let n=0;n<3;n++)root.querySelector('[data-staff="normal"][data-delta="-1"]').click();for(let n=0;n<3;n++)root.querySelector('[data-staff="urgent"][data-delta="1"]').click();}if(round>=2)choose('claims',true);if(round>=3)choose('milk',true);if(round===4){choose('offline',true);choose('escalate','address');}}
 return {win,doc,root,app,$,click,choose,solve,media,callbacks,tick:now=>{const list=[...callbacks.values()];callbacks.clear();list.forEach(cb=>cb(now));},dispose:async()=>{app.destroy();await win.happyDOM.close();}};
}
test('all five rounds can be played through the actual controls at desktop and phone DOM sizes',async()=>{
 for(const width of [1280,390]){const f=setup(width,true);try{
  for(let round=0;round<5;round++){f.solve(round);for(let n=0;n<120;n++)f.click('step');assert.equal(f.app.state.shift.result.won,true,'round '+round);assert.match(f.$('real').textContent,/In the real system/);const link=f.$('real').querySelector('a');assert.match(link.href,/view=agents&agent=/);if(round<4)f.click('next');}
  assert.match(f.$('result-title').textContent,/Five shifts complete/);assert.equal(f.callbacks.size,0);f.click('reset');assert.equal(f.app.state.round,0);assert.equal(f.app.state.shift,undefined);
 }finally{await f.dispose();}}
});
test('first failure pauses, explains the broken rule, and Continue does not repeatedly pause',async()=>{
 const f=setup();try{
  f.click('run');for(let t=0;t<20000&&f.app.state.playing;t+=50)f.tick(t);
  assert.equal(f.app.state.playing,false);assert.ok(f.app.state.shift.failures.length);assert.equal(f.$('message').dataset.failure,'true');assert.match(f.$('message').textContent,/queue/);assert.equal(f.$('run').textContent,'Continue');
  const first=f.app.state.shift.time;f.click('run');for(let t=20000;t<60000&&f.app.state.playing;t+=50)f.tick(t);assert.ok(f.app.state.shift.finished);assert.ok(f.app.state.shift.time>first);assert.equal(f.$('next').hidden,true);
  f.click('edit');assert.equal(f.$('settings').disabled,false);assert.equal(f.doc.activeElement.name,'route-problem');f.solve(0);for(let n=0;n<120;n++)f.click('step');assert.equal(f.app.state.shift.result.won,true);
 }finally{await f.dispose();}
});
test('staff cannot exceed six and rules cannot change during a running shift',async()=>{
 const f=setup();try{f.solve(0);for(let i=0;i<120;i++)f.click('step');f.click('next');const add=f.root.querySelector('[data-staff="urgent"][data-delta="1"]');assert.ok(add.disabled);f.root.querySelector('[data-staff="normal"][data-delta="-1"]').click();add.click();assert.equal(f.app.state.plan.staff.urgent,2);f.click('run');assert.ok(f.$('settings').disabled);f.choose('route-normal','problem');assert.equal(f.app.state.plan.routing.normal,'normal');}finally{await f.dispose();}
});
test('hidden, blurred and reduced-motion views pause without advancing unseen time',async()=>{
 const f=setup();try{f.click('run');f.tick(100);f.tick(150);f.win.dispatchEvent(new f.win.Event('blur'));const time=f.app.state.shift.time;f.tick(99999);assert.equal(f.app.state.shift.time,time);assert.equal(f.callbacks.size,0);f.click('run');f.tick(100000);assert.equal(f.app.state.shift.time,time);f.media.matches=true;f.media.dispatchEvent(new f.win.Event('change'));assert.equal(f.app.state.playing,false);f.click('run');f.root.closest('section[data-station-panel]').hidden=true;f.tick(100050);assert.equal(f.app.state.playing,false);}finally{await f.dispose();}
});
test('animation interpolates only worker transforms between model updates',async()=>{
 const f=setup();try{f.solve(0);f.click('run');for(let t=0;t<=250;t+=50)f.tick(t);const svg=f.$('map').firstElementChild,worker=svg.querySelector('[data-worker]'),before=worker.getAttribute('transform');f.tick(270);assert.equal(f.$('map').firstElementChild,svg);assert.notEqual(worker.getAttribute('transform'),before);}finally{await f.dispose();}
});
test('mobile rules jump to the current lesson and launch returns focus to the map controls',async()=>{
 const f=setup(390);try{
  f.click('rules-link');assert.equal(f.doc.activeElement.name,'route-normal');f.solve(0);f.click('launch');assert.equal(f.doc.activeElement.id,'rd-run');assert.equal(f.app.state.playing,true);f.click('run');
  f.$('step').focus();for(let i=0;i<112;i++)f.click('step');assert.equal(f.doc.activeElement.id,'rd-next');f.click('next');f.click('rules-link');assert.equal(f.doc.activeElement.dataset.staff,'normal');
 }finally{await f.dispose();}
});
test('the old workshop is gone; the shared warm palette and honest fallback remain',()=>{
 assert.equal(existsSync(new URL('../public/play/games/bots.mjs',import.meta.url)),false);assert.equal(existsSync(new URL('../public/play/games/bot-model.mjs',import.meta.url)),false);
 const page=readFileSync(new URL('../src/play/page.ts',import.meta.url),'utf8');assert.match(page,/Rush Hour Dispatch/);assert.match(page,/<noscript>/);assert.doesNotMatch(page,/Bot Workshop/);
 assert.match(renderDispatchGame(),/No live AI or GCP calls/);assert.match(renderDispatchGame(),/theme.css/);assert.match(readFileSync(new URL('../public/projects/agents-demo/index.html',import.meta.url),'utf8'),/theme.css/);
});
