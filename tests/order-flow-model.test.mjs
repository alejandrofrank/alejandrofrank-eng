import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS,DIRECTIONS,generateYard,generatePuzzle,rayIds,initialState,copyState,blocker,legalMoves,move,solve,solveBFS,validateLevel,rating,stateKey,isIncognito,visiblePassengers} from '../public/play/games/order-flow-model.mjs';
import {SAVE_KEY,newAttempt,takeTurn,undoTurn,useHint,restoreProgress,serializeProgress,remainingTime,expireAttempt} from '../public/play/games/order-flow-progress.mjs';
test('twenty full grids retain two-seat cars and balanced queues; the final two have only two spaces',()=>{
 assert.equal(LEVELS.length,20);assert.equal(LEVELS[0].cars.length,16);assert.equal(LEVELS.at(-1).cars.length,72);
 for(const l of LEVELS){
  assert.equal(validateLevel(l),true);assert.equal(l.cars.length,l.cols*l.rows);assert.equal(l.slots,l.index<18?3:2);assert.equal(l.queue.length,2*l.cars.length);
  assert.deepEqual(generateYard(l.cols,l.rows,l.seed),{cars:l.cars,witness:l.witness});assert.ok(l.cars.every(c=>c.capacity===2));
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
test('a nonmatching car occupies a slot until the front passenger can board it',()=>{
 const l=LEVELS[0],s=initialState(l),id=l.witness[0],r=move(l,s,id);
 assert.equal(r.state.cursor,0);assert.deepEqual(r.state.bay[0],{id,left:2});assert.equal(r.events[0].type,'park');
 const second=move(l,r.state,l.witness[1]);assert.equal(second.state.cursor,4);assert.ok(second.state.bay.every(c=>!c));
 assert.deepEqual(second.events.filter(e=>e.type==='board').map(e=>e.left),[1,1,0,0]);
 assert.equal(second.events.filter(e=>e.type==='depart').length,2);
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
 assert.deepEqual(restoreProgress(serializeProgress(0,Array(LEVELS.length).fill(0),a)).attempt,a);
});
test('Undo restores passengers, parking and the exact yard and stops after three uses',()=>{
 const l=LEVELS[0];let a=newAttempt(l);
 for(let i=0;i<3;i++){a=takeTurn(l,a,l.witness[0]).attempt;const before=copyState(a.state);a=takeTurn(l,a,l.witness[1]).attempt;a=undoTurn(l,a);assert.deepEqual(a.state,before);if(i<2)a={...a,state:initialState(l),history:[]};}
 assert.equal(undoTurn(l,a),null);
});
test('new boarding campaign preserves the earlier save keys and validates current action history',()=>{
 assert.equal(SAVE_KEY,'portfolio.order-flow.boarding-v1');
 for(const raw of ['{bad',null,JSON.stringify({version:2,level:9,stars:Array(10).fill(3),actions:[]}),JSON.stringify({version:3,level:9,stars:Array(10).fill(0),actions:[]}),JSON.stringify({version:3,level:0,stars:Array(10).fill(0),actions:[{tap:900}]}),JSON.stringify({version:3,level:0,stars:Array(10).fill(0),actions:[{undo:true}]})])assert.equal(restoreProgress(raw).attempt.state.moves,0);
});
test('saved wins restore the cleared queue, empty parking and best stars',()=>{
 const l=LEVELS[0];let a=newAttempt(l);for(const id of l.witness)a=takeTurn(l,a,id).attempt;
 const p=restoreProgress(serializeProgress(0,Array(LEVELS.length).fill(0),a));assert.equal(p.attempt.state.status,'won');assert.equal(p.attempt.state.cursor,l.queue.length);assert.equal(p.stars[0],3);
});
test('stars account for blocked taps, help and Undo',()=>{
 assert.equal(rating({mistakes:0,hints:0,undos:0}),3);assert.equal(rating({mistakes:1,hints:0,undos:0}),2);assert.equal(rating({mistakes:0,hints:1,undos:0}),2);
 assert.equal(rating({mistakes:3,hints:0,undos:0}),1);assert.equal(rating({mistakes:0,hints:2,undos:0}),1);assert.equal(rating({mistakes:0,hints:0,undos:1}),1);
});

test('incognito begins at level six and reveals exactly when the whole exit ray clears',()=>{
 for(const l of LEVELS){let s=initialState(l),revealed=0;
  assert.equal(l.incognito.length>0,l.index>=5);
  for(const id of l.witness){const hidden=s.yard.filter(n=>isIncognito(l,s,n));assert.equal(!!isIncognito(l,s,id),false);s=move(l,s,id).state;
   for(const n of hidden)if(!isIncognito(l,s,n)){assert.equal(blocker(l,s,n),null);revealed++;}
  }
  if(l.index>=5)assert.ok(revealed>0);
 }
});

test('only the current passenger is exposed from level seven, including after each turn',()=>{
 for(const l of LEVELS){let s=initialState(l);assert.equal(l.hiddenQueue,l.index>=6);
  for(const id of l.witness){const visible=visiblePassengers(l,s);assert.deepEqual(visible,l.hiddenQueue?l.queue.slice(s.cursor,s.cursor+1):l.queue.slice(s.cursor));s=move(l,s,id).state;}
  assert.deepEqual(visiblePassengers(l,s),[]);
 }
});

test('timers begin at level thirteen and start only on the first successful release',()=>{
 for(const l of LEVELS){assert.equal(Boolean(l.timeLimitSeconds),l.index>=12);let a=newAttempt(l);
  const blocked=a.state.yard.find(id=>blocker(l,a.state,id));a=takeTurn(l,a,blocked,1000).attempt;assert.equal(a.deadline,null);
  a=takeTurn(l,a,l.witness[0],2000).attempt;
  assert.equal(a.deadline,l.timeLimitSeconds?2000+l.timeLimitSeconds*1000:null);
  if(l.timeLimitSeconds)assert.equal(remainingTime(l,a,3000),l.timeLimitSeconds*1000-1000);
 }
});

test('Undo and reload retain the deadline; timeout refuses moves and Undo; Retry is fresh',()=>{
 const l=LEVELS[12],stars=LEVELS.map((_,i)=>i<12?3:0);let a=takeTurn(l,newAttempt(l),l.witness[0],1000).attempt;
 const deadline=a.deadline;a=undoTurn(l,a,2000);assert.equal(a.deadline,deadline);assert.equal(a.state.moves,0);
 a=restoreProgress(serializeProgress(12,stars,a),3000).attempt;assert.equal(a.deadline,deadline);assert.equal(a.timedOut,false);
 const expired=restoreProgress(serializeProgress(12,stars,a),deadline).attempt;assert.equal(expired.timedOut,true);assert.equal(remainingTime(l,expired,deadline),0);
 const turn=takeTurn(l,expired,l.witness[0],deadline+1);assert.ok(turn.error);assert.equal(turn.state.moves,0);assert.equal(undoTurn(l,expired,deadline+1),null);
 assert.equal(newAttempt(l).deadline,null);assert.equal(newAttempt(l).timedOut,false);
});

test('a final tap at the deadline loses, while a completed win never expires',()=>{
 const l=LEVELS[12];let a=newAttempt(l);for(const id of l.witness.slice(0,-1))a=takeTurn(l,a,id,1000).attempt;
 const late=takeTurn(l,a,l.witness.at(-1),a.deadline);assert.equal(late.attempt.timedOut,true);assert.notEqual(late.state.status,'won');
 const won=takeTurn(l,a,l.witness.at(-1),a.deadline-1).attempt;assert.equal(won.state.status,'won');assert.equal(expireAttempt(l,won,a.deadline+1000).timedOut,false);
});

test('ten-level saves migrate without losing stars, current board or unlocks',()=>{
 const l=LEVELS[9],old={version:3,level:9,stars:Array(10).fill(3),actions:[{tap:l.witness[0]}]};
 const migrated=restoreProgress(JSON.stringify(old));assert.equal(migrated.level,9);assert.equal(migrated.attempt.state.moves,1);
 assert.deepEqual(migrated.stars,[...Array(10).fill(3),...Array(10).fill(0)]);
 const roundtrip=restoreProgress(serializeProgress(migrated.level,migrated.stars,migrated.attempt));assert.deepEqual(roundtrip,migrated);
});
