import {PROOFS} from './order-flow-proof-data.mjs';
import {positionKey,levelSignature} from './order-flow-position.mjs';
import {SKILLS,lossInfo} from './order-flow-model.mjs';

export function inspectPosition(level,state){
 const certificate=PROOFS[level.index],left=level.budget-state.moves;
 if(!certificate||certificate.signature!==levelSignature(level))return {kind:'unknown',left};
 if(state.cause==='moves')return {kind:'budget',left,minimum:null,next:[]};
 const row=certificate.positions[positionKey(state)];
 if(!row)return {kind:'unknown',left};
 const minimum=row[0];
 return {kind:minimum<0?'deadend':minimum>left?'budget':minimum===0?'won':'solvable',minimum:minimum<0?null:minimum,left,next:row.slice(1),positions:certificate.states};
}
export function riskExplanation(level,state,proof=inspectPosition(level,state)){
 if(proof.kind==='budget')return proof.minimum===null?lossInfo(level,state).text:'This plan needs '+proof.minimum+' more moves, but would leave only '+Math.max(0,proof.left)+'. Keep planning or Retry.';
 if(state.status==='lost')return lossInfo(level,state).text;
 return 'This move leaves no winning path: the remaining bots cannot clear the work. Keep planning and choose a different bot.';
}
export function nextMoveHint(level,state,proof=inspectPosition(level,state)){
 if(proof.kind!=='solvable')return null;
 const id=proof.next[0],bot=level.bots[id-1];
 const release=bot.skill==='memory'&&state.bay.some(b=>b?.id===id);
 return {id,text:release?'Release Memory for 1 move to free a bay slot.':'Try '+SKILLS[bot.skill].name+' bot '+id+'. Its arrow has a clear path and a finish is still possible.'};
}
