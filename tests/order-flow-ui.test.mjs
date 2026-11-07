import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {build} from 'esbuild';
import {Window} from 'happy-dom';
import {LEVELS,solve,legalMoves,blocker} from '../public/play/games/order-flow-model.mjs';
import {SAVE_KEY} from '../public/play/games/order-flow-progress.mjs';
import {initOrderFlowGame} from '../public/play/games/order-flow.mjs';
const {outputFiles}=await build({entryPoints:['src/play/games/order-flow.ts'],bundle:true,write:false,platform:'node',format:'esm'});
const {renderOrderFlowGame,orderFlowStyles}=await import('data:text/javascript;base64,'+Buffer.from(outputFiles[0].contents).toString('base64'));
async function fixture({reduce=true,index=0,save=null,noStorage=false}={}){
 const win=new Window({url:'https://arcade.example/play'});win.document.body.innerHTML='<section data-station-panel="madrid-delivery-sim">'+renderOrderFlowGame()+'</section>';
 if(save!==null)win.localStorage.setItem(SAVE_KEY,save);
 else if(index)win.localStorage.setItem(SAVE_KEY,JSON.stringify({version:2,level:index,stars:LEVELS.map((_,i)=>i<index?3:0),actions:[]}));
 if(noStorage)Object.defineProperty(win,'localStorage',{get(){throw Error('blocked');}});
 const media=new win.EventTarget();media.matches=reduce;win.matchMedia=()=>media;
 const pending=new Map();let serial=0;const previous={};
 for(const k of ['window','document','MutationObserver','requestAnimationFrame','cancelAnimationFrame'])previous[k]=globalThis[k];
 Object.assign(globalThis,{window:win,document:win.document,MutationObserver:win.MutationObserver,requestAnimationFrame:fn=>{pending.set(++serial,fn);return serial;},cancelAnimationFrame:id=>pending.delete(id)});
 const controller=initOrderFlowGame(),get=id=>win.document.getElementById('of-'+id),car=id=>get('grid').querySelector('[data-car="'+id+'"]'),tap=id=>car(id).click();
 const finish=()=>{const s=controller.snapshot();for(const id of solve(LEVELS[s.level],s.state).path)tap(id);};
 return {win,media,pending,get,car,tap,finish,controller,tick:now=>{const batch=[...pending.values()];pending.clear();batch.forEach(fn=>fn(now));},save:()=>win.localStorage.getItem(SAVE_KEY),close:async()=>{controller.destroy();await win.happyDOM.close();Object.assign(globalThis,previous);}};
}
test('all ten packed yards play through shipped controls and save three-star wins',async()=>{
 const f=await fixture();try{for(let i=0;i<10;i++){assert.equal(f.controller.snapshot().level,i);assert.equal(f.get('grid').children.length,LEVELS[i].cars.length);f.finish();assert.equal(f.get('result').hidden,false);assert.equal(f.get('stars').getAttribute('aria-label'),'3 of 3 stars');assert.equal(f.controller.snapshot().stars[i],3);assert.equal(f.get('real-note').textContent,LEVELS[i].note);assert.ok(f.get('real').href.includes('agent='+LEVELS[i].agent));f.get('next').click();}assert.equal(f.controller.snapshot().level,0);}finally{await f.close();}
});
test('a blocked car highlights its actual blocker and records feedback without removing either car',async()=>{
 const f=await fixture();try{const before=f.controller.snapshot(),bad=before.state.yard.find(id=>blocker(LEVELS[0],before.state,id)),by=blocker(LEVELS[0],before.state,bad);f.tap(bad);assert.deepEqual(f.controller.snapshot().state,before.state);assert.equal(f.controller.snapshot().mistakes,1);assert.ok(f.car(by).classList.contains('is-blocker'));assert.match(f.get('message').textContent,/Clear the highlighted car/);assert.match(f.get('score').textContent,/1 blocked/);f.finish();assert.equal(f.get('stars').getAttribute('aria-label'),'2 of 3 stars');}finally{await f.close();}
});
test('the grid has only touching car buttons, central arrows and two seat marks; no numeric car labels',async()=>{
 const f=await fixture();try{for(const c of f.get('grid').children){assert.equal(c.textContent,'');assert.equal(c.querySelectorAll('.of-seat').length,2);assert.equal(c.querySelectorAll('.of-direction').length,1);assert.ok(c.getAttribute('aria-label').includes('arrow'));}assert.equal(f.get('grid').querySelectorAll('.of-cell,.of-count,.of-release').length,0);}finally{await f.close();}
});
test('rapid legal taps commit instantly while one animation loop handles every departing car',async()=>{
 const f=await fixture({reduce:false});try{const path=solve(LEVELS[0]).path;for(const id of path.slice(0,5))f.tap(id);assert.equal(f.controller.snapshot().state.moves,5);assert.equal(f.pending.size,1);f.tick(0);f.tick(180);assert.equal(f.pending.size,0);for(const id of path.slice(0,5))assert.ok(f.car(id).classList.contains('is-empty'));}finally{await f.close();}
});
test('reduced motion finishes in-flight cars without changing the committed state',async()=>{
 const f=await fixture({reduce:false});try{const id=legalMoves(LEVELS[0],f.controller.snapshot().state)[0];f.tap(id);const state=f.controller.snapshot().state;f.media.matches=true;f.media.dispatchEvent(new f.win.Event('change'));assert.equal(f.pending.size,0);assert.deepEqual(f.controller.snapshot().state,state);assert.ok(f.car(id).classList.contains('is-empty'));}finally{await f.close();}
});
test('Undo cancels departing visuals, restores the same car and is capped at three',async()=>{
 const f=await fixture({reduce:false});try{for(let i=0;i<3;i++){const id=legalMoves(LEVELS[0],f.controller.snapshot().state)[0];f.tap(id);f.get('undo').click();assert.equal(f.pending.size,0);assert.equal(f.car(id).disabled,false);assert.equal(f.car(id).style.transform,'');assert.equal(f.controller.snapshot().state.moves,0);}assert.equal(f.get('undo').disabled,true);assert.equal(f.get('undo').textContent,'Undo 0');}finally{await f.close();}
});
test('Hint points to a provably clear car and its help cost is visible in the score',async()=>{
 const f=await fixture();try{f.get('hint').click();const h=f.get('grid').querySelector('.is-hint');assert.ok(legalMoves(LEVELS[0],f.controller.snapshot().state).includes(Number(h.dataset.car)));assert.equal(f.win.document.activeElement,h);assert.equal(f.controller.snapshot().hints,1);assert.match(f.get('score').textContent,/1 hint$/);f.finish();assert.equal(f.get('stars').getAttribute('aria-label'),'2 of 3 stars');}finally{await f.close();}
});
test('keyboard arrows navigate spatially and departed cars leave the focus order',async()=>{
 const f=await fixture();try{const a=f.car(1);a.focus();a.dispatchEvent(new f.win.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));assert.equal(f.win.document.activeElement,f.car(2));const id=legalMoves(LEVELS[0],f.controller.snapshot().state)[0];f.tap(id);assert.equal(f.car(id).tabIndex,-1);assert.equal(f.car(id).getAttribute('aria-hidden'),'true');assert.equal(f.car(id).disabled,true);assert.equal(f.get('grid').querySelectorAll('[tabindex="0"]').length,1);}finally{await f.close();}
});
test('mid-yard progress, blocked taps, hints, Undo and final stars survive reload',async()=>{
 let saved;let f=await fixture();try{const id=legalMoves(LEVELS[0],f.controller.snapshot().state)[0];f.tap(1);f.get('hint').click();f.tap(id);f.get('undo').click();saved=f.save();}finally{await f.close();}
 f=await fixture({save:saved});try{assert.equal(f.controller.snapshot().mistakes,1);assert.equal(f.controller.snapshot().hints,1);assert.equal(f.controller.snapshot().undos,1);f.finish();saved=f.save();}finally{await f.close();}
 f=await fixture({save:saved});try{assert.equal(f.get('result').hidden,false);assert.equal(f.controller.snapshot().stars[0],1);assert.equal(f.get('real').target,'_blank');assert.match(f.get('real').rel,/noopener/);}finally{await f.close();}
});
test('level picker only exposes earned levels and returns keyboard focus',async()=>{
 const f=await fixture({index:2});try{f.get('level').click();assert.equal(f.get('level-list').children[3].disabled,true);f.get('close-levels').click();assert.equal(f.win.document.activeElement,f.get('level'));f.get('level').click();f.get('level-list').children[0].click();assert.equal(f.controller.snapshot().level,0);assert.equal(f.controller.snapshot().stars[0],3);}finally{await f.close();}
});
test('Retry clears the attempt without erasing previous best stars',async()=>{
 const f=await fixture();try{f.finish();f.get('again').click();assert.equal(f.controller.snapshot().state.yard.length,16);assert.equal(f.controller.snapshot().stars[0],3);assert.equal(f.get('result').hidden,true);}finally{await f.close();}
});
test('storage failure does not prevent play, sound starts off, and idle time never advances the puzzle',async()=>{
 const f=await fixture({noStorage:true,save:'{bad'});try{const before=f.controller.snapshot();f.tick(10000);assert.deepEqual(f.controller.snapshot(),before);assert.match(f.get('saved').textContent,/cannot be saved/);assert.equal(f.get('sound').getAttribute('aria-pressed'),'false');f.finish();assert.equal(f.controller.snapshot().state.status,'won');}finally{await f.close();}
});
test('wins wait only for the short exit animation and focus Next level',async()=>{
 const f=await fixture({reduce:false});try{f.finish();assert.equal(f.controller.snapshot().state.status,'won');assert.equal(f.get('result').hidden,true);f.tick(0);f.tick(180);assert.equal(f.get('result').hidden,false);assert.equal(f.win.document.activeElement.id,'of-next');assert.equal(f.get('grid').inert,true);assert.equal(f.pending.size,0);}finally{await f.close();}
});
test('the simpler puzzle removes retired mechanics while keeping honest attribution and motion access',()=>{
 const html=renderOrderFlowGame(),js=readFileSync(new URL('../public/play/games/order-flow.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(html,/of-belt|of-handoff|of-slots|of-memory|of-release|of-lock|of-loss|<select|checkbox|Run shift/);
 assert.doesNotMatch(js,/setInterval|setTimeout|fetch\(/);assert.match(html,/Bus Traffic Fever/);assert.match(html,/no AI\/GCP calls/);assert.match(orderFlowStyles,/prefers-reduced-motion/);
});
