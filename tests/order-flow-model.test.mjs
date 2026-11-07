import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS,DIRECTIONS,generateYard,rayIds,initialState,copyState,blocker,legalMoves,move,solve,solveBFS,validateLevel,rating} from '../public/play/games/order-flow-model.mjs';
import {SAVE_KEY,newAttempt,takeTurn,undoTurn,useHint,restoreProgress,serializeProgress} from '../public/play/games/order-flow-progress.mjs';

test('ten deterministic, fully packed yards grow from 16 to 72 identical two-seat cars',()=>{
 assert.equal(LEVELS.length,10);assert.equal(LEVELS[0].cars.length,16);assert.equal(LEVELS.at(-1).cars.length,72);
 for(const [i,l] of LEVELS.entries()){
  assert.equal(validateLevel(l),true);assert.equal(l.cars.length,l.cols*l.rows);
  assert.deepEqual(generateYard(l.cols,l.rows,l.seed),{cars:l.cars,witness:l.witness});
  assert.ok(l.cars.every(c=>c.capacity===2));assert.ok(!('queue' in l)&&!('slots' in l));
  if(i)assert.ok(l.cars.length>LEVELS[i-1].cars.length);
 }
});
test('independent BFS solves every campaign level at its exact N-car lower bound',()=>{
 for(const l of LEVELS){const bfs=solveBFS(l);assert.equal(bfs.moves,l.cars.length);assert.equal(solve(l).moves,bfs.moves);let s=initialState(l);for(const id of bfs.path)s=move(l,s,id).state;assert.equal(s.status,'won');}
});
test('a blocked tap is immutable and names the nearest blocker',()=>{
 const l=LEVELS[0],s=initialState(l),id=s.yard.find(id=>blocker(l,s,id)),before=copyState(s),by=blocker(l,s,id);
 const r=move(l,s,id);assert.equal(r.state,s);assert.equal(r.blockedBy,by);assert.deepEqual(s,before);
});
test('all four arrow rays inspect every cell to the edge, including gaps',()=>{
 const l={cols:5,rows:5,cars:[]};for(const dir of Object.keys(DIRECTIONS)){
  const c={id:13,x:2,y:2,dir};l.cars[12]=c;const ray=rayIds(l,c);assert.equal(ray.length,2);
  assert.equal(blocker(l,{yard:[13,ray[1]]},13),ray[1]);assert.equal(blocker(l,{yard:[13]},13),null);
 }
});
test('car identifiers above 32 and 64 remain independent',()=>{
 const l=LEVELS.at(-1);let s=initialState(l);
 for(const id of solve(l).path){const before=[...s.yard];s=move(l,s,id).state;assert.deepEqual(s.yard,before.filter(n=>n!==id));}
 assert.equal(s.moves,72);assert.equal(s.yard.length,0);
});
test('cleared cars cannot be released twice and wins reject further taps',()=>{
 const l=LEVELS[0],id=legalMoves(l,initialState(l))[0],r=move(l,initialState(l),id);
 assert.ok(move(l,r.state,id).error);let s=initialState(l);for(const n of solve(l).path)s=move(l,s,n).state;assert.ok(move(l,s,1).error);
});
test('generation has no random global source and rejects malformed authored layouts',()=>{
 assert.deepEqual(generateYard(4,4,15),generateYard(4,4,15));assert.notDeepEqual(generateYard(4,4,15),generateYard(4,4,16));
 for(const change of [{cars:[]},{witness:[]},{cars:LEVELS[0].cars.map((c,i)=>i?c:{...c,capacity:3})}])assert.throws(()=>validateLevel({...LEVELS[0],...change}));
});
test('blocked taps, hints and successful releases persist as distinct actions',()=>{
 const l=LEVELS[0];let a=newAttempt(l),bad=legalMoves(l,a.state)[0]===1?2:1;
 a=takeTurn(l,a,bad).attempt;assert.equal(a.mistakes,1);assert.equal(a.state.moves,0);
 a=useHint(a);a=takeTurn(l,a,legalMoves(l,a.state)[0]).attempt;
 const saved=restoreProgress(serializeProgress(0,Array(10).fill(0),a));assert.deepEqual(saved.attempt,a);
});
test('Undo restores the exact car and stops after three uses',()=>{
 const l=LEVELS[0];let a=newAttempt(l);
 for(let i=0;i<3;i++){const before=copyState(a.state);a=takeTurn(l,a,legalMoves(l,a.state)[0]).attempt;a=undoTurn(l,a);assert.deepEqual(a.state,before);}
 a=takeTurn(l,a,legalMoves(l,a.state)[0]).attempt;assert.equal(undoTurn(l,a),null);assert.equal(a.undos,3);
});
test('new campaign saves do not reuse old coordination stars or mutate the old key',()=>{
 assert.equal(SAVE_KEY,'portfolio.order-flow.packed-v1');
 assert.equal(restoreProgress(JSON.stringify({version:1,level:9,stars:Array(10).fill(3),actions:[]})).level,0);
});
test('invalid, corrupted or impossible action histories restart safely',()=>{
 for(const raw of ['{bad',null,JSON.stringify({version:2,level:9,stars:Array(10).fill(0),actions:[]}),JSON.stringify({version:2,level:0,stars:Array(10).fill(0),actions:[{tap:900}]}),JSON.stringify({version:2,level:0,stars:Array(10).fill(0),actions:[{undo:true}]})])assert.equal(restoreProgress(raw).attempt.state.moves,0);
});
test('a completed yard restores its best stars and clear state',()=>{
 const l=LEVELS[0];let a=newAttempt(l);for(const id of solve(l).path)a=takeTurn(l,a,id).attempt;
 const p=restoreProgress(serializeProgress(0,Array(10).fill(0),a));assert.equal(p.attempt.state.status,'won');assert.equal(p.stars[0],3);
});
test('stars reward careful reading and explicitly account for help and Undo',()=>{
 assert.equal(rating({mistakes:0,hints:0,undos:0}),3);assert.equal(rating({mistakes:1,hints:0,undos:0}),2);assert.equal(rating({mistakes:0,hints:1,undos:0}),2);
 assert.equal(rating({mistakes:3,hints:0,undos:0}),1);assert.equal(rating({mistakes:0,hints:2,undos:0}),1);assert.equal(rating({mistakes:0,hints:0,undos:1}),1);
});

