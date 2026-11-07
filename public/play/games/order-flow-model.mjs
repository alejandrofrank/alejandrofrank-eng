// Packed yard + ordered passengers + bounded parking. Every car has two seats.
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
 [6,6,139,'Long chain','Each opening reveals another dependency.','dispatcher','The dispatcher must coordinate queued work with available agents.'],
 [6,7,194,'Crossed paths','Look beyond the car beside you.','courier','A courier waits for the packed order before starting delivery.'],
 [7,7,147,'Deep in the yard','Work from the clear edges toward the centre.','inventory','Completing one prerequisite can release several waiting tasks.'],
 [7,8,50,'Unravel it','Trace the chain before choosing a car.','fulfillment','Agents share completion signals so dependent work can proceed.'],
 [8,8,190,'A packed house','Find the next opening in the full grid.','dispatcher','Coordination is about dependencies, not just individual decisions.'],
 [8,9,97,'The whole chain','Clear all 72 cars, one dependency at a time.','dispatcher','The real system coordinates dependencies, queued tasks and limited agent capacity.'],
];
export function generatePuzzle(cols,rows,seed,{slots=3,wave=3}={}){
 if(!Number.isInteger(cols)||!Number.isInteger(rows)||cols<2||rows<2||cols>12||rows>12||!Number.isInteger(seed))throw Error('Use a 2–12 by 2–12 grid and an integer seed');
 if(!Number.isInteger(slots)||slots<2||slots>5||!Number.isInteger(wave)||wave<1||wave>slots)throw Error('Passenger waves must fit the parking bay');
 const yard=generateYard(cols,rows,seed),queue=[];
 // Reverse each short group of the clearing witness, then repeat its colors.
 // Cars must wait for one another, but the witness never needs > slots spaces.
 // Each group consumes exactly its own two seats per car before the next group.
 for(let i=0;i<yard.witness.length;i+=wave){
  const colors=yard.witness.slice(i,i+wave).reverse().map(id=>yard.cars[id-1].skill);
  queue.push(...colors,...colors);
 }
 return {cols,rows,seed,slots,wave,queue,...yard};
}
export const LEVELS=stages.map(([cols,rows,seed,title,caption,agent,note],index)=>({id:'boarding-'+(index+1),index,title,caption:index?'Clear the path. Keep room for the next color.':'Match the front passenger. Each car seats two.',agent,note,...generatePuzzle(cols,rows,seed,{wave:index?3:2})}));
export const initialState=level=>({yard:level.cars.map(c=>c.id),bay:Array(level.slots).fill(null),cursor:0,moves:0,status:'playing'});
export const copyState=s=>({...s,yard:[...s.yard],bay:s.bay.map(c=>c?{...c}:null)});
export const inYard=(s,id)=>s.yard.includes(id);
export function blocker(level,s,id){
 const car=level.cars[id-1];if(!car||!inYard(s,id))return null;
 return rayIds(level,car).find(n=>inYard(s,n))??null;
}
export function legalMoves(level,s){return s.status==='playing'&&s.bay.includes(null)?s.yard.filter(id=>blocker(level,s,id)===null):[];}
export function move(level,previous,id){
 if(previous.status!=='playing'||!inYard(previous,id))return {state:previous,error:'That car has already left.'};
 const by=blocker(level,previous,id);
 if(by!==null)return {state:previous,blockedBy:by,error:'Its arrow hits another car. Clear the highlighted car first.'};
 const slot=previous.bay.indexOf(null);
 if(slot<0)return {state:previous,error:'Every parking space is occupied.'};
 const state=copyState(previous),events=[{type:'park',id,slot}];
 state.yard=state.yard.filter(n=>n!==id);state.moves++;state.bay[slot]={id,left:2};
 while(state.cursor<level.queue.length){
  const skill=level.queue[state.cursor],seat=state.bay.findIndex(c=>c&&level.cars[c.id-1].skill===skill);
  if(seat<0)break;
  const car=state.bay[seat];car.left--;
  events.push({type:'board',id:car.id,slot:seat,skill,left:car.left,cursor:state.cursor++});
  if(!car.left){events.push({type:'depart',id:car.id,slot:seat});state.bay[seat]=null;}
 }
 if(state.cursor===level.queue.length&&!state.yard.length&&state.bay.every(c=>!c))state.status='won';
 else if(state.bay.every(Boolean))state.status='lost';
 return {state,error:null,events};
}
export function validateLevel(level){
 if(!Number.isInteger(level.cols)||!Number.isInteger(level.rows)||level.cols<2||level.rows<2||level.cars.length!==level.cols*level.rows)throw Error('The yard must start completely packed');
 for(const [i,c] of level.cars.entries())if(c.id!==i+1||c.x!==i%level.cols||c.y!==Math.floor(i/level.cols)||!DIRECTIONS[c.dir]||c.capacity!==2||!SKILLS[c.skill])throw Error('Invalid two-seat car');
 if(!Number.isInteger(level.slots)||level.slots<2||level.slots>5||level.queue.length!==2*level.cars.length||level.queue.some(skill=>!SKILLS[skill]))throw Error('Invalid passenger queue or parking bay');
 for(const skill of Object.keys(SKILLS))if(level.queue.filter(s=>s===skill).length!==2*level.cars.filter(c=>c.skill===skill).length)throw Error('Passenger colors must match seat supply');
 let s=initialState(level);
 for(const id of level.witness){const result=move(level,s,id);if(result.error)throw Error('Invalid clearing witness');s=result.state;}
 if(s.status!=='won'||level.witness.length!==level.cars.length)throw Error('Incomplete clearing witness');
 return true;
}
export function stateKey(s){
 let mask=0n;for(const id of s.yard)mask|=1n<<BigInt(id-1);
 return mask.toString(36)+'|'+s.cursor.toString(36)+'|'+s.bay.map(c=>c?(c.id*2+c.left-1).toString(36):'-').join('.');
}
// DFS with memoization is exact (all actions remove one yard car). A cap throws,
// never converts an unfinished search to "unsolvable". Browser input uses the
// generated full-state certificate instead.
export function solve(level,start=initialState(level),limit=250000){
 const failed=new Set();let visited=0;
 const visit=s=>{
  if(s.status==='won')return [];
  if(s.status==='lost')return null;
  const key=stateKey(s);if(failed.has(key))return null;
  if(++visited>limit)throw Error('Solver limit exceeded');
  const rank=new Map(level.witness.map((id,i)=>[id,i]));
  for(const id of legalMoves(level,s).sort((a,b)=>rank.get(a)-rank.get(b))){
   const rest=visit(move(level,s,id).state);if(rest)return [id,...rest];
  }
  failed.add(key);return null;
 };
 const path=visit(start);return path?{moves:path.length,path,visited}:null;
}
// Independent BFS for tests; never runs on the browser input thread.
export function solveBFS(level,start=initialState(level),limit=250000){
 const nodes=[{state:copyState(start),parent:-1,id:null}],seen=new Set([stateKey(start)]);
 for(let i=0;i<nodes.length;i++){
  const node=nodes[i];
  if(node.state.status==='won'){const path=[];for(let n=i;nodes[n].parent>=0;n=nodes[n].parent)path.push(nodes[n].id);return {moves:path.length,path:path.reverse(),visited:seen.size};}
  for(const id of legalMoves(level,node.state)){
   const state=move(level,node.state,id).state,key=stateKey(state);
   if(seen.has(key))continue;seen.add(key);nodes.push({state,parent:i,id});
   if(nodes.length>limit)throw Error('BFS limit exceeded');
  }
 }
 return null;
}
export function rating({mistakes,undos,hints}){return undos||mistakes>2||hints>1?1:mistakes||hints?2:3;}
