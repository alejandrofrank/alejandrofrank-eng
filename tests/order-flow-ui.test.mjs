import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {build} from 'esbuild';
import {Window} from 'happy-dom';
import {LEVELS,solve} from '../public/play/games/order-flow-model.mjs';
import {initOrderFlowGame} from '../public/play/games/order-flow.mjs';
const {outputFiles}=await build({entryPoints:['src/play/games/order-flow.ts'],bundle:true,write:false,platform:'node',format:'esm'});
const {renderOrderFlowGame,orderFlowStyles}=await import('data:text/javascript;base64,'+Buffer.from(outputFiles[0].contents).toString('base64'));
async function fixture(reduce=true){
 const win=new Window();win.document.body.innerHTML='<section data-station-panel="madrid-delivery-sim">'+renderOrderFlowGame()+'</section>';
 const media=new win.EventTarget();media.matches=reduce;win.matchMedia=()=>media;
 const pending=new Map();let serial=0;
 const previous={};for(const key of ['window','document','ResizeObserver','MutationObserver','requestAnimationFrame','cancelAnimationFrame'])previous[key]=globalThis[key];
 Object.assign(globalThis,{window:win,document:win.document,ResizeObserver:class{observe(){}},MutationObserver:win.MutationObserver,requestAnimationFrame:fn=>{pending.set(++serial,fn);return serial;},cancelAnimationFrame:id=>pending.delete(id)});
 const controller=initOrderFlowGame(),get=id=>win.document.getElementById('of-'+id),tap=id=>win.document.querySelector('[data-bot="'+id+'"]').click();
 const finish=()=>{for(const id of solve(LEVELS[controller.snapshot().level],controller.snapshot().state).path)tap(id);};
 const go=index=>{while(controller.snapshot().level<index){finish();get('next').click();}};
 return {win,media,pending,get,tap,finish,go,controller,tick:now=>{const batch=[...pending.values()];pending.clear();batch.forEach(fn=>fn(now));},close:async()=>{controller.destroy();await win.happyDOM.close();Object.assign(globalThis,previous);}};
}
test('all eight levels complete through real buttons with real-system links and minimum stars',async()=>{
 const f=await fixture();try{for(let i=0;i<8;i++){assert.equal(f.controller.snapshot().level,i);f.finish();assert.equal(f.controller.snapshot().state.status,'won');assert.equal(f.get('result').hidden,false);assert.equal(f.get('stars').getAttribute('aria-label'),'3 of 3 stars');assert.ok(f.get('real').href.endsWith('agent='+LEVELS[i].agent));assert.equal(f.get('real-note').textContent,LEVELS[i].note);f.get('next').click();}assert.equal(f.controller.snapshot().level,0);}finally{await f.close();}
});
test('full bay highlights every stuck slot and Undo restores a playable board, without losing history',async()=>{
 const f=await fixture();try{f.go(3);[2,3,4].forEach(f.tap);assert.equal(f.controller.snapshot().state.status,'lost');assert.match(f.get('message').textContent,/Out of slots.*Picker.*Undo/);assert.equal(f.get('slots').querySelectorAll('.is-stuck').length,3);assert.equal(f.get('result').hidden,true);f.get('undo').click();assert.equal(f.controller.snapshot().state.status,'playing');assert.equal(f.get('slots').querySelectorAll('.is-stuck').length,0);f.get('undo').click();f.get('undo').click();assert.equal(f.controller.snapshot().state.yard,31);f.finish();assert.equal(f.get('stars').getAttribute('aria-label'),'1 of 3 stars');}finally{await f.close();}
});
test('blocked bots explain the blocker without consuming a move; capacity and arrows are readable',async()=>{
 const f=await fixture();try{f.go(2);f.tap(1);assert.equal(f.controller.snapshot().moves,0);assert.match(f.get('message').textContent,/Bot 2 blocks/);assert.equal(f.get('bots').querySelector('.is-blocker').dataset.bot,'2');assert.match(f.get('bots').querySelector('[data-bot="1"]').getAttribute('aria-label'),/Picker.*3 orders.*exit up.*blocked by bot 2/);f.tap(2);f.tap(1);assert.equal(f.controller.snapshot().moves,2);}finally{await f.close();}
});
test('animation never blocks an immediate second tap or Undo, and there is only one scheduled frame',async()=>{
 const f=await fixture(false);try{f.tap(1);assert.equal(f.controller.snapshot().state.front,2);assert.equal(f.pending.size,1);f.tick(0);assert.equal(f.pending.size,1);f.tap(2);assert.equal(f.controller.snapshot().state.status,'won');assert.ok(f.pending.size<=1);f.get('undo').click();assert.equal(f.controller.snapshot().state.status,'playing');assert.equal(f.controller.snapshot().state.front,2);assert.equal(f.pending.size,0);f.get('undo').click();assert.equal(f.controller.snapshot().state.front,0);}finally{await f.close();}
});
test('no timer or passive progress: idle frames do not move state, reduced motion skips animation',async()=>{
 const f=await fixture();try{const before=f.controller.snapshot();f.tick(999999);assert.deepEqual(f.controller.snapshot(),before);f.tap(1);assert.equal(f.pending.size,0);assert.equal(f.get('sound').getAttribute('aria-pressed'),'false');f.get('replay').click();assert.equal(f.controller.snapshot().moves,0);assert.equal(f.controller.snapshot().state.front,0);}finally{await f.close();}
});
test('the visual trace serves orders one at a time; reducing motion flushes to the current turn',async()=>{
 const f=await fixture(false);try{f.tap(1);assert.equal(f.get('orders').textContent,'5 left');f.tick(performance.now()+105);assert.equal(f.get('orders').textContent,'4 left');f.media.matches=true;f.media.dispatchEvent(new f.win.Event('change'));assert.equal(f.pending.size,0);assert.equal(f.get('orders').textContent,'3 left');f.media.matches=false;f.get('replay').click();f.tap(1);f.tick(performance.now()+5000);assert.equal(f.pending.size,0);assert.equal(f.get('orders').textContent,'3 left');}finally{await f.close();}
});
test('native buttons expose keyboard focus, and cleared board does not keep hidden bots in tab order',async()=>{
 const f=await fixture();try{const first=f.get('bots').querySelector('button');first.focus();first.click();assert.equal(f.win.document.activeElement.dataset.bot,'2');assert.equal(first.tabIndex,-1);f.finish();assert.equal(f.win.document.activeElement.id,'of-next');assert.equal(f.get('work').inert,true);f.get('again').click();assert.equal(f.get('work').inert,false);}finally{await f.close();}
});
test('replacement contains no map, timed controls or old dispatch assets; styling is scoped',()=>{
 const html=renderOrderFlowGame(),js=readFileSync(new URL('../public/play/games/order-flow.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(html,/Madrid|street|district|courier route|<select|checkbox|Run shift|timer/i);
 assert.doesNotMatch(js,/setInterval|setTimeout|fetch\(/);
 assert.match(html,/Bus Traffic Fever/);assert.match(html,/no AI or GCP calls/);assert.match(orderFlowStyles,/prefers-reduced-motion/);
 for(const file of ['dispatch.ts','dispatch.mjs','dispatch-live-model.mjs'])assert.equal(existsSync(new URL('../'+(file.endsWith('.ts')?'src':'public')+'/play/games/'+file,import.meta.url)),false);
});
