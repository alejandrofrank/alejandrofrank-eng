// Packed-yard rules. A car leaves only when its complete arrow ray is clear.
export const DIRECTIONS={up:[0,-1],right:[1,0],down:[0,1],left:[-1,0]};
export const SKILLS={picker:{name:'Picker',color:'#2f7c54'},courier:{name:'Courier',color:'#3275ac'},support:{name:'Support',color:'#ad501c'},inventory:{name:'Inventory',color:'#8059b3'}};
export function rayIds(level,car){
 const [dx,dy]=DIRECTIONS[car.dir],ids=[];
 for(let x=car.x+dx,y=car.y+dy;x>=0&&x<level.cols&&y>=0&&y<level.rows;x+=dx,y+=dy)ids.push(y*level.cols+x+1);
 return ids;
}
// A forward peel supplies a witness. Arrows preferentially point through cells
// removed earlier, producing dependencies instead of only outward-facing edges.
export function generateYard(cols,rows,seed){
 let random=seed>>>0;
 const rng=()=>{random=(Math.imul(random,1664525)+1013904223)>>>0;return random/4294967296;};
 const remaining=new Set(Array.from({length:cols*rows},(_,i)=>i+1)),cars=[],witness=[];
 while(remaining.size){
  let best=null;
  for(const id of remaining)for(const dir of Object.keys(DIRECTIONS)){
   const car={id,x:(id-1)%cols,y:Math.floor((id-1)/cols),dir},ray=rayIds({cols,rows},car);
   if(ray.some(n=>remaining.has(n)))continue;
   const score=ray.length+rng();
   if(!best||score>best.score)best={car,score};
  }
  if(!best)throw Error('No removable boundary cell');
  remaining.delete(best.car.id);witness.push(best.car.id);cars.push(best.car);
 }
 const skills=Object.keys(SKILLS);
 return {cars:cars.sort((a,b)=>a.id-b.id).map(c=>({...c,capacity:2,skill:skills[(c.x+2*c.y+seed)%skills.length]})),witness};
}
const stages=[
 [4,4,67,'Find the opening','Trace an arrow all the way to the edge.','fulfillment','A task can start only after its blockers finish.'],
 [4,5,15,'Across the grain','Clear a row to open the next direction.','dispatcher','Dispatch coordinates the order of work across agents.'],
 [5,5,197,'Inside out','The middle opens through the outside.','inventory','Downstream work waits for inventory to confirm the stock.'],
 [5,6,30,'One way through','Follow each arrow through the whole row.','fulfillment','A dependency can sit several steps ahead of a task.'],
 [6,6,139,'Long chain','Each opening reveals another dependency.','dispatcher','The controller advances work when the required earlier task finishes.'],
 [6,7,194,'Crossed paths','Look beyond the car beside you.','courier','A courier waits for the packed order before starting delivery.'],
 [7,7,147,'Deep in the yard','Work from the clear edges toward the centre.','inventory','Completing one prerequisite can release several waiting tasks.'],
 [7,8,50,'Unravel it','Trace the chain before choosing a car.','fulfillment','Agents share completion signals so dependent work can proceed.'],
 [8,8,190,'A packed house','Find the next opening in the full grid.','dispatcher','Coordination is about dependencies, not just individual decisions.'],
 [8,9,97,'The whole chain','Clear all 72 cars, one dependency at a time.','dispatcher','The real system coordinates queued tasks; this puzzle illustrates only their ordering.'],
];
export const LEVELS=stages.map(([cols,rows,seed,title,caption,agent,note],index)=>({id:'packed-'+(index+1),index,cols,rows,seed,title,caption,agent,note,...generateYard(cols,rows,seed)}));
export const initialState=level=>({yard:level.cars.map(c=>c.id),moves:0,status:'playing'});
export const copyState=s=>({...s,yard:[...s.yard]});
export const inYard=(s,id)=>s.yard.includes(id);
export function blocker(level,s,id){
 const car=level.cars[id-1];if(!car||!inYard(s,id))return null;
 return rayIds(level,car).find(n=>inYard(s,n))??null;
}
export function legalMoves(level,s){return s.status==='playing'?s.yard.filter(id=>blocker(level,s,id)===null):[];}
export function move(level,previous,id){
 if(previous.status!=='playing'||!inYard(previous,id))return {state:previous,error:'That car has already left.'};
 const by=blocker(level,previous,id);
 if(by!==null)return {state:previous,blockedBy:by,error:'Its arrow hits another car. Clear the highlighted car first.'};
 const yard=previous.yard.filter(n=>n!==id);
 return {state:{yard,moves:previous.moves+1,status:yard.length?'playing':'won'},error:null};
}
export function validateLevel(level){
 if(!Number.isInteger(level.cols)||!Number.isInteger(level.rows)||level.cols<2||level.rows<2||level.cars.length!==level.cols*level.rows)throw Error('The yard must start completely packed');
 for(const [i,c] of level.cars.entries())if(c.id!==i+1||c.x!==i%level.cols||c.y!==Math.floor(i/level.cols)||!DIRECTIONS[c.dir]||c.capacity!==2||!SKILLS[c.skill])throw Error('Invalid two-seat car');
 let s=initialState(level);
 for(const id of level.witness){const result=move(level,s,id);if(result.error)throw Error('Invalid clearing witness');s=result.state;}
 if(s.status!=='won'||level.witness.length!==level.cars.length)throw Error('Incomplete clearing witness');
 return true;
}
// Exact topological solver: removing N cars needs at least N moves. A clearing
// path of that length proves the minimum without exploring every permutation.
export function solve(level,start=initialState(level)){
 let s=copyState(start);const path=[];
 while(s.yard.length){const id=legalMoves(level,s)[0];if(id===undefined)return null;path.push(id);s=move(level,s,id).state;}
 return {moves:path.length,path};
}
// Independent BFS for tests; never runs on the browser input thread.
export function solveBFS(level,start=initialState(level),limit=250000){
 const nodes=[{state:copyState(start),parent:-1,id:null}],seen=new Set([start.yard.join(',')]);
 for(let i=0;i<nodes.length;i++){
  const node=nodes[i];
  if(!node.state.yard.length){const path=[];for(let n=i;nodes[n].parent>=0;n=nodes[n].parent)path.push(nodes[n].id);return {moves:path.length,path:path.reverse(),visited:seen.size};}
  for(const id of legalMoves(level,node.state)){
   const state=move(level,node.state,id).state,key=state.yard.join(',');
   if(seen.has(key))continue;seen.add(key);nodes.push({state,parent:i,id});
   if(nodes.length>limit)throw Error('BFS limit exceeded');
  }
 }
 return null;
}
export function rating({mistakes,undos,hints}){return undos||mistakes>2||hints>1?1:mistakes||hints?2:3;}
