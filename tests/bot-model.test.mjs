import test from 'node:test';
import assert from 'node:assert/strict';
import {PARTS,ROUNDS,createWorkshop,loadoutFor,simulate,recall} from '../public/play/games/bot-model.mjs';
const good={stock:'reserve',tool:'reassign',radio:'addressed',memory:'scoped',engine:'hybrid'};
test('every round starts with a repairable failure and a valid loadout succeeds across seeded shifts',()=>{
 for(let round=0;round<5;round++)for(let seed=0;seed<20;seed++){
  assert.equal(simulate(round,loadoutFor(round),seed).won,false);
  const result=simulate(round,good,seed);assert.equal(result.won,true);assert.equal(result.delivered,ROUNDS[round].target);assert.equal(result.lost,0);assert.ok(result.credits<=ROUNDS[round].budget);
 }
});
test('all final-round loadouts enforce budget, stock, scope and capability boundaries',()=>{
 let winners=0;
 for(const stock of PARTS.stock.choices)for(const tool of PARTS.tool.choices)for(const radio of PARTS.radio.choices)for(const memory of PARTS.memory.choices)for(const engine of PARTS.engine.choices){
  const config={stock:stock.id,tool:tool.id,radio:radio.id,memory:memory.id,engine:engine.id},r=simulate(4,config);
  assert.ok(r.stock>=0);assert.ok(r.credits<=10);assert.ok(r.delivered<=4);assert.equal(r.orders.length,5);
  assert.ok(r.events.every(e=>e.stock>=0&&e.credits<=10));
  if(radio.id!=='addressed')assert.equal(r.delivered,0);
  if(r.won){winners++;assert.deepEqual(config,good);assert.equal(r.blocks,0);assert.equal(r.declined,1);}
 }assert.equal(winners,1);
});
test('reasoning is useful only where needed; raw rules and unrestricted reasoning fail for different reasons',()=>{
 const rules=simulate(3,{...good,engine:'rules'}),expensive=simulate(3,{...good,engine:'reasoning'}),mixed=simulate(3,good);
 assert.ok(rules.events.some(e=>e.reason==='engine'));assert.ok(expensive.events.some(e=>e.reason==='budget'));
 assert.equal(mixed.credits,9);assert.equal(mixed.events.filter(e=>e.reasoning).length,1);assert.equal(mixed.won,true);
});
test('recall cannot cross a run, role, order or expiry boundary',()=>{
 const scope={run:'a',order:'one',role:'support'},valid={...scope,expires:30,value:'reception'};
 const records=[valid,{...valid,run:'b'},{...valid,order:'two'},{...valid,role:'dispatcher'},{...valid,expires:20}];
 assert.deepEqual(recall(records,scope,20),[valid]);assert.equal(recall(records,scope,30).length,0);
});
test('retries are identical, different seeds change assignments, and invalid loadouts fail closed',()=>{
 assert.deepEqual(simulate(4,good,23),simulate(4,good,23));assert.notDeepEqual(simulate(4,good,23).orders,simulate(4,good,24).orders);
 assert.throws(()=>simulate(7,good));assert.throws(()=>simulate(0,{...good,tool:'admin'}));
});
test('campaign cannot skip unfinished rounds or mutate state through snapshots and replay is bounded',()=>{
 const game=createWorkshop();assert.equal(game.next(),false);assert.equal(game.equip('stock','optimistic'),false);assert.equal(game.equip('tool','admin'),false);
 const view=game.state;view.loadout.tool='reassign';assert.equal(game.state.loadout.tool,'notify');
 for(let round=0;round<5;round++){
  for(const key of ROUNDS[round].unlocked)assert.equal(game.equip(key,good[key]),true);
  const result=game.run();assert.equal(game.next(),false);for(let i=0;i<result.events.length+2;i++)game.step();
  assert.equal(game.state.completed.length,round+1);assert.equal(game.next(),round<4);
 }
 game.reset();assert.equal(game.state.round,0);assert.equal(game.state.attempts,0);assert.deepEqual(game.state.completed,[]);
});
