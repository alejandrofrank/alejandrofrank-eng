import {LEVELS,initialState,copyState,move,rating} from './order-flow-model.mjs';
// Keep the save key: the original ten boards and their earned stars still apply.
export const SAVE_KEY='portfolio.order-flow.boarding-v1';
export const newAttempt=level=>({state:initialState(level),history:[],mistakes:0,undos:0,hints:0,actions:[],deadline:null,timedOut:false});
export function remainingTime(level,a,now=Date.now()){
 if(!level.timeLimitSeconds)return null;
 return a.timedOut?0:Math.max(0,Math.min(level.timeLimitSeconds*1000,a.deadline===null?level.timeLimitSeconds*1000:a.deadline-now));
}
export function expireAttempt(level,a,now=Date.now()){
 return a.state.status!=='won'&&a.deadline!==null&&remainingTime(level,a,now)===0?{...a,timedOut:true}:a;
}
export function takeTurn(level,previous,id,now=Date.now()){
 const a=expireAttempt(level,previous,now);
 if(a.timedOut)return {state:a.state,attempt:a,error:'Time is up.'};
 const result=move(level,a.state,id);
 if(result.error)return {...result,attempt:result.blockedBy?{...a,mistakes:a.mistakes+1,actions:[...a.actions,{tap:id}]}:a};
 return {...result,attempt:{...a,state:result.state,history:[...a.history,copyState(a.state)],actions:[...a.actions,{tap:id}],deadline:a.deadline??(level.timeLimitSeconds?now+level.timeLimitSeconds*1000:null)}};
}
export function undoTurn(level,a,now=Date.now()){
 if(a.timedOut||remainingTime(level,a,now)===0||!a.history.length||a.undos>=3)return null;
 return {...a,state:copyState(a.history.at(-1)),history:a.history.slice(0,-1),undos:a.undos+1,actions:[...a.actions,{undo:true}]};
}
export const useHint=a=>({...a,hints:a.hints+1,actions:[...a.actions,{hint:true}]});
export function restoreProgress(raw,now=Date.now()){
 const fresh={level:0,stars:Array(LEVELS.length).fill(0),attempt:newAttempt(LEVELS[0])};
 try{
  const saved=JSON.parse(raw),legacy=saved?.version===3;
  if((!legacy&&saved?.version!==4)||!Number.isInteger(saved.level)||saved.level<0||saved.level>=(legacy?10:LEVELS.length)||!Array.isArray(saved.stars)||saved.stars.length!==(legacy?10:LEVELS.length)||saved.stars.some(s=>!Number.isInteger(s)||s<0||s>3)||!Array.isArray(saved.actions)||saved.actions.length>1000)return fresh;
  if(saved.stars.slice(0,saved.level).some(s=>s===0))return fresh;
  const level=LEVELS[saved.level];let attempt=newAttempt(level);
  // Replay logical history with a fixed clock, then restore the original deadline.
  for(const action of saved.actions){
   if(action.undo===true){attempt=undoTurn(level,attempt,0);if(!attempt)return fresh;}
   else if(action.hint===true){if(attempt.state.status!=='playing')return fresh;attempt=useHint(attempt);}
   else if(Number.isInteger(action.tap)){const turn=takeTurn(level,attempt,action.tap,0);if(turn.error&&!turn.blockedBy)return fresh;attempt=turn.attempt;}
   else return fresh;
  }
  if(!legacy){
   if(typeof saved.timedOut!=='boolean'||(saved.deadline!==null&&(!Number.isSafeInteger(saved.deadline)||saved.deadline<=0)))return fresh;
   const started=attempt.deadline!==null;
   if(level.timeLimitSeconds?(started!==(saved.deadline!==null)):saved.deadline!==null||saved.timedOut)return fresh;
   if(saved.timedOut&&(!saved.deadline||attempt.state.status==='won'))return fresh;
   attempt={...attempt,deadline:saved.deadline,timedOut:saved.timedOut};
  }
  const stars=[...saved.stars,...Array(LEVELS.length-saved.stars.length).fill(0)];
  attempt=expireAttempt(level,attempt,now);
  if(attempt.state.status==='won')stars[saved.level]=Math.max(stars[saved.level],rating(attempt));
  return {level:saved.level,stars,attempt};
 }catch{return fresh;}
}
export const serializeProgress=(level,stars,attempt)=>JSON.stringify({version:4,level,stars,actions:attempt.actions,deadline:attempt.deadline,timedOut:attempt.timedOut});
