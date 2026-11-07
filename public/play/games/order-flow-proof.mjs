import {PROOFS} from './order-flow-proof-data.mjs';
import {rayIds,legalMoves} from './order-flow-model.mjs';
export const levelSignature=l=>JSON.stringify({cols:l.cols,rows:l.rows,cars:l.cars});
export function verifyCertificate(level,certificate){
 if(!certificate||certificate.signature!==levelSignature(level)||certificate.order.length!==level.cars.length||new Set(certificate.order).size!==level.cars.length)return false;
 const ranks=new Map(certificate.order.map((id,i)=>[id,i]));
 return level.cars.every(car=>ranks.has(car.id)&&rayIds(level,car).every(id=>ranks.get(id)<ranks.get(car.id)));
}
export function inspectPosition(level,state){
 const cert=PROOFS[level.index];
 if(!verifyCertificate(level,cert)||new Set(state.yard).size!==state.yard.length||state.yard.some(id=>!Number.isInteger(id)||id<1||id>level.cars.length))return {kind:'unknown',minimum:null,next:[]};
 // Every induced subgraph of a DAG is acyclic. The least-ranked remaining car
 // has no remaining blocker, so every legal move preserves a clearing path.
 return {kind:state.yard.length?'solvable':'won',minimum:state.yard.length,next:legalMoves(level,state)};
}
export function nextMoveHint(level,state){
 const proof=inspectPosition(level,state);if(proof.kind!=='solvable')return null;
 return {id:proof.next[0],text:'The highlighted arrow has a clear path to the edge.'};
}
