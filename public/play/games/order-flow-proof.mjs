import {PROOFS} from './order-flow-proof-data.mjs';
import {SKILLS,stateKey,legalMoves,move,initialState} from './order-flow-model.mjs';
export const levelSignature=l=>JSON.stringify({cols:l.cols,rows:l.rows,cars:l.cars,queue:l.queue,slots:l.slots});
export function validState(level,s){
 if(!s||!Array.isArray(s.yard)||!Array.isArray(s.bay)||s.bay.length!==level.slots||!Number.isInteger(s.cursor)||s.cursor<0||s.cursor>level.queue.length)return false;
 const ids=[...s.yard,...s.bay.filter(Boolean).map(c=>c.id)];
 if(new Set(ids).size!==ids.length||ids.some(id=>!Number.isInteger(id)||id<1||id>level.cars.length)||s.bay.some(c=>c&&![1,2].includes(c.left))||s.moves!==level.cars.length-s.yard.length)return false;
 for(const skill of Object.keys(SKILLS)){
  const seats=2*s.yard.filter(id=>level.cars[id-1].skill===skill).length+s.bay.reduce((n,c)=>n+(c&&level.cars[c.id-1].skill===skill?c.left:0),0);
  if(seats!==level.queue.slice(s.cursor).filter(c=>c===skill).length)return false;
 }
 const won=s.cursor===level.queue.length&&!s.yard.length&&s.bay.every(c=>!c),status=won?'won':s.bay.every(Boolean)?'lost':'playing';
 return s.status===status&&!s.bay.some(c=>c&&level.cars[c.id-1].skill===level.queue[s.cursor]);
}
export function inspectPosition(level,state){
 const cert=PROOFS[level.index];
 if(!cert||cert.signature!==levelSignature(level)||!validState(level,state))return {kind:'unknown',minimum:null,next:[]};
 const choice=cert.policy[stateKey(state)];
 if(choice===undefined)return {kind:'unknown',minimum:null,next:[]};
 if(choice<0)return {kind:'dead-end',minimum:null,next:[]};
 return {kind:choice===0?'won':'solvable',minimum:state.yard.length,next:choice?[choice]:[]};
}
export function nextMoveHint(level,state){
 const proof=inspectPosition(level,state);if(proof.kind!=='solvable')return null;
 return {id:proof.next[0],text:'This car keeps a complete route through the queue and parking bay.'};
}
export function verifyCertificate(level,cert){
 if(!cert||cert.signature!==levelSignature(level))return false;
 const seen=new Set(),visit=s=>{
  const key=stateKey(s);if(seen.has(key))return true;seen.add(key);
  const choice=cert.policy[key];if(choice===undefined)return false;
  if(s.status==='won')return choice===0;
  const children=legalMoves(level,s).map(id=>({id,state:move(level,s,id).state}));
  if(!children.every(c=>visit(c.state)))return false;
  const winning=children.filter(c=>cert.policy[stateKey(c.state)]>=0);
  return winning.length?winning.some(c=>c.id===choice):choice===-1;
 };
 return visit(initialState(level))&&seen.size===Object.keys(cert.policy).length;
}
