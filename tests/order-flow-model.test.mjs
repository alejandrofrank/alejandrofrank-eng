import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS,DIRECTIONS,generateYard,generatePuzzle,rayIds,initialState,copyState,blocker,legalMoves,move,solve,solveBFS,validateLevel,rating,stateKey} from '../public/play/games/order-flow-model.mjs';
import {SAVE_KEY,newAttempt,takeTurn,undoTurn,useHint,restoreProgress,serializeProgress} from '../public/play/games/order-flow-progress.mjs';
test('ten full grids retain identical two-seat cars and add one balanced queue and three parking spaces',()=>{
 assert.equal(LEVELS.length,10);assert.equal(LEVELS[0].cars.length,16);assert.equal(LEVELS.at(-1).cars.length,72);
 for(const l of LEVELS){
  assert.equal(validateLevel(l),true);assert.equal(l.cars.length,l.cols*l.rows);assert.equal(l.slots,3);assert.equal(l.queue.length,2*l.cars.length);
  assert.deepEqual(generateYard(l.cols,l.rows,l.seed),{cars:l.cars,witness:l.witness,split:l.split});assert.ok(l.cars.every(c=>c.capacity===2));assert.equal(legalMoves(l,initialState(l)).length>=2,true);
 }
});
test('independent BFS completes the queue, bay and yard on every level at the N-release lower bound',()=>{
 for(const l of LEVELS){const bfs=solveBFS(l);assert.equal(bfs.moves,l.cars.length);assert.equal(solve(l).moves,bfs.moves);let s=initialState(l);for(const id of bfs.path)s=move(l,s,id).state;assert.equal(s.status,'won');assert.equal(s.cursor,l.queue.length);assert.ok(s.bay.every(c=>!c));}
});
test('X by Y generation constructs reproducible complete solutions, not only removable yards',()=>{
 for(const [cols,rows] of [[2,2],[3,7],[7,3],[8,9],[12,12]])for(const seed of [0,23,91]){
  const l=generatePuzzle(cols,rows,seed);assert.equal(validateLevel(l),true);
  assert.deepEqual(generatePuzzle(cols,rows,seed),l);
  let s=initialState(l);for(const id of l.witness)s=move(l,s,id).state;
  assert.equal(s.status,'won');assert.equal(s.cursor,2*cols*rows);
 }
 for(const args of [[1,4,1],[13,4,1],[4,0,1],[4,4,NaN]])assert.throws(()=>generatePuzzle(...args));
 assert.throws(()=>generatePuzzle(4,4,1,{slots:2,wave:3}));
});
test('a blocked tap is immutable and names its nearest blocker',()=>{
 const l=LEVELS[0],s=initialState(l),id=s.yard.find(id=>blocker(l,s,id)),before=copyState(s),by=blocker(l,s,id);
 const r=move(l,s,id);assert.equal(r.state,s);assert.equal(r.blockedBy,by);assert.deepEqual(s,before);
});
test('all four rays inspect the entire exit path, including gaps',()=>{
 const l={cols:5,rows:5,cars:[]};for(const dir of Object.keys(DIRECTIONS)){
  const c={id:13,x:2,y:2,dir};l.cars[12]=c;const ray=rayIds(l,c);assert.equal(ray.length,2);
  assert.equal(blocker(l,{yard:[13,ray[1]]},13),ray[1]);assert.equal(blocker(l,{yard:[13]},13),null);
 }
});
test('the front color leaves at once and the other open car can hold a space',()=>{
 const l=LEVELS[0],s=initialState(l),open=legalMoves(l,s),id=l.witness[0],other=open.find(n=>n!==id),r=move(l,s,id);
 assert.equal(open.length,2);assert.equal(r.state.cursor,2);assert.ok(r.state.bay.every(c=>!c));assert.equal(r.events.filter(e=>e.type==='depart').length,1);
 assert.deepEqual(r.events.filter(e=>e.type==='board').map(e=>e.left),[1,0]);
 const held=move(l,s,other);assert.equal(held.state.cursor,0);assert.deepEqual(held.state.bay[0],{id:other,left:2});
 const follow=move(l,held.state,id);assert.equal(follow.state.cursor,4);assert.ok(follow.state.bay.every(c=>!c));assert.equal(follow.events.filter(e=>e.type==='depart').length,2);
});
test('the witness clears one car at a time instead of a long boarding run',()=>{
 for(const l of LEVELS){let s=initialState(l);for(const id of l.witness){const r=move(l,s,id);assert.equal(r.events.filter(e=>e.type==='board').length,2);assert.equal(r.events.filter(e=>e.type==='depart').length,1);assert.ok(r.state.bay.every(c=>!c));s=r.state;}assert.equal(s.status,'won');}
});
const tiny=()=>({cols:2,rows:2,slots:2,queue:['picker','courier','picker','courier','support','support','inventory','inventory'],cars:['picker','courier','support','inventory'].map((skill,i)=>({id:i+1,x:i%2,y:Math.floor(i/2),dir:i<2?'up':'down',skill,capacity:2})),witness:[1,2,3,4]});
test('only the front passenger boards; partially filled cars keep their slot',()=>{
 const l=tiny(),r=move(l,initialState(l),1);assert.equal(r.state.cursor,1);assert.equal(r.state.bay[0].left,1);
 const next=move(l,r.state,2);assert.equal(next.state.cursor,4);assert.ok(next.state.bay.every(c=>!c));
 assert.equal(initialState(l).cursor,0);
});
test('full parking with no front-color car loses immediately and refuses further taps',()=>{
 const l=tiny();let s=move(l,initialState(l),3).state;s=move(l,s,4).state;
 assert.equal(s.status,'lost');assert.equal(s.cursor,0);assert.ok(s.bay.every(Boolean));assert.deepEqual(legalMoves(l,s),[]);
 assert.ok(move(l,s,1).error);
});
test('empty yard alone is not a win; the queue and parking must also clear',()=>{
 const l=tiny(),s={...initialState(l),yard:[],bay:[{id:3,left:2},{id:4,left:2}],moves:4,cursor:4};
 assert.notEqual(s.status,'won');assert.equal(solve(l,s),null);
});
test('all successful turns conserve passengers and seats, including IDs above 64',()=>{
 const l=LEVELS.at(-1);let s=initialState(l);
 for(const id of l.witness){const before=copyState(s);s=move(l,s,id).state;assert.deepEqual(s.yard,before.yard.filter(n=>n!==id));assert.equal(2*s.yard.length+s.bay.reduce((n,c)=>n+(c?.left??0),0),l.queue.length-s.cursor);}
 assert.equal(s.moves,72);assert.equal(s.status,'won');
});
test('state keys distinguish parking, partial seats and queue cursor without 32-bit collisions',()=>{
 const s=initialState(LEVELS.at(-1));assert.notEqual(stateKey(s),stateKey({...s,yard:s.yard.filter(id=>id!==65)}));
 assert.notEqual(stateKey(s),stateKey({...s,cursor:1}));assert.notEqual(stateKey({...s,bay:[{id:1,left:1},null,null]}),stateKey({...s,bay:[{id:1,left:2},null,null]}));
});
test('validation rejects unmatched passenger counts, missing cells and invalid seats',()=>{
 for(const change of [{queue:[]},{slots:0},{witness:[]},{cars:[]},{cars:LEVELS[0].cars.map((c,i)=>i?c:{...c,capacity:3})}])assert.throws(()=>validateLevel({...LEVELS[0],...change}));
});
test('blocked taps, hints and boarding moves persist as distinct actions',()=>{
 const l=LEVELS[0];let a=newAttempt(l);a=takeTurn(l,a,1).attempt;assert.equal(a.mistakes,1);a=useHint(a);a=takeTurn(l,a,l.witness[0]).attempt;
 assert.deepEqual(restoreProgress(serializeProgress(0,Array(10).fill(0),a)).attempt,a);
});
test('Undo restores passengers, parking and the exact yard and stops after three uses',()=>{
 const l=LEVELS[0];let a=newAttempt(l);
 for(let i=0;i<3;i++){a=takeTurn(l,a,l.witness[0]).attempt;const before=copyState(a.state);a=takeTurn(l,a,l.witness[1]).attempt;a=undoTurn(l,a);assert.deepEqual(a.state,before);if(i<2)a={...a,state:initialState(l),history:[]};}
 assert.equal(undoTurn(l,a),null);
});
test('new boarding campaign preserves the earlier save keys and validates current action history',()=>{
 assert.equal(SAVE_KEY,'portfolio.order-flow.boarding-v2');
 for(const raw of ['{bad',null,JSON.stringify({version:2,level:9,stars:Array(10).fill(3),actions:[]}),JSON.stringify({version:3,level:9,stars:Array(10).fill(0),actions:[]}),JSON.stringify({version:3,level:0,stars:Array(10).fill(0),actions:[{tap:900}]}),JSON.stringify({version:3,level:0,stars:Array(10).fill(0),actions:[{undo:true}]})])assert.equal(restoreProgress(raw).attempt.state.moves,0);
});
test('saved wins restore the cleared queue, empty parking and best stars',()=>{
 const l=LEVELS[0];let a=newAttempt(l);for(const id of l.witness)a=takeTurn(l,a,id).attempt;
 const p=restoreProgress(serializeProgress(0,Array(10).fill(0),a));assert.equal(p.attempt.state.status,'won');assert.equal(p.attempt.state.cursor,l.queue.length);assert.equal(p.stars[0],3);
});
test('stars account for blocked taps, help and Undo',()=>{
 assert.equal(rating({mistakes:0,hints:0,undos:0}),3);assert.equal(rating({mistakes:1,hints:0,undos:0}),2);assert.equal(rating({mistakes:0,hints:1,undos:0}),2);
 assert.equal(rating({mistakes:3,hints:0,undos:0}),1);assert.equal(rating({mistakes:0,hints:2,undos:0}),1);assert.equal(rating({mistakes:0,hints:0,undos:1}),1);
});
