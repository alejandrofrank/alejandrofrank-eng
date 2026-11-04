import {LEVELS,initialState,copyState,move,rating} from './order-flow-model.mjs';
export const SAVE_KEY='portfolio.order-flow.coordination-v1';
export const newAttempt=level=>({state:initialState(level),history:[],undos:0,actions:[]});
export function takeTurn(level,attempt,id){
 const result=move(level,attempt.state,id);
 if(result.error)return {attempt,...result};
 return {...result,attempt:{state:result.state,history:[...attempt.history,copyState(attempt.state)],undos:attempt.undos,actions:[...attempt.actions,{tap:id}]}};
}
export function undoTurn(level,a){
 if(!a.history.length||a.undos>=3||a.state.moves>level.budget)return null;
 const state=copyState(a.history.at(-1));state.moves=a.state.moves;
 return {state,history:a.history.slice(0,-1),undos:a.undos+1,actions:[...a.actions,{undo:true}]};
}
export function restoreProgress(raw){
 const fresh={level:0,stars:Array(LEVELS.length).fill(0),attempt:newAttempt(LEVELS[0])};
 try{
  const saved=JSON.parse(raw);
  if(saved?.version!==1||!Number.isInteger(saved.level)||saved.level<0||saved.level>=LEVELS.length||!Array.isArray(saved.stars)||saved.stars.length!==LEVELS.length||saved.stars.some(s=>!Number.isInteger(s)||s<0||s>3)||!Array.isArray(saved.actions)||saved.actions.length>100)return fresh;
  if(saved.stars.slice(0,saved.level).some(s=>s===0))return fresh;
  let attempt=newAttempt(LEVELS[saved.level]);
  for(const action of saved.actions){
   if(action.undo===true){attempt=undoTurn(LEVELS[saved.level],attempt);if(!attempt)return fresh;}
   else if(Number.isInteger(action.tap)){const turn=takeTurn(LEVELS[saved.level],attempt,action.tap);if(turn.error)return fresh;attempt=turn.attempt;}
   else return fresh;
  }
  if(attempt.state.status==='won')saved.stars[saved.level]=Math.max(saved.stars[saved.level],rating(LEVELS[saved.level],attempt.state.moves,attempt.undos));
  return {level:saved.level,stars:saved.stars,attempt};
 }catch{return fresh;}
}
export function serializeProgress(level,stars,attempt){return JSON.stringify({version:1,level,stars,actions:attempt.actions});}

