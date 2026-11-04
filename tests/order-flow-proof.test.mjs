import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LEVELS,initialState,move,legalMoves,solve} from '../public/play/games/order-flow-model.mjs';
import {positionKey} from '../public/play/games/order-flow-position.mjs';
import {inspectPosition,nextMoveHint} from '../public/play/games/order-flow-proof.mjs';
import {buildProofs,serializeProofs} from '../scripts/build-order-flow-proof.mjs';

test('shipped certificates exactly match a complete graph regeneration',()=>{
 const proofs=buildProofs();
 assert.equal(readFileSync(new URL('../public/play/games/order-flow-proof-data.mjs',import.meta.url),'utf8'),serializeProofs(proofs));
 assert.equal(proofs.reduce((n,p)=>n+p.states,0),903);
 assert.equal(proofs.reduce((n,p)=>n+p.transitions,0),1636);
});
test('every reachable position agrees with independent forward BFS, including all dead ends',()=>{
 let checked=0,traps=0;
 for(const l of LEVELS){
  const states=[initialState(l)],seen=new Set();
  for(let i=0;i<states.length;i++){
   const s=states[i],key=positionKey(s);if(seen.has(key))continue;seen.add(key);
   const proof=inspectPosition(l,s),answer=solve(l,s);checked++;
   assert.notEqual(proof.kind,'unknown');
   assert.equal(proof.minimum,answer?.moves??null,l.title+' '+key);
   if(proof.kind==='deadend')traps++;
   if(answer&&s.status!=='won')for(const id of proof.next){const next=move(l,s,id,{trace:false}).state;assert.equal(solve(l,next)?.moves,answer.moves-1);}
   for(const id of legalMoves(l,s))states.push(move(l,s,id,{trace:false}).state);
  }
 }
 assert.equal(checked,903);assert.ok(traps>0);
});
test('the reported full Memory bay has a certified three-move recovery',()=>{
 const l=LEVELS[5];let s=initialState(l);for(const id of [2,3])s=move(l,s,id).state;
 const proof=inspectPosition(l,s);assert.equal(proof.kind,'solvable');assert.equal(proof.minimum,3);assert.equal(proof.left,5);assert.deepEqual(proof.next,[2]);
 assert.match(nextMoveHint(l,s).text,/Release Memory.*1 move/);
 for(const id of [2,4,1])s=move(l,s,id).state;assert.equal(s.status,'won');
});
test('proof includes the spent budget after Undo and fails closed on drift or unknown state',()=>{
 const l=LEVELS[0],s={...initialState(l),moves:3};assert.equal(inspectPosition(l,s).kind,'budget');assert.equal(inspectPosition(l,s).minimum,2);
 assert.equal(inspectPosition({...l,slots:99},s).kind,'unknown');
 assert.equal(inspectPosition(l,{...s,yard:12345}).kind,'unknown');
});
