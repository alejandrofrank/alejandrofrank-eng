import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS,initialState,copyState,blocker,locked,legalMoves,move,solve,greedy,visibleOrders,validateLevel,rating} from '../public/play/games/order-flow-model.mjs';
import {newAttempt,takeTurn,undoTurn,restoreProgress,serializeProgress} from '../public/play/games/order-flow-progress.mjs';

test('BFS wins all ten authored levels with the exact three-star minimum',()=>{
 assert.equal(LEVELS.length,10);
 for(const l of LEVELS){validateLevel(l);const answer=solve(l);assert.ok(answer,l.title);assert.equal(answer.moves,l.par,l.title);let s=initialState(l);for(const id of answer.path)s=move(l,s,id).state;assert.equal(s.status,'won');assert.equal(s.yard,0);assert.equal(s.queue.length,0);assert.equal(s.bags.length,0);assert.ok(s.bay.every(b=>!b));assert.equal(rating(l,s.moves,0),3);}
});
test('front-first greedy baseline loses every level from three to ten',()=>{
 for(const l of LEVELS.slice(2)){const result=greedy(l);assert.equal(result.state.status,'lost',l.title+' '+result.path);assert.ok(['slots','overflow','moves'].includes(result.state.cause));}
});
test('only the front raw order is served; arrow paths include all blockers',()=>{
 const l=LEVELS[1],s=initialState(l);assert.equal(blocker(l,s,1),2);assert.equal(move(l,s,1).state,s);const waiting=move(l,s,3).state;assert.equal(waiting.queue.length,7);const open=move(l,waiting,2).state;assert.equal(blocker(l,open,1),null);const result=move(l,open,1);assert.equal(result.state.status,'won');assert.deepEqual(result.events.filter(e=>e.kind==='serve').map(e=>e.id),[1,1,1,3,3]);assert.equal(s.yard,7);
});
test('each completed pick publishes one bag; ready Couriers drain before the next pick',()=>{
 const l=LEVELS[3];let s=move(l,initialState(l),1).state;assert.equal(s.bags.length,3);assert.equal(s.status,'playing');const lost=move(l,s,2).state;assert.equal(lost.status,'lost');assert.equal(lost.cause,'overflow');assert.equal(lost.bags.length,5);
 s=move(l,initialState(l),3).state;const t=move(l,s,1);assert.equal(t.state.bags.length,0);assert.deepEqual(t.events.filter(e=>e.kind==='serve').map(e=>e.source),['queue','bags','queue','bags','queue','bags']);
});
test('Memory reveals four more without serving and release costs one move',()=>{
 const l=LEVELS[5],s=initialState(l);assert.equal(visibleOrders(l,s).length,4);const parked=move(l,s,2).state;assert.equal(visibleOrders(l,parked).length,7);assert.equal(parked.served,0);assert.equal(parked.bay.filter(Boolean).length,1);const released=move(l,parked,2).state;assert.equal(visibleOrders(l,released).length,4);assert.equal(released.moves,2);assert.equal(released.bay.filter(Boolean).length,0);
});
test('locks open on departure, not on parking',()=>{
 const l=LEVELS[6];let s=initialState(l);assert.equal(locked(l,s,4),true);assert.match(move(l,s,4).error,/Inventory.*finish/);s=move(l,s,2).state;assert.equal(locked(l,s,4),true);s=move(l,s,3).state;assert.equal(locked(l,s,4),false);assert.ok(legalMoves(l,s).includes(4));
});
test('a striped order returns exactly once and a retried pick does not duplicate a bag',()=>{
 const l=LEVELS[7],t=move(l,initialState(l),1);assert.equal(t.state.queue.at(-1).id,1);assert.equal(t.state.queue.at(-1).retry,false);assert.equal(t.events.filter(e=>e.retry).length,1);
 const final=LEVELS[9];let s=initialState(final),retry=0,produced=0;for(const id of solve(final).path){const t=move(final,s,id);retry+=t.events.filter(e=>e.retry).length;produced+=t.events.filter(e=>e.produced).length;s=t.state;}assert.equal(retry,1);assert.equal(produced,8);
});
test('every reachable playing state has a legal next decision; BFS does not hide deadlocks',()=>{
 for(const l of LEVELS){const states=[initialState(l)],seen=new Set();for(let n=0;n<states.length;n++){const s=states[n],key=JSON.stringify(s);if(seen.has(key))continue;seen.add(key);if(s.status!=='playing')continue;const choices=legalMoves(l,s);assert.ok(choices.length,l.title);for(const id of choices)states.push(move(l,s,id,{trace:false}).state);assert.ok(seen.size<100000);}}
});
test('Undo is capped at three, retains spent moves, lowers stars and cannot refund an exhausted budget',()=>{
 const l={...LEVELS[0],budget:10};let a=newAttempt(l);for(let n=0;n<3;n++){a=takeTurn(l,a,1).attempt;a=undoTurn(l,a);assert.equal(a.undos,n+1);}assert.equal(a.state.moves,3);a=takeTurn(l,a,1).attempt;assert.equal(undoTurn(l,a),null);assert.equal(rating(l,l.par,1),1);assert.equal(rating(l,l.par+1,0),2);
 const tight=LEVELS[0];let b=newAttempt(tight);for(let n=0;n<3;n++){b=takeTurn(tight,b,1).attempt;b=undoTurn(tight,b);}b=takeTurn(tight,b,1).attempt;b=takeTurn(tight,b,2).attempt;assert.equal(b.state.cause,'moves');assert.equal(undoTurn(tight,b),null);
});
test('progress restores active turns, losses, wins, Undo history and best stars',()=>{
 for(const index of [0,2,5,9]){const l=LEVELS[index],stars=LEVELS.map((_,i)=>i<index?3:0);let a=newAttempt(l);for(const id of solve(l).path)a=takeTurn(l,a,id).attempt;const restored=restoreProgress(serializeProgress(index,stars,a));assert.equal(restored.level,index);assert.deepEqual(restored.attempt,a);assert.equal(restored.stars[index],3);}
 let a=newAttempt(LEVELS[2]);for(const id of [1,2])a=takeTurn(LEVELS[2],a,id).attempt;assert.equal(a.state.status,'lost');const restore=restoreProgress(serializeProgress(2,[3,3,0,0,0,0,0,0,0,0],a));assert.deepEqual(restore.attempt,a);assert.equal(undoTurn(LEVELS[2],restore.attempt).state.status,'playing');
});
test('bad or obsolete saves fall back safely; reducers never mutate caller state',()=>{
 for(const raw of [null,'{','{}','{"version":1,"level":99}','{"version":1,"level":2,"stars":[3]}'])assert.equal(restoreProgress(raw).level,0);
 for(const l of LEVELS){const state=initialState(l),old=copyState(state);const id=legalMoves(l,state)[0];assert.deepEqual(move(l,state,id),move(l,state,id));assert.deepEqual(state,old);}
});

