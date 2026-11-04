import test from 'node:test';
import assert from 'node:assert/strict';
import {createShift,makeOrders,pinLayout,workerPosition,DURATION} from '../public/play/games/dispatch-live-model.mjs';

export function play(shift,{claim=true,notes=true,human=true,capacity=true,route=true}={}){
 while(!shift.state.finished){
  const s=shift.state;
  if(capacity&&s.round>=1){for(const w of s.workers)shift.moveBot(w.id,w.id===1?'normal':w.id===6?'problem':'urgent');}
  if(claim&&s.round>=2)shift.claiming();
  if(notes)for(const n of s.notes)shift.pin(n.id);
  if(human)for(const o of s.orders)if(o.needsHuman)shift.escalate(o.id);
  if(route)for(const o of s.orders.filter(o=>o.status==='new')){
   const load=q=>(s.queues[q].length+s.workers.filter(w=>w.lane===q&&w.job).length)/Math.max(1,s.workers.filter(w=>w.lane===q&&!w.offline).length);
   shift.route(o.id,o.kind==='problem'?'problem':o.kind==='cold'?'urgent':load('normal')*8+8<load('urgent')*3.9+3.9?'normal':'urgent');
  }
  shift.advance(.1);
 }
 return shift.state;
}
test('five 50-second shifts require live routing and support a successful active campaign',()=>{
 let carry={};for(let round=0;round<5;round++){const shift=createShift(round,carry);const s=play(shift);assert.equal(s.time,50);assert.equal(s.result.won,true,JSON.stringify({round,score:s.score,fail:s.failures}));assert.ok(s.actions>=s.orders.length);carry=shift.carry();}
 const passive=play(createShift(),{route:false});assert.equal(passive.score.onTime,0);assert.equal(passive.score.late,15);assert.equal(passive.result.stars,1);
});
test('round one rewards spare capacity, not matching grocery labels to Normal',()=>{
 const shift=createShift();while(!shift.state.finished){for(const o of shift.state.orders.filter(o=>o.status==='new'))shift.route(o.id,o.kind==='grocery'?'normal':o.kind==='cold'?'urgent':'problem');shift.advance(.1);}assert.ok(shift.state.score.late>0);assert.equal(play(createShift()).score.late,0);
});
test('cold bags miss deadlines in Normal; moving fixed-budget bots repairs the lunch rush',()=>{
 const bad=play(createShift(1),{capacity:false}),good=play(createShift(1));assert.ok(bad.score.late>good.score.late);assert.equal(good.workers.length,6);
 const s=createShift(1);s.advance(.1);assert.equal(s.moveBot(99,'urgent'),false);assert.equal(s.moveBot(1,'elsewhere'),false);s.route(1,'normal');s.advance(.1);assert.equal(s.moveBot(1,'urgent'),true);assert.equal(s.state.workers[0].job.lane,'normal');
});
test('duplicate pickers cause immediate wasted trips; Claim cancels queued and travelling retries',()=>{
 const bad=play(createShift(2),{claim:false});assert.ok(bad.score.wasted>0);assert.ok(bad.failures.some(f=>f.cause==='duplicate'));const good=play(createShift(2));assert.equal(good.score.wasted,0);assert.ok(good.events.some(e=>e.kind==='safe'));
});
test('pinning stock and offline notes changes current work, not just future scoring',()=>{
 const bad=play(createShift(4),{notes:false}),good=play(createShift(4));assert.ok(bad.failures.some(e=>e.cause==='stock'));assert.ok(bad.failures.some(e=>e.cause==='offline'));assert.ok(good.notes.every(n=>n.pinned));assert.equal(good.workers.find(w=>w.offline).job,null);assert.ok(good.events.some(e=>e.kind==='handoff'));
});
test('the changed address needs exactly one human; rain lengthens travel',()=>{
 const good=play(createShift(4)),bad=play(createShift(4),{human:false});assert.equal(good.score.escalations,1);assert.ok(good.rain);assert.ok(bad.failures.some(f=>f.cause==='address'));
});
test('late counters update at the deadline, only once, and retries use the same seed',()=>{
 const shift=createShift();for(let i=0;i<200;i++)shift.advance(.1);const o=shift.state.orders[0];assert.ok(o.late);assert.equal(o.failures.filter(x=>x==='late').length,1);assert.deepEqual(makeOrders(0,17),makeOrders(0,17));assert.notDeepEqual(makeOrders(0,17),makeOrders(0,18));assert.deepEqual(play(createShift(4)),play(createShift(4)));assert.throws(()=>shift.advance(1));
});
test('unlocked claim rule and team allocation survive later rounds, facts remain per shift',()=>{
 const s=createShift(2);s.claiming();s.moveBot(1,'urgent');const next=createShift(3,s.carry());assert.ok(next.state.claims);assert.equal(next.state.workers[0].lane,'urgent');assert.equal(next.state.notes.length,0);assert.equal(createShift(0).claiming(),false);assert.equal(createShift(0).moveBot(1,'urgent'),false);
});
test('overflow pins form distinct count clusters on phone and desktop; worker positions are finite',()=>{
 const s=createShift(4);for(const o of s.state.orders)o.status='new';for(const mobile of [false,true]){const groups=pinLayout(s.state.orders,mobile);assert.equal(new Set(groups.map(g=>g.x+','+g.y)).size,groups.length);assert.equal(groups.reduce((n,g)=>n+g.items.length,0),19);assert.ok(groups.some(g=>g.items.length>1));}
 s.route(1,'normal');s.advance(.1);for(const w of s.state.workers){const p=workerPosition(w);assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));}assert.equal(DURATION,50);
});
