import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS,generatePuzzle} from '../public/play/games/order-flow-model.mjs';
import {inspectPosition} from '../public/play/games/order-flow-proof.mjs';

// A second rules implementation, not a second search over the production move().
// It checks aligned occupied cells instead of rayIds(), consumes an actual queue,
// and counts filled seats instead of remaining capacity. Do not import the game
// transition, blocker, solver or witness validator here.
function start(level){
 return {yard:level.cars.map(c=>c.id),passengers:[...level.queue],parking:Array(level.slots).fill(null)};
}
function exits(level,state){
 if(!state.parking.includes(null))return [];
 return state.yard.filter(id=>{
  const car=level.cars[id-1];
  return !state.yard.some(other=>{
   if(other===id)return false;
   const obstacle=level.cars[other-1];
   switch(car.dir){
    case 'left':return obstacle.y===car.y&&obstacle.x<car.x;
    case 'right':return obstacle.y===car.y&&obstacle.x>car.x;
    case 'up':return obstacle.x===car.x&&obstacle.y<car.y;
    case 'down':return obstacle.x===car.x&&obstacle.y>car.y;
    default:throw Error('Unknown direction');
   }
  });
 });
}
function release(level,previous,id){
 assert.ok(exits(level,previous).includes(id),'Only an unobstructed car can enter free parking');
 const state={yard:previous.yard.filter(n=>n!==id),passengers:[...previous.passengers],parking:previous.parking.map(c=>c?{...c}:null)};
 state.parking[state.parking.indexOf(null)]={id,filled:0};
 while(state.passengers.length){
  const slot=state.parking.findIndex(c=>c&&level.cars[c.id-1].skill===state.passengers[0]);
  if(slot<0)break;
  state.passengers.shift();
  if(++state.parking[slot].filled===2)state.parking[slot]=null;
 }
 assert.equal(state.passengers.length,2*state.yard.length+state.parking.reduce((n,c)=>n+(c?2-c.filled:0),0));
 return state;
}
const won=s=>!s.passengers.length&&!s.yard.length&&s.parking.every(c=>!c);
const key=s=>JSON.stringify([s.yard,s.passengers.length,s.parking]);
function replay(level,ids){return ids.reduce((s,id)=>release(level,s,id),start(level));}
function explore(level){
 const root=start(level),nodes=[{state:root,path:[],children:[]}],byKey=new Map([[key(root),0]]);
 for(let at=0;at<nodes.length;at++){
  const node=nodes[at];
  for(const id of exits(level,node.state)){
   const child=release(level,node.state,id),k=key(child);
   if(!byKey.has(k)){byKey.set(k,nodes.length);nodes.push({state:child,path:[...node.path,id],children:[]});}
   node.children.push(byKey.get(k));
  }
 }
 // Children have one fewer yard car, so evaluate the complete DAG bottom-up.
 for(const node of [...nodes].sort((a,b)=>a.state.yard.length-b.state.yard.length))node.canWin=won(node.state)||node.children.some(i=>nodes[i].canWin);
 return nodes;
}
function productionShape(level,s){
 return {yard:s.yard,cursor:level.queue.length-s.passengers.length,bay:s.parking.map(c=>c?{id:c.id,left:2-c.filled}:null),moves:level.cars.length-s.yard.length,status:won(s)?'won':s.parking.every(Boolean)?'lost':'playing'};
}

test('every shipped generator witness wins under a separate implementation of the rules',()=>{
 for(const level of LEVELS){
  assert.equal(new Set(level.witness).size,level.cars.length);
  const final=replay(level,level.witness);
  assert.equal(won(final),true,'Level '+(level.index+1));
 }
});

test('the queue formula works across rectangle sizes, seeds, parking sizes and wave lengths',()=>{
 for(const [cols,rows] of [[2,2],[5,6],[8,9],[12,12]])for(const seed of [0,30,97])for(const slots of [2,3,5])for(const wave of [1,slots]){
  const level=generatePuzzle(cols,rows,seed,{slots,wave});
  assert.equal(won(replay(level,level.witness)),true,JSON.stringify({cols,rows,seed,slots,wave}));
 }
});

test('level four has a thirty-release solution and every reachable certificate agrees with independent rules',()=>{
 const level=LEVELS[3],nodes=explore(level),winning=nodes.find(n=>won(n.state));
 assert.equal(nodes.length,343);assert.equal(nodes[0].canWin,true);assert.equal(winning.path.length,30);
 for(const node of nodes){
  const proof=inspectPosition(level,productionShape(level,node.state));
  assert.equal(proof.kind,won(node.state)?'won':node.canWin?'solvable':'dead-end');
 }
});

test('all three reachable identities matching the reported photo are dead ends, not impossible starting boards',()=>{
 const level=LEVELS[3],nodes=explore(level),pictured=[3,4,5,7,8,9,10,14,15,17,18,19,22,23,24];
 const matching=nodes.filter(({state:s})=>JSON.stringify(s.yard)===JSON.stringify(pictured)&&s.passengers.length===34&&s.parking.map(c=>c?level.cars[c.id-1].skill+':'+c.filled:'empty').join(',')==='inventory:0,picker:0,empty');
 // The photo cannot identify which of the identical purple/green cars parked.
 assert.equal(matching.length,3);
 for(const {state,canWin} of matching){
  assert.equal(canWin,false);assert.equal(state.passengers[0],'courier');assert.deepEqual(exits(level,state),[14]);
  const next=release(level,state,14);
  assert.equal(next.passengers[0],'support');assert.ok(next.parking.every(Boolean));
  assert.equal(next.parking[2].filled,1);assert.deepEqual(exits(level,next),[]);
 }
});
