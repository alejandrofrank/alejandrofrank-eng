import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LEVELS,initialState,move,legalMoves,solve,rayIds} from '../public/play/games/order-flow-model.mjs';
import {PROOFS} from '../public/play/games/order-flow-proof-data.mjs';
import {inspectPosition,nextMoveHint,verifyCertificate,levelSignature} from '../public/play/games/order-flow-proof.mjs';
import {buildProofs,serializeProofs} from '../scripts/build-order-flow-proof.mjs';
test('compact dependency certificates exactly match regeneration',()=>{
 const p=buildProofs();assert.equal(readFileSync(new URL('../public/play/games/order-flow-proof-data.mjs',import.meta.url),'utf8').replaceAll('\r',''),serializeProofs(p));
 assert.ok(p.every((c,i)=>verifyCertificate(LEVELS[i],c)));assert.equal(Math.max(...p.map(c=>c.depth)),34);
});
test('every dependency is ranked earlier: the proof covers every remaining subset, not only one route',()=>{
 for(const l of LEVELS){const c=PROOFS[l.index],rank=new Map(c.order.map((id,i)=>[id,i]));
  for(const car of l.cars)for(const blocker of rayIds(l,car))assert.ok(rank.get(blocker)<rank.get(car.id));
 }
});
test('every reachable position on the first yard is solvable and every legal removal stays solvable',()=>{
 const l=LEVELS[0],seen=new Set(),todo=[initialState(l)];
 for(let i=0;i<todo.length;i++){const s=todo[i],key=s.yard.join(',');if(seen.has(key))continue;seen.add(key);
  assert.equal(inspectPosition(l,s).minimum,s.yard.length);assert.equal(solve(l,s).moves,s.yard.length);
  for(const id of legalMoves(l,s))todo.push(move(l,s,id).state);
 }
 assert.ok(seen.size>l.cars.length);
});
test('the largest yard remains solvable under several different legal removal orders',()=>{
 const l=LEVELS.at(-1);
 for(let policy=0;policy<8;policy++){let s=initialState(l);while(s.yard.length){const options=legalMoves(l,s),id=options[(s.moves*7+policy)%options.length];assert.ok(id);s=move(l,s,id).state;assert.equal(inspectPosition(l,s).minimum,s.yard.length);}assert.equal(s.status,'won');}
});
test('cycles, reordered certificates and definition drift cannot claim verification',()=>{
 const l=LEVELS[0],c=PROOFS[0];assert.equal(verifyCertificate(l,{...c,order:[...c.order].reverse()}),false);
 assert.equal(verifyCertificate({...l,cols:99},c),false);assert.equal(inspectPosition({...l,cols:99},initialState(l)).kind,'unknown');
 const cycle={cols:2,rows:1,cars:[{id:1,x:0,y:0,dir:'right'},{id:2,x:1,y:0,dir:'left'}]};
 assert.equal(verifyCertificate(cycle,{signature:levelSignature(cycle),order:[1,2]}),false);
});
test('duplicate and invalid car identities fail closed',()=>{
 const l=LEVELS[0];for(const yard of [[1,1],[999],[-1]])assert.equal(inspectPosition(l,{...initialState(l),yard}).kind,'unknown');
});
test('hints only identify currently legal cars and disappear after a win',()=>{
 for(const l of LEVELS){let s=initialState(l);while(s.yard.length){const h=nextMoveHint(l,s);assert.ok(legalMoves(l,s).includes(h.id));s=move(l,s,h.id).state;}assert.equal(nextMoveHint(l,s),null);}
});
