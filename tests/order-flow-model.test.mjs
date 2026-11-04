import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS,initialState,copyState,blocker,inYard,legalMoves,move,solve,validateLevel,rating} from '../public/play/games/order-flow-model.mjs';

test('BFS proves all six levels solvable and finds each three-star minimum',()=>{
 assert.deepEqual(LEVELS.map(l=>l.title),['After you','Room for three','Two can do it','Park ahead','Stock comes first','All together']);
 assert.deepEqual(LEVELS.map(l=>l.par),[3,5,5,5,4,10]);
 for(const level of LEVELS){assert.ok(validateLevel(level));const answer=solve(level);assert.ok(answer,level.title);assert.equal(answer.moves,level.par,level.title);let state=initialState(level);for(const id of answer.path)state=move(level,state,id).state;assert.equal(state.status,'won');assert.equal(state.front,level.queue.length);assert.equal(state.yard,0);assert.ok(state.bay.every(b=>b===null));assert.equal(rating(level,answer.moves,0),3);}
});
test('only the front skill is served, with no passing or overshooting capacity',()=>{
 const l=LEVELS[0],s=initialState(l),waiting=move(l,s,3).state;assert.equal(waiting.front,0);assert.equal(waiting.bay[0].remaining,2);const picked=move(l,waiting,2).state;assert.equal(picked.front,2);assert.equal(picked.bay[0].remaining,2);const result=move(l,picked,1);assert.equal(result.state.status,'won');assert.deepEqual(result.events.filter(e=>e.kind==='serve').map(e=>e.id),[1,1,1,3,3]);assert.equal(s.yard,7);
});
test('arrow paths include every intervening yard cell and open only after blockers leave',()=>{
 const l=LEVELS[5],s=initialState(l);assert.equal(blocker(l,s,1),2);assert.equal(blocker(l,s,2),3);assert.equal(blocker(l,s,7),8);assert.equal(move(l,s,1).state,s);const opened=move(l,s,3).state;assert.equal(blocker(l,opened,2),null);assert.equal(blocker(l,opened,1),2);assert.ok(!inYard(opened,3));
});
test('three irrelevant parked bots lose immediately; the saved state remains undoable',()=>{
 const l=LEVELS[1];let s=initialState(l),before;for(const id of [2,3,4]){before=copyState(s);s=move(l,s,id).state;}assert.equal(s.status,'lost');assert.equal(s.front,0);assert.equal(s.bay.filter(Boolean).length,3);assert.ok(s.bay.every(b=>l.bots[b.id-1].skill!=='picker'));assert.equal(before.status,'playing');assert.ok(solve(l,before));assert.equal(move(l,s,1).state,s);
});
test('planning ahead parks a nonmatching bot and scaling needs two same-skill bots',()=>{
 const l=LEVELS[3],s=initialState(l);assert.equal(blocker(l,s,1),2);const parked=move(l,s,2).state;assert.equal(parked.front,0);assert.equal(parked.bay[0].id,2);assert.equal(blocker(l,parked,1),null);const scaled=LEVELS[2];let v=move(scaled,initialState(scaled),1).state;assert.equal(v.front,3);assert.equal(scaled.queue[v.front],'picker');v=move(scaled,v,4).state;assert.equal(v.front,6);
});
test('Inventory unlocks the Courier handoff and every reachable live yard has an exit',()=>{
 const l=LEVELS[4];let s=initialState(l);assert.equal(blocker(l,s,1),2);s=move(l,s,2).state;assert.equal(blocker(l,s,1),null);assert.equal(l.queue[s.front],'courier');
 for(const level of LEVELS){const states=[initialState(level)],seen=new Set();for(let n=0;n<states.length;n++){const state=states[n],key=JSON.stringify(state);if(seen.has(key))continue;seen.add(key);if(state.status!=='playing')continue;const moves=legalMoves(level,state);assert.ok(moves.length,level.title+' must not strand an unexplained yard');for(const id of moves)states.push(move(level,state,id,{trace:false}).state);assert.ok(seen.size<250000);}}
});
test('identical turns are deterministic and unlimited undo can restore full snapshots',()=>{
 for(const l of LEVELS){let s=initialState(l);const history=[];for(const id of solve(l).path){const old=JSON.stringify(s);history.push(copyState(s));const a=move(l,s,id),b=move(l,s,id);assert.deepEqual(a,b);assert.equal(JSON.stringify(s),old);s=a.state;}while(history.length)s=history.pop();assert.deepEqual(s,initialState(l));assert.equal(rating(l,l.par+1,1),2);assert.equal(rating(l,l.par+3,3),1);}
});
