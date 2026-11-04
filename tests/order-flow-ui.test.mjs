import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {build} from 'esbuild';
import {Window} from 'happy-dom';
import {LEVELS,solve,visibleOrders,SKILLS} from '../public/play/games/order-flow-model.mjs';
import {SAVE_KEY} from '../public/play/games/order-flow-progress.mjs';
import {initOrderFlowGame} from '../public/play/games/order-flow.mjs';
const {outputFiles}=await build({entryPoints:['src/play/games/order-flow.ts'],bundle:true,write:false,platform:'node',format:'esm'});
const {renderOrderFlowGame,orderFlowStyles}=await import('data:text/javascript;base64,'+Buffer.from(outputFiles[0].contents).toString('base64'));
async function fixture({reduce=true,index=0,save=null,noStorage=false}={}){
 const win=new Window({url:'https://arcade.example/play'});win.document.body.innerHTML='<section data-station-panel="madrid-delivery-sim">'+renderOrderFlowGame()+'</section>';
 if(save!==null)win.localStorage.setItem(SAVE_KEY,save);
 else if(index)win.localStorage.setItem(SAVE_KEY,JSON.stringify({version:1,level:index,stars:LEVELS.map((_,i)=>i<index?3:0),actions:[]}));
 if(noStorage)Object.defineProperty(win,'localStorage',{get(){throw Error('blocked');}});
 const media=new win.EventTarget();media.matches=reduce;win.matchMedia=()=>media;
 const pending=new Map();let serial=0;
 const previous={};for(const key of ['window','document','ResizeObserver','MutationObserver','requestAnimationFrame','cancelAnimationFrame'])previous[key]=globalThis[key];
 Object.assign(globalThis,{window:win,document:win.document,ResizeObserver:class{observe(){}disconnect(){}},MutationObserver:win.MutationObserver,requestAnimationFrame:fn=>{pending.set(++serial,fn);return serial;},cancelAnimationFrame:id=>pending.delete(id)});
 const controller=initOrderFlowGame(),get=id=>win.document.getElementById('of-'+id),tap=id=>win.document.querySelector('[data-bot="'+id+'"]').click();
 const finish=()=>{const s=controller.snapshot();for(const id of solve(LEVELS[s.level],s.state).path)tap(id);};
 return {win,media,pending,get,tap,riskTap:id=>{tap(id);if(!get('risk').hidden)get('risk-play').click();},finish,controller,tick:now=>{const batch=[...pending.values()];pending.clear();batch.forEach(fn=>fn(now));},save:()=>win.localStorage.getItem(SAVE_KEY),close:async()=>{controller.destroy();await win.happyDOM.close();Object.assign(globalThis,previous);}};
}
test('all ten levels complete through buttons, save stars and wrap only after the final win',async()=>{
 const f=await fixture();try{for(let i=0;i<10;i++){assert.equal(f.controller.snapshot().level,i);assert.equal(f.get('level').textContent,(i+1)+' / 10');f.finish();assert.equal(f.controller.snapshot().state.status,'won');assert.equal(f.get('result').hidden,false);assert.equal(f.get('stars').getAttribute('aria-label'),'3 of 3 stars');assert.equal(f.controller.snapshot().stars[i],3);assert.ok(f.get('real').href.includes('agent='+LEVELS[i].agent));assert.equal(f.get('real-note').textContent,LEVELS[i].note);f.get('next').click();}assert.equal(f.controller.snapshot().level,0);}finally{await f.close();}
});
test('a full bay shows its loss screen, cause and highlighted stuck slots; Undo costs a star',async()=>{
 const f=await fixture({index:2});try{f.riskTap(1);f.riskTap(2);assert.equal(f.get('loss').hidden,false);assert.equal(f.get('loss-title').textContent,'Out of slots');assert.match(f.get('loss-cause').textContent,/Support.*Courier/);assert.equal(f.get('slots').querySelectorAll('.is-stuck').length,2);f.get('loss-undo').click();assert.equal(f.get('loss').hidden,true);f.get('undo').click();f.finish();assert.equal(f.get('stars').getAttribute('aria-label'),'1 of 3 stars');assert.equal(f.controller.snapshot().state.moves,5);}finally{await f.close();}
});
test('handoff overflow shows five bags, a named cause and Retry',async()=>{
 const f=await fixture({index:3});try{f.riskTap(1);assert.equal(f.get('bags-count').textContent,'3 / 4 bags');f.riskTap(2);assert.equal(f.get('loss-title').textContent,'Courier belt overflow');assert.equal(f.get('handoff').classList.contains('is-overflow'),true);assert.match(f.get('loss-cause').textContent,/5 bags/);f.get('retry').click();assert.equal(f.get('bags-count').textContent,'0 / 4 bags');assert.equal(f.get('loss').hidden,true);}finally{await f.close();}
});
test('spent moves and three-Undo cap have visible consequences',async()=>{
 const f=await fixture();try{for(let n=0;n<3;n++){f.riskTap(1);f.get('undo').click();}assert.equal(f.get('undo').textContent,'Undo 0');assert.equal(f.get('undo').disabled,true);f.riskTap(1);f.riskTap(2);assert.equal(f.get('loss-title').textContent,'Out of moves');assert.equal(f.get('loss').hidden,false);assert.match(f.get('loss-cause').textContent,/5 moves.*4/);assert.equal(f.get('loss-undo').disabled,true);f.get('retry').click();assert.equal(f.get('undo').textContent,'Undo 3');assert.equal(f.controller.snapshot().state.moves,0);}finally{await f.close();}
});
test('Memory reveals only the permitted preview and releases on a second tap',async()=>{
 const f=await fixture({index:5});try{assert.equal(f.get('belt').querySelectorAll('g').length,4);assert.match(f.get('orders').textContent,/3 hidden/);f.tap(2);assert.equal(f.get('belt').querySelectorAll('g').length,7);assert.match(f.get('bots').querySelector('[data-bot="2"]').getAttribute('aria-label'),/release for one move/);f.tap(2);assert.equal(f.get('belt').querySelectorAll('g').length,4);assert.equal(f.get('bots').querySelector('[data-bot="2"]').hidden,true);}finally{await f.close();}
});
test('locked and blocked bots explain the reason without consuming moves',async()=>{
 const f=await fixture({index:6});try{f.tap(4);assert.match(f.get('message').textContent,/Inventory.*finish/);assert.equal(f.controller.snapshot().state.moves,0);f.tap(3);assert.match(f.get('message').textContent,/Bot 2 blocks/);f.tap(2);f.tap(3);assert.equal(f.get('bots').querySelector('[data-bot="4"] .of-lock').hidden,true);}finally{await f.close();}
});
test('rapid taps queue in order during 150ms hops instead of blocking or skipping a turn',async()=>{
 const f=await fixture({reduce:false,index:1});try{f.tap(2);f.tap(1);f.tap(3);assert.deepEqual(f.controller.snapshot().queued,[1,3]);assert.match(f.get('queued').textContent,/2 taps queued/);assert.equal(f.pending.size,1);f.tick(0);f.tick(150);assert.equal(f.controller.snapshot().shown.served,1);assert.equal(f.pending.size,1);for(let t=300;t<=3000;t+=150)f.tick(t);assert.equal(f.controller.snapshot().state.status,'won');assert.equal(f.get('result').hidden,false);assert.equal(f.get('hop').hidden,true);assert.ok([...f.get('bots').children].every(b=>b.hidden));assert.equal(f.pending.size,0);}finally{await f.close();}
});
test('hold fast-forward accelerates the same loop and releases cleanly',async()=>{
 const f=await fixture({reduce:false});try{f.tap(1);f.tick(0);f.get('fast').dispatchEvent(new f.win.KeyboardEvent('keydown',{key:' '}));f.tick(100);assert.equal(f.pending.size,0);assert.equal(f.controller.snapshot().shown.served,2);f.get('fast').dispatchEvent(new f.win.KeyboardEvent('keyup',{key:' '}));assert.equal(f.get('fast').getAttribute('aria-pressed'),'false');}finally{await f.close();}
});
test('a queued Memory enter and release are distinct taps, not a dropped duplicate',async()=>{
 const f=await fixture({reduce:false,index:8});try{for(const id of [1,2,2,3,4,6,5,7])f.tap(id);assert.deepEqual(f.controller.snapshot().queued.slice(0,2),[2,2]);for(let t=0;t<12000;t+=150)f.tick(t);assert.equal(f.controller.snapshot().state.status,'won');assert.equal(f.controller.snapshot().state.moves,8);}finally{await f.close();}
});
test('belt labels and accessible names always describe the current displayed game state',async()=>{
 const f=await fixture({reduce:false,index:7});try{f.tap(1);f.tick(0);for(const time of [150,300,450]){f.tick(time);const s=f.controller.snapshot().shown,front=s.queue[0];assert.ok(f.get('front').textContent.includes(SKILLS[front.skill].name));assert.ok(f.get('belt').getAttribute('aria-label').startsWith(f.get('front').textContent));assert.equal(f.get('belt').querySelectorAll('g').length,Math.min(12,visibleOrders(LEVELS[7],s).length));}f.media.matches=true;f.media.dispatchEvent(new f.win.Event('change'));assert.equal(f.pending.size,0);assert.equal(f.get('hop').hidden,true);}finally{await f.close();}
});
test('reload restores active board, loss, best stars and Undo history; real-system link cannot replace the game',async()=>{
 let saved;let f=await fixture({index:2});try{f.riskTap(1);saved=f.save();}finally{await f.close();}
 f=await fixture({save:saved});try{assert.equal(f.controller.snapshot().level,2);assert.equal(f.controller.snapshot().state.moves,1);assert.equal(f.get('undo').disabled,false);f.riskTap(2);saved=f.save();}finally{await f.close();}
 f=await fixture({save:saved});try{assert.equal(f.get('loss').hidden,false);f.get('retry').click();f.finish();assert.equal(f.get('real').target,'_blank');assert.match(f.get('real').rel,/noopener/);saved=f.save();}finally{await f.close();}
 f=await fixture({save:saved});try{assert.equal(f.get('result').hidden,false);assert.equal(f.controller.snapshot().stars[2],3);f.get('next').click();saved=f.save();}finally{await f.close();}
 f=await fixture({save:saved});try{assert.equal(f.controller.snapshot().level,3);assert.equal(f.controller.snapshot().stars[2],3);}finally{await f.close();}
});
test('level picker opens only earned levels, and stored stars survive replay',async()=>{
 const f=await fixture({index:2});try{f.get('level').click();assert.equal(f.get('levels').hidden,false);assert.equal(f.get('level-list').children[3].disabled,true);f.get('level-list').children[0].click();assert.equal(f.controller.snapshot().level,0);assert.equal(f.controller.snapshot().stars[0],3);assert.equal(f.get('levels').hidden,true);}finally{await f.close();}
});
test('corrupt or denied storage does not prevent play; idle time does nothing',async()=>{
 const f=await fixture({save:'{broken',noStorage:true});try{assert.equal(f.controller.snapshot().level,0);const before=f.controller.snapshot();f.tick(99999);assert.deepEqual(f.controller.snapshot(),before);assert.match(f.get('saved').textContent,/cannot be saved/);f.finish();assert.equal(f.controller.snapshot().state.status,'won');assert.equal(f.get('sound').getAttribute('aria-pressed'),'false');}finally{await f.close();}
});
test('native focus works and no departed bot leaves a tile marker or hidden keyboard target',async()=>{
 const f=await fixture();try{const b=f.get('bots').querySelector('[data-bot="1"]');b.focus();b.click();assert.equal(b.hidden,true);assert.equal(b.tabIndex,-1);assert.equal(f.get('hop').hidden,true);f.finish();assert.equal(f.win.document.activeElement.id,'of-next');assert.equal(f.get('work').inert,true);}finally{await f.close();}
});

