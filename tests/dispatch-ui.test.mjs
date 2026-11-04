import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import ts from 'typescript';
import {Window} from 'happy-dom';
import {initDispatchGame} from '../public/play/games/dispatch.mjs';
const {outputText}=ts.transpileModule(readFileSync(new URL('../src/play/games/dispatch.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}});
const {renderDispatchGame}=await import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));
function setup(width=1280,reduced=false){
 const win=new Window({width}),doc=win.document,frames=new Map();let serial=0,now=0;
 const media=new win.EventTarget();media.matches=reduced;const narrow=new win.EventTarget();narrow.matches=width<701;
 win.matchMedia=q=>q.includes('reduced')?media:narrow;win.requestAnimationFrame=cb=>{frames.set(++serial,cb);return serial;};win.cancelAnimationFrame=id=>frames.delete(id);win.fetch=()=>{throw Error('No network during game');};
 doc.body.innerHTML='<section data-station-panel="madrid-delivery-sim">'+renderDispatchGame()+'</section>';
 const root=doc.getElementById('dispatch-game'),app=initDispatchGame(root),$=id=>doc.getElementById('rd-'+id),click=id=>$(id).click();
 function tick(ms=100){now+=ms;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(cb=>cb(now));assert.ok(frames.size<=1,'one animation loop');}
 function route(id,lane){root.querySelector('[data-order="'+id+'"]')?.click();root.querySelector('[data-lane="'+lane+'"]').click();}
 function solveTick(){
  const s=app.state.shift;
  if(s.round>=1)for(const w of s.workers){const q=w.id===1?'normal':w.id===6?'problem':'urgent';if(w.lane!==q&&!w.offline){root.querySelector('[data-bot="'+w.id+'"]').click();root.querySelector('[data-lane="'+q+'"]').click();}}
  if(s.round>=2&&!s.claims)click('claim');for(const b of root.querySelectorAll('[data-note]'))b.click();
  for(const o of s.orders.filter(o=>o.needsHuman)){root.querySelector('[data-order="'+o.id+'"]')?.click();click('human');}
  for(const o of s.orders.filter(o=>o.status==='new')){
   if(!root.querySelector('[data-order="'+o.id+'"]'))continue;
   const load=q=>(s.queues[q].length+s.workers.filter(w=>w.lane===q&&w.job).length)/Math.max(1,s.workers.filter(w=>w.lane===q&&!w.offline).length);
   route(o.id,o.kind==='problem'?'problem':o.kind==='cold'?'urgent':load('normal')*8+8<load('urgent')*3.9+3.9?'normal':'urgent');
  }
 }
 function finish(){if(!app.state.playing)click('run');for(let i=0;i<650&&!app.state.shift.finished;i++){solveTick();if(!app.state.playing)click('run');tick();}assert.ok(app.state.shift.finished);}
 return {win,doc,root,app,$,click,tick,route,solveTick,finish,frames,media,dispose:async()=>{app.destroy();await win.happyDOM.close();}};
}
test('all five live shifts finish through map actions at desktop and phone DOM widths',async()=>{
 for(const width of [1280,390]){const f=setup(width,true);try{for(let round=0;round<5;round++){f.finish();assert.ok(f.app.state.shift.result.won,JSON.stringify(f.app.state.shift.result));assert.equal(f.$('result').hidden,false);assert.match(f.$('real').href,/view=agents&agent=/);assert.equal(f.doc.activeElement.id,'rd-replay');assert.ok(f.$('world').inert);if(round<4)f.click('next');}assert.equal(f.$('next').hidden,true);assert.match(f.$('result-title').textContent,/Madrid/);assert.equal(f.app.state.shift.score.escalations,1);}finally{await f.dispose();}}
});
test('first late failure immediately counts and spotlights; Continue lets later failures flash',async()=>{
 const f=setup();try{f.click('run');for(let n=0;n<250&&f.app.state.playing;n++)f.tick();assert.ok(f.app.state.shift.failures.length);assert.equal(f.app.state.playing,false);assert.equal(f.$('late').textContent,'1');assert.equal(f.root.dataset.focusFailure,'true');assert.ok(f.root.querySelector('.rd-pin.is-focus'));assert.ok(f.root.querySelector('.rd-lane.is-focus'));assert.equal(f.$('run').textContent,'Continue');f.click('edit');assert.equal(f.root.dataset.focusFailure,'false');f.click('run');for(let n=0;n<100;n++)f.tick();assert.ok(f.app.state.playing);assert.ok(Number(f.$('late').textContent)>1);}finally{await f.dispose();}
});
test('tap then tap and number shortcuts route synchronously without stopping animation',async()=>{
 const f=setup();try{f.click('run');f.tick();f.tick();const pin=f.root.querySelector('[data-order="1"]');pin.click();pin.dispatchEvent(new f.win.KeyboardEvent('keydown',{key:'2',bubbles:true}));assert.equal(f.app.state.shift.orders[0].lane,'urgent');assert.equal(f.app.state.playing,true);assert.ok(Number(f.root.dataset.inputLatencyMs)<100);assert.equal(f.frames.size,1);assert.equal(f.root.querySelector('[data-order="1"]'),null);}finally{await f.dispose();}
});
test('dragged pins enter lanes and cancellation does not route or leave a ghost',async()=>{
 const f=setup();try{f.click('run');f.tick();f.tick();const pin=f.root.querySelector('[data-order="1"]');f.doc.elementFromPoint=()=>f.root.querySelector('[data-lane="normal"]');pin.dispatchEvent(new f.win.PointerEvent('pointerdown',{clientX:20,clientY:30,bubbles:true}));f.doc.dispatchEvent(new f.win.PointerEvent('pointermove',{clientX:100,clientY:100,bubbles:true}));assert.ok(f.root.querySelector('.rd-drag-ghost'));f.doc.dispatchEvent(new f.win.PointerEvent('pointerup',{clientX:100,clientY:100,bubbles:true}));assert.equal(f.app.state.shift.orders[0].lane,'normal');assert.equal(f.root.querySelector('.rd-drag-ghost'),null);}finally{await f.dispose();}
});
test('moving a working bot changes its next lane; shared tools remain unlocked',async()=>{
 const f=setup();try{f.finish();f.click('next');assert.equal(f.root.querySelector('[data-bot="1"]').disabled,false);f.click('run');f.tick();f.tick();f.route(1,'normal');f.tick();const job=f.app.state.shift.workers[0].job;f.root.querySelector('[data-bot="1"]').click();f.root.querySelector('[data-lane="urgent"]').click();assert.equal(f.app.state.shift.workers[0].lane,'urgent');assert.equal(f.app.state.shift.workers[0].job,job);f.finish();f.click('next');f.click('claim');f.finish();f.click('next');assert.ok(f.app.state.shift.claims);assert.equal(f.$('claim').getAttribute('aria-pressed'),'true');}finally{await f.dispose();}
});
test('blur, hidden cabinets and motion changes pause, with no hidden-time catch-up',async()=>{
 const f=setup();try{f.click('run');f.tick();f.tick();f.win.dispatchEvent(new f.win.Event('blur'));const time=f.app.state.shift.time;f.tick(90000);assert.equal(f.app.state.shift.time,time);assert.equal(f.frames.size,0);f.click('run');f.tick();assert.equal(f.app.state.shift.time,time);f.media.matches=true;f.media.dispatchEvent(new f.win.Event('change'));assert.equal(f.app.state.playing,false);f.click('run');f.root.closest('section[data-station-panel]').hidden=true;f.tick();assert.equal(f.app.state.playing,false);}finally{await f.dispose();}
});
test('courier transforms interpolate between steps without replacing map nodes',async()=>{
 const f=setup();try{f.click('run');f.tick();f.tick();f.route(1,'urgent');f.tick();const world=f.$('world'),actor=f.$('couriers').firstElementChild,before=actor.style.transform;f.tick(16);assert.equal(f.$('world'),world);assert.equal(f.$('couriers').firstElementChild,actor);assert.notEqual(actor.style.transform,before);}finally{await f.dispose();}
});
test('a throttled frame does not turn a 50-second shift into a ten-minute wait',async()=>{
 const f=setup();try{f.click('run');f.tick();f.tick(1000);assert.ok(f.app.state.shift.time>=.95);f.tick(1000);assert.ok(f.app.state.shift.time>=1.95);f.tick(3000);assert.equal(f.app.state.playing,false);assert.match(f.$('message').textContent,/inactive/);}finally{await f.dispose();}
});
test('all queue controls are real buttons; there are no forms, dropdowns or checkbox inputs',async()=>{
 const f=setup();try{assert.equal(f.root.querySelectorAll('form,select,input').length,0);assert.equal(f.$('sound').getAttribute('aria-pressed'),'false');assert.equal(f.root.querySelectorAll('[data-lane]').length,3);assert.match(f.$('brief').textContent,/Tap a pin/);assert.match(f.root.textContent,/No live AI or GCP calls/);assert.equal(f.$('result').parentNode,f.$('arena'));assert.equal(existsSync(new URL('../public/play/games/dispatch-model.mjs',import.meta.url)),false);}finally{await f.dispose();}
});
