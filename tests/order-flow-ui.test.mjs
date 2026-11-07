import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {build} from 'esbuild';
import {Window} from 'happy-dom';
import {LEVELS,SKILLS,solve,legalMoves,blocker,initialState,move,stateKey} from '../public/play/games/order-flow-model.mjs';
import {inspectPosition} from '../public/play/games/order-flow-proof.mjs';
import {SAVE_KEY} from '../public/play/games/order-flow-progress.mjs';
import {initOrderFlowGame} from '../public/play/games/order-flow.mjs';
const {outputFiles}=await build({entryPoints:['src/play/games/order-flow.ts'],bundle:true,write:false,platform:'node',format:'esm'});
const {renderOrderFlowGame,orderFlowStyles}=await import('data:text/javascript;base64,'+Buffer.from(outputFiles[0].contents).toString('base64'));
async function fixture({reduce=true,index=0,save=null,noStorage=false,compact=false}={}){
 const win=new Window({url:'https://arcade.example/play'});win.document.body.innerHTML='<section data-station-panel="madrid-delivery-sim">'+renderOrderFlowGame()+'</section>';
 if(save!==null)win.localStorage.setItem(SAVE_KEY,save);
 else if(index)win.localStorage.setItem(SAVE_KEY,JSON.stringify({version:3,level:index,stars:LEVELS.map((_,i)=>i<index?3:0),actions:[]}));
 if(noStorage)Object.defineProperty(win,'localStorage',{get(){throw Error('blocked');}});
 const media=new win.EventTarget();media.matches=reduce;const mobile=new win.EventTarget();mobile.matches=compact;win.matchMedia=q=>q.includes('reduced')?media:mobile;
 const pending=new Map();let serial=0;const previous={};
 for(const k of ['window','document','MutationObserver','requestAnimationFrame','cancelAnimationFrame'])previous[k]=globalThis[k];
 Object.assign(globalThis,{window:win,document:win.document,MutationObserver:win.MutationObserver,requestAnimationFrame:fn=>{pending.set(++serial,fn);return serial;},cancelAnimationFrame:id=>pending.delete(id)});
 const controller=initOrderFlowGame(),get=id=>win.document.getElementById('of-'+id),car=id=>get('grid').querySelector('[data-car="'+id+'"]'),tap=id=>car(id).click();
 const finish=()=>{const s=controller.snapshot();for(const id of solve(LEVELS[s.level],s.state).path)tap(id);};
 return {win,media,mobile,pending,get,car,tap,finish,controller,tick:now=>{const batch=[...pending.values()];pending.clear();batch.forEach(fn=>fn(now));},save:()=>win.localStorage.getItem(SAVE_KEY),close:async()=>{controller.destroy();await win.happyDOM.close();Object.assign(globalThis,previous);}};
}
function losingPath(level){
 const seen=new Set(),todo=[{state:initialState(level),path:[]}];
 for(let i=0;i<todo.length;i++){const {state,path}=todo[i],key=stateKey(state);if(seen.has(key))continue;seen.add(key);
  if(state.status==='lost')return path;for(const id of legalMoves(level,state))todo.push({state:move(level,state,id).state,path:[...path,id]});
 }
 throw Error('Missing losing fixture');
}
test('all ten packed boards complete with an empty queue and bay through the shipped controls',async()=>{
 const f=await fixture();try{for(let i=0;i<10;i++){
  assert.equal(f.controller.snapshot().level,i);assert.equal(f.get('grid').children.length,LEVELS[i].cars.length);assert.equal(f.get('bay').children.length,3);
  f.finish();assert.equal(f.get('result').hidden,false);assert.equal(f.get('stars').getAttribute('aria-label'),'3 of 3 stars');assert.equal(f.get('passengers').children.length,0);
  assert.equal(f.controller.snapshot().state.bay.filter(Boolean).length,0);assert.equal(f.controller.snapshot().stars[i],3);assert.equal(f.get('real-note').textContent,LEVELS[i].note);
  assert.ok(f.get('real').href.includes('agent='+LEVELS[i].agent));f.get('next').click();
 }assert.equal(f.controller.snapshot().level,0);}finally{await f.close();}
});
test('blocked arrows name the real blocker without changing passengers or parking',async()=>{
 const f=await fixture();try{const before=f.controller.snapshot(),bad=before.state.yard.find(id=>blocker(LEVELS[0],before.state,id)),by=blocker(LEVELS[0],before.state,bad);f.tap(bad);
  assert.deepEqual(f.controller.snapshot().state,before.state);assert.equal(f.controller.snapshot().mistakes,1);assert.ok(f.car(by).classList.contains('is-blocker'));assert.match(f.get('message').textContent,/Clear the highlighted car/);
 }finally{await f.close();}
});
test('touching grid blocks contain only the central arrow: no numbers, seats, wheel dashes or badges',async()=>{
 const f=await fixture();try{for(const c of f.get('grid').children){
  assert.equal(c.textContent,'');assert.equal(c.querySelectorAll('svg path').length,1);assert.equal(c.querySelectorAll('.of-direction').length,1);
  assert.equal(c.querySelectorAll('.of-wheel,.of-seat,.of-role-mark,.of-count,.of-release').length,0);
 }assert.equal(f.get('grid').querySelectorAll('.of-cell').length,0);}finally{await f.close();}
});
test('a waiting car occupies parking and passenger labels always describe the real front',async()=>{
 const f=await fixture();try{
  const l=LEVELS[0],open=legalMoves(l,f.controller.snapshot().state),hold=open.find(id=>l.cars[id-1].skill!==l.queue[0]),clear=open.find(id=>l.cars[id-1].skill===l.queue[0]);
  f.tap(hold);assert.match(f.get('bay').children[0].getAttribute('aria-label'),new RegExp(SKILLS[l.cars[hold-1].skill].name+', 0 of two seats filled'));assert.equal(f.get('passengers').children.length,32);
  f.tap(clear);assert.equal(f.get('passengers').children.length,28);assert.equal(f.get('front').textContent,'Front · '+SKILLS[l.queue[4]].name);
  assert.match(f.get('passengers').getAttribute('aria-label'),new RegExp('needs '+SKILLS[l.queue[4]].name));assert.equal(f.get('bay').querySelectorAll('.of-parked').length,0);
  assert.ok(f.car(clear).classList.contains('is-empty'));assert.ok(f.get('grid').querySelector('.is-ready'));
 }finally{await f.close();}
});
test('rapid legal taps commit immediately and share one nonblocking animation loop',async()=>{
 const f=await fixture({reduce:false});try{const path=solve(LEVELS[0]).path;for(const id of path.slice(0,5))f.tap(id);
  assert.equal(f.controller.snapshot().state.moves,5);assert.equal(f.pending.size,1);f.tick(0);f.tick(2000);assert.equal(f.pending.size,0);
  for(const id of path.slice(0,5))assert.ok(f.car(id).classList.contains('is-empty'));assert.equal(f.win.document.querySelectorAll('.of-boarding-ghost').length,0);
 }finally{await f.close();}
});
test('reduced motion and resizing settle visuals without changing committed queue state',async()=>{
 const f=await fixture({reduce:false});try{f.tap(LEVELS[0].witness[0]);const state=f.controller.snapshot().state;
  f.media.matches=true;f.media.dispatchEvent(new f.win.Event('change'));assert.equal(f.pending.size,0);assert.deepEqual(f.controller.snapshot().state,state);assert.equal(f.win.document.querySelectorAll('.of-boarding-ghost').length,0);
 }finally{await f.close();}
});
test('Undo restores passengers and parking, clears animations and is capped at three',async()=>{
 const f=await fixture({reduce:false});try{f.tap(LEVELS[0].witness[0]);const before=f.controller.snapshot().state;
  for(let i=0;i<3;i++){f.tap(LEVELS[0].witness[1]);f.get('undo').click();assert.deepEqual(f.controller.snapshot().state,before);assert.equal(f.pending.size,0);}
  assert.equal(f.get('undo').disabled,true);assert.equal(f.get('undo').textContent,'Undo 0');
 }finally{await f.close();}
});
test('unsafe release warning can cancel without spending a move or changing the queue',async()=>{
 const f=await fixture();try{for(const id of losingPath(LEVELS[0])){
  const before=f.controller.snapshot().state;f.tap(id);if(!f.get('warning').hidden){
   assert.deepEqual(f.controller.snapshot().state,before);assert.equal(f.win.document.activeElement.id,'of-cancel');f.get('cancel').click();
   assert.equal(f.get('warning').hidden,true);assert.deepEqual(f.controller.snapshot().state,before);assert.equal(f.win.document.activeElement,f.car(id));return;
  }
 }assert.fail('No warning');}finally{await f.close();}
});
test('accepting unsafe choices reaches a clear full-parking loss with Undo and Retry',async()=>{
 let saved;const f=await fixture();try{for(const id of losingPath(LEVELS[0])){f.tap(id);if(!f.get('warning').hidden)f.get('confirm').click();}
  assert.equal(f.controller.snapshot().state.status,'lost');assert.equal(f.get('loss').hidden,false);assert.equal(f.get('loss-title').textContent,'Out of slots');
  assert.equal(f.get('bay').querySelectorAll('.is-stuck').length,3);assert.match(f.get('loss-text').textContent,/front passenger needs/);assert.equal(f.win.document.activeElement.id,'of-loss-undo');
  saved=f.save();f.get('loss-undo').click();assert.equal(f.get('loss').hidden,true);assert.equal(f.controller.snapshot().undos,1);
 }finally{await f.close();}
 const restored=await fixture({save:saved});try{assert.equal(restored.get('loss').hidden,false);restored.get('loss-retry').click();assert.equal(restored.get('loss').hidden,true);assert.equal(restored.controller.snapshot().state.cursor,0);}finally{await restored.close();}
});
test('Hint selects a fully solvable queue/bay continuation and charges help in the score',async()=>{
 const f=await fixture();try{f.get('hint').click();const h=f.get('grid').querySelector('.is-hint'),id=Number(h.dataset.car);
  assert.equal(inspectPosition(LEVELS[0],move(LEVELS[0],f.controller.snapshot().state,id).state).kind,'solvable');assert.equal(f.win.document.activeElement,h);
  assert.match(f.get('score').textContent,/1 hint$/);f.finish();assert.equal(f.get('stars').getAttribute('aria-label'),'2 of 3 stars');
 }finally{await f.close();}
});
test('keyboard arrows navigate spatially; departed cars leave the focus order',async()=>{
 const f=await fixture();try{f.car(1).focus();f.car(1).dispatchEvent(new f.win.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));assert.equal(f.win.document.activeElement,f.car(2));
  const id=LEVELS[0].witness[0];f.tap(id);assert.equal(f.car(id).tabIndex,-1);assert.equal(f.car(id).getAttribute('aria-hidden'),'true');assert.equal(f.car(id).disabled,true);
 }finally{await f.close();}
});
test('progress restores a parked car, the passenger front and the final win without leaving the page',async()=>{
 let saved;let f=await fixture();try{
  const l=LEVELS[0],hold=legalMoves(l,initialState(l)).find(id=>l.cars[id-1].skill!==l.queue[0]);f.tap(hold);saved=f.save();
 }finally{await f.close();}
 f=await fixture({save:saved});try{const l=LEVELS[0],hold=legalMoves(l,initialState(l)).find(id=>l.cars[id-1].skill!==l.queue[0]);assert.equal(f.controller.snapshot().state.bay[0].id,hold);assert.equal(f.get('waiting').textContent,'32 waiting');f.finish();saved=f.save();}finally{await f.close();}
 f=await fixture({save:saved});try{assert.equal(f.get('result').hidden,false);assert.equal(f.controller.snapshot().stars[0],3);assert.equal(f.get('real').target,'_blank');assert.match(f.get('real').rel,/noopener/);}finally{await f.close();}
});
test('level selection only exposes earned levels and preserves best stars on Retry',async()=>{
 const f=await fixture({index:2});try{f.get('level').click();assert.equal(f.get('level-list').children[3].disabled,true);f.get('close-levels').click();assert.equal(f.win.document.activeElement,f.get('level'));
  f.get('level').click();f.get('level-list').children[0].click();f.finish();f.get('again').click();assert.equal(f.controller.snapshot().state.yard.length,16);assert.equal(f.controller.snapshot().stars[0],3);
 }finally{await f.close();}
});
test('storage failure does not prevent play; compact controls, quiet sound and no clock remain',async()=>{
 const f=await fixture({noStorage:true,compact:true,save:'{bad'});try{const before=f.controller.snapshot();f.tick(10000);assert.deepEqual(f.controller.snapshot(),before);assert.match(f.get('saved').textContent,/cannot be saved/);
  assert.equal(f.get('tools').open,false);assert.equal(f.get('sound').getAttribute('aria-pressed'),'false');f.mobile.matches=false;f.mobile.dispatchEvent(new f.win.Event('change'));assert.equal(f.get('tools').open,true);f.finish();
 }finally{await f.close();}
});
test('win waits only for short boarding visuals and puts focus on Next level',async()=>{
 const f=await fixture({reduce:false});try{f.finish();assert.equal(f.controller.snapshot().state.status,'won');assert.equal(f.get('result').hidden,true);
  f.tick(0);f.tick(2000);assert.equal(f.get('result').hidden,false);assert.equal(f.win.document.activeElement.id,'of-next');assert.equal(f.pending.size,0);
 }finally{await f.close();}
});
test('one passenger queue and parking remain without Memory, handoff bags or capacities on cars',()=>{
 const html=renderOrderFlowGame(),js=readFileSync(new URL('../public/play/games/order-flow.mjs',import.meta.url),'utf8');
 assert.match(html,/id="of-passengers"/);assert.match(html,/id="of-bay"/);assert.doesNotMatch(html,/of-handoff|of-memory|of-release|<select|Run shift/);
 assert.doesNotMatch(js,/setInterval|setTimeout|fetch\(/);assert.match(html,/Bus Traffic Fever/);assert.match(html,/no AI\/GCP calls/);assert.match(orderFlowStyles,/prefers-reduced-motion/);
});
