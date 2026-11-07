import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LEVELS,initialState,move,legalMoves,solveBFS,stateKey} from '../public/play/games/order-flow-model.mjs';
import {PROOFS} from '../public/play/games/order-flow-proof-data.mjs';
import {inspectPosition,nextMoveHint,verifyCertificate,validState} from '../public/play/games/order-flow-proof.mjs';
import {buildProofs,serializeProofs,buildCertificate} from '../scripts/build-order-flow-proof.mjs';
test('the complete yard/queue/parking proof exactly matches regeneration',()=>{
 const p=buildProofs();assert.equal(readFileSync(new URL('../public/play/games/order-flow-proof-data.mjs',import.meta.url),'utf8').replaceAll('\r',''),serializeProofs(p));
});
test('every reachable edge and terminal outcome is verified for all twenty levels',()=>{
 for(const l of LEVELS)assert.equal(verifyCertificate(l,PROOFS[l.index]),true);
});
test('the certificate agrees with independent BFS from every position on the tutorial',()=>{
 const l=LEVELS[0],seen=new Set(),todo=[initialState(l)];
 for(let i=0;i<todo.length;i++){const s=todo[i],key=stateKey(s);if(seen.has(key))continue;seen.add(key);
  const bfs=solveBFS(l,s),proof=inspectPosition(l,s);assert.equal(proof.kind,bfs?(s.status==='won'?'won':'solvable'):'dead-end');
  if(bfs)assert.equal(proof.minimum,bfs.moves);for(const id of legalMoves(l,s))todo.push(move(l,s,id).state);
 }
 assert.equal(seen.size,Object.keys(PROOFS[0].policy).length);
});
test('every campaign has genuinely losing queue/parking choices despite an acyclic yard',()=>{
 for(const l of LEVELS)assert.ok(Object.values(PROOFS[l.index].policy).some(v=>v===-1));
});
test('safe hints lead through the real queue and parking all the way to a win',()=>{
 for(const l of LEVELS){let s=initialState(l);while(s.status==='playing'){const h=nextMoveHint(l,s);assert.ok(legalMoves(l,s).includes(h.id));s=move(l,s,h.id).state;}assert.equal(s.status,'won');assert.equal(s.cursor,l.queue.length);assert.equal(nextMoveHint(l,s),null);}
});
test('definition drift, incomplete certificates and incorrect policies fail closed',()=>{
 const l=LEVELS[0],p=PROOFS[0];assert.equal(verifyCertificate({...l,slots:4},p),false);assert.equal(inspectPosition({...l,queue:[...l.queue].reverse()},initialState(l)).kind,'unknown');
 const policy={...p.policy};delete policy[Object.keys(policy)[0]];assert.equal(verifyCertificate(l,{...p,policy}),false);
 assert.equal(verifyCertificate(l,{...p,policy:{...p.policy,[stateKey(initialState(l))]:-1}}),false);
 assert.throws(()=>buildCertificate(l,{limit:1}),/incomplete proof/);
});
test('malformed parking, queue and car identities cannot claim a solution',()=>{
 const l=LEVELS[0],s=initialState(l);
 for(const bad of [{...s,yard:[1,1]},{...s,yard:[999]},{...s,cursor:1},{...s,bay:[{id:1,left:2},null,null]},{...s,moves:8},{...s,status:'won'}]){assert.equal(validState(l,bad),false);assert.equal(inspectPosition(l,bad).kind,'unknown');}
});
