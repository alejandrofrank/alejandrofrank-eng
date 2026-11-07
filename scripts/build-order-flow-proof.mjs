import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {LEVELS,validateLevel,initialState,legalMoves,move,stateKey} from '../public/play/games/order-flow-model.mjs';
export const levelSignature=l=>JSON.stringify({cols:l.cols,rows:l.rows,cars:l.cars,queue:l.queue,slots:l.slots});
export function buildCertificate(level,{limit=250000}={}){
 validateLevel(level);
 const policy=Object.create(null);let visited=0;
 function visit(state){
  const key=stateKey(state);if(key in policy)return policy[key];
  if(++visited>limit)throw Error('Certificate limit exceeded; incomplete proof refused');
  if(state.status==='won')return policy[key]=0;
  let next=-1;
  for(const id of legalMoves(level,state)){
   const result=visit(move(level,state,id).state);
   if(result>=0&&next<0)next=id;
  }
  return policy[key]=next;
 }
 if(visit(initialState(level))<1)throw Error('No complete parking/queue solution');
 return {signature:levelSignature(level),minimum:level.cars.length,policy};
}
export const buildProofs=()=>LEVELS.map(l=>buildCertificate(l));
export const serializeProofs=p=>'// Generated: every reachable yard + bay + passenger position.\nexport const PROOFS = '+JSON.stringify(p)+';\n';
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const proofs=buildProofs();writeFileSync(new URL('../public/play/games/order-flow-proof-data.mjs',import.meta.url),serializeProofs(proofs));
 console.log(proofs.map((p,i)=>({level:i+1,states:Object.keys(p.policy).length,deadEnds:Object.values(p.policy).filter(v=>v<0).length})));
}