test('a dead-end move is caught before it spends a move, changes progress, or consumes Undo',async()=>{
 const f=await fixture({index:2});try{
  const before=f.save();f.tap(1);
  assert.equal(f.get('risk').hidden,false);assert.equal(f.get('risk-title').textContent,'That move is a dead end');
  assert.equal(f.controller.snapshot().state.moves,0);assert.equal(f.save(),before);assert.equal(f.controller.snapshot().undos,0);
  assert.equal(f.win.document.activeElement.id,'of-risk-cancel');assert.equal(f.get('work').inert,true);
  f.get('risk-cancel').click();assert.equal(f.get('risk').hidden,true);assert.equal(f.get('work').inert,false);
  f.finish();assert.equal(f.controller.snapshot().state.status,'won');assert.equal(f.get('stars').getAttribute('aria-label'),'3 of 3 stars');
 }finally{await f.close();}
});
test('the screenshot Memory position is solvable and the hint names its visible Release control',async()=>{
 const f=await fixture({index:5});try{
  f.tap(2);f.tap(3);assert.equal(f.get('risk').hidden,true);assert.match(f.get('proof').textContent,/Solvable.*3 needed.*5 left/);
  const memory=f.get('bots').querySelector('[data-bot="2"]');assert.equal(memory.querySelector('.of-release').hidden,false);
  f.get('hint').click();assert.match(f.get('message').textContent,/Release Memory.*1 move/);assert.equal(memory.classList.contains('is-hint'),true);
  for(const id of [2,4,1])f.tap(id);assert.equal(f.controller.snapshot().state.status,'won');
 }finally{await f.close();}
});
test('queued dangerous taps pause before commitment and clear further queued intentions',async()=>{
 const f=await fixture({reduce:false,index:3});try{
  f.tap(1);f.tap(2);f.tap(3);for(let t=0;t<1500;t+=150)f.tick(t);
  assert.equal(f.get('risk').hidden,false);assert.equal(f.controller.snapshot().state.moves,1);assert.deepEqual(f.controller.snapshot().queued,[]);
  assert.match(f.get('risk-text').textContent,/fifth bag/);assert.equal(f.pending.size,0);
  f.get('risk-cancel').click();f.media.matches=true;f.tap(3);f.tap(2);f.tap(4);assert.equal(f.controller.snapshot().state.status,'won');
 }finally{await f.close();}
});
test('old saved dead ends remain intact and are identified without claiming a winning path',async()=>{
 const save=JSON.stringify({version:1,level:2,stars:[3,3,0,0,0,0,0,0,0,0],actions:[{tap:1}]});
 const f=await fixture({save});try{assert.match(f.get('proof').textContent,/No winning path/);assert.equal(f.controller.snapshot().state.moves,1);f.get('hint').click();assert.match(f.get('message').textContent,/Undo or Retry/);f.get('undo').click();assert.match(f.get('proof').textContent,/Solvable/);}finally{await f.close();}
});
test('game has no city code, timed gameplay, network dependency or unscoped styles',()=>{
 const html=renderOrderFlowGame(),js=readFileSync(new URL('../public/play/games/order-flow.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(html,/Madrid|street|district|courier route|<select|checkbox|Run shift/i);assert.doesNotMatch(js,/setInterval|setTimeout|fetch\(/);
 assert.match(html,/Bus Traffic Fever/);assert.match(html,/no AI\/GCP calls/);assert.match(orderFlowStyles,/prefers-reduced-motion/);
 for(const file of ['dispatch.ts','dispatch.mjs','dispatch-live-model.mjs'])assert.equal(existsSync(new URL('../'+(file.endsWith('.ts')?'src':'public')+'/play/games/'+file,import.meta.url)),false);
});
