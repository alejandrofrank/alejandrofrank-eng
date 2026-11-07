import {LEVELS,initialState,copyState,move,rating} from './order-flow-model.mjs';
// New campaign; leave the previous campaign's stored progress untouched.
export const SAVE_KEY='portfolio.order-flow.packed-v1';
export const newAttempt=level=>({state:initialState(level),history:[],mistakes:0,undos:0,hints:0,actions:[]});
export function takeTurn(level,a,id){
 const result=move(level,a.state,id);
 if(result.error)return {...result,attempt:result.blockedBy?{...a,mistakes:a.mistakes+1,actions:[...a.actions,{tap:id}]}:a};
 return {...result,attempt:{...a,state:result.state,history:[...a.history,copyState(a.state)],actions:[...a.actions,{tap:id}]}};
}
export function undoTurn(level,a){
 if(!a.history.length||a.undos>=3)return null;
 return {...a,state:copyState(a.history.at(-1)),history:a.history.slice(0,-1),undos:a.undos+1,actions:[...a.actions,{undo:true}]};
}
export const useHint=a=>({...a,hints:a.hints+1,actions:[...a.actions,{hint:true}]});
export function restoreProgress(raw){
 const fresh={level:0,stars:Array(LEVELS.length).fill(0),attempt:newAttempt(LEVELS[0])};
 try{
  const saved=JSON.parse(raw);
  if(saved?.version!==2||!Number.isInteger(saved.level)||saved.level<0||saved.level>=LEVELS.length||!Array.isArray(saved.stars)||saved.stars.length!==LEVELS.length||saved.stars.some(s=>!Number.isInteger(s)||s<0||s>3)||!Array.isArray(saved.actions)||saved.actions.length>1000)return fresh;
  if(saved.stars.slice(0,saved.level).some(s=>s===0))return fresh;
  let attempt=newAttempt(LEVELS[saved.level]);
  for(const action of saved.actions){
   if(action.undo===true){attempt=undoTurn(LEVELS[saved.level],attempt);if(!attempt)return fresh;}
   else if(action.hint===true){if(attempt.state.status!=='playing')return fresh;attempt=useHint(attempt);}
   else if(Number.isInteger(action.tap)){const turn=takeTurn(LEVELS[saved.level],attempt,action.tap);if(turn.error&&!turn.blockedBy)return fresh;attempt=turn.attempt;}
   else return fresh;
  }
  if(attempt.state.status==='won')saved.stars[saved.level]=Math.max(saved.stars[saved.level],rating(attempt));
  return {level:saved.level,stars:saved.stars,attempt};
 }catch{return fresh;}
}
export const serializeProgress=(level,stars,attempt)=>JSON.stringify({version:2,level,stars,actions:attempt.actions});
