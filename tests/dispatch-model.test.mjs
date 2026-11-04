import test from 'node:test';
import assert from 'node:assert/strict';
import {QUEUES,ROUNDS,rulesFor,createShift,simulate,makeOrders,workerPosition,validRules} from '../public/play/games/dispatch-model.mjs';
export function workingRules(round){return {...rulesFor(round),routing:{normal:'normal',urgent:'urgent',problem:'problem'},staff:round===1?{normal:1,urgent:4,problem:1}:{normal:2,urgent:3,problem:1},claims:true,milk:true,offline:true,escalate:round===4?'address':'never'};}
test('five shifts fail for the intended coordination mistakes and all have playable repairs',()=>{
 const expected=['routing','capacity','claims','milk','offline'];
 for(let n=0;n<ROUNDS.length;n++){
  const bad=simulate(n,rulesFor(n));assert.equal(bad.result.won,false);assert.ok(bad.failures.some(e=>e.rule===expected[n]));
  const good=simulate(n,workingRules(n));assert.equal(good.result.won,true);assert.equal(good.result.onTime,ROUNDS[n].count);assert.equal(good.result.stars,3);
 }
});
test('capacity changes actual queue waits; several allocations can solve the same shift',()=>{
 let wins=0;
 for(let normal=0;normal<=6;normal++)for(let urgent=0;urgent<=6-normal;urgent++){
  const rules={...workingRules(1),staff:{normal,urgent,problem:6-normal-urgent}},r=simulate(1,rules);
  assert.ok(r.score.delivered<=8);assert.ok(r.time<=28);
  if(r.result.won){wins++;assert.ok(urgent>=3);assert.ok(normal>0);}
 }
 assert.ok(wins>1,'players can discover more than one viable allocation');
 const early=createShift(1,rulesFor(1));for(let i=0;i<12;i++)early.advance();assert.ok(early.state.queues.urgent.length>=4);
});
test('claims suppress duplicate work, not real order arrivals; a dropped claim can be safely reassigned',()=>{
 const bad=simulate(2,rulesFor(2)),good=simulate(2,workingRules(2));
 assert.ok(bad.orders[0].deliveries>1);assert.equal(bad.score.wasted,1);assert.equal(good.orders[0].deliveries,1);assert.equal(good.events.filter(e=>e.kind==='arrival').length,7);
 assert.ok(good.events.some(e=>e.kind==='safe'&&e.text.includes('Retry ignored')));
 const chaos=simulate(4,workingRules(4));assert.ok(chaos.workers.some(w=>w.offline));assert.equal(chaos.orders.every(o=>o.deliveries===1),true);
 assert.ok(chaos.notes.some(n=>n.kind==='offline'));assert.ok(chaos.events.some(e=>e.text.includes('abandoned claim')));
});
test('stock notes update waiting and already travelling pickers; stale information causes repeated waste',()=>{
 const bad=simulate(3,rulesFor(3)),good=simulate(3,workingRules(3));
 assert.ok(bad.failures.filter(e=>e.rule==='milk').length>=2);assert.ok(good.notes.some(n=>n.kind==='milk'));
 assert.equal(good.score.wasted,0);assert.ok(good.events.some(e=>e.text.includes('redirects a picker')));
});
test('rain affects travel time, address changes need confirmation, and escalations are counted',()=>{
 const good=workingRules(4),noHuman=simulate(4,{...good,escalate:'never'}),all=simulate(4,{...good,escalate:'all'}),r=simulate(4,good);
 assert.ok(r.rain);assert.ok(noHuman.failures.some(e=>e.rule==='escalate'));assert.equal(r.score.escalations,1);assert.ok(all.score.escalations>r.score.escalations);
 assert.ok(r.orders.some(o=>o.addressVersion===1));assert.ok(r.notes.some(n=>n.kind==='address'));
});
test('retries are deterministic and seeds change the orders without using random browser time',()=>{
 assert.deepEqual(simulate(4,workingRules(4),17),simulate(4,workingRules(4),17));assert.notDeepEqual(makeOrders(1,17),makeOrders(1,18));
 assert.equal(validRules({...workingRules(0),staff:{normal:6,urgent:1,problem:0}}),false);
 assert.throws(()=>createShift(0,{...workingRules(0),routing:{normal:'root'}}));assert.throws(()=>createShift(6,workingRules(0)));
 const s=createShift(0,workingRules(0));assert.throws(()=>s.advance(1));
 const supplied=workingRules(0),isolated=createShift(0,supplied);supplied.staff.normal=0;assert.equal(isolated.plan.staff.normal,2);
});
test('couriers interpolate between steps instead of teleporting each second',()=>{
 const shift=createShift(0,workingRules(0));shift.advance();const w=shift.state.workers.find(w=>w.job),a=workerPosition(w,0),b=workerPosition(w,.1);
 assert.notDeepEqual(a,b);assert.ok(Math.hypot(b.x-a.x,b.y-a.y)<50);
 assert.ok(QUEUES.every(q=>shift.state.workers.filter(w=>w.queue===q).length===shift.plan.staff[q]));
});
