// Packed yard + ordered passengers + bounded parking. Every car has two seats.
export const DIRECTIONS={up:[0,-1],right:[1,0],down:[0,1],left:[-1,0]};
export const SKILLS={picker:{name:'Picker',color:'#2f7c54'},courier:{name:'Courier',color:'#3275ac'},support:{name:'Support',color:'#ad501c'},inventory:{name:'Inventory',color:'#8059b3'}};
export function rayIds(level,car){
 const [dx,dy]=DIRECTIONS[car.dir],ids=[];
 for(let x=car.x+dx,y=car.y+dy;x>=0&&x<level.cols&&y>=0&&y<level.rows;x+=dx,y+=dy)ids.push(y*level.cols+x+1);
 return ids;
}
// Two separate lanes, each a snake that only points back along itself.
// Both heads can leave at once, so a level is a choice of lane rather than one corridor.
export function generateYard(cols,rows,seed){
 const bits=seed>>>0,skills=Object.keys(SKILLS),count=cols*rows;
 const vertical=(cols===rows?(bits&8)!==0:(bits&1)!==0),flip=(bits&2)!==0;
 const width=vertical?rows:cols,height=vertical?cols:rows,mid=Math.ceil(height/2);
 const snake=(y0,y1,down)=>{
  const ys=[];for(let y=y0;y<y1;y++)ys.push(y);if(!down)ys.reverse();
  const path=[];
  ys.forEach((y,i)=>{for(let k=0;k<width;k++){const x=(i%2?width-1-k:k);path.push(flip?{x:width-1-x,y}:{x,y});}});
  return path;
 };
 const mapped=p=>vertical?{x:p.y,y:p.x}:p;
 const paths=[snake(0,mid,true),snake(mid,height,false)].filter(p=>p.length).map(path=>path.map(mapped));
 const between=(a,b)=>b.x===a.x?(b.y<a.y?'up':'down'):b.x<a.x?'left':'right';
 const opposite={up:'down',down:'up',left:'right',right:'left'};
 const dirOf=Array(count+1),laneOf=Array(count+1),skillOf=Array(count+1);
 const shift=bits%4,palettes=[[skills[shift],skills[(shift+1)%4]],[skills[(shift+2)%4],skills[(shift+3)%4]]];
 paths.forEach((path,lane)=>{
  dirOf[path[0].y*cols+path[0].x+1]=opposite[between(path[0],path[1])];
  path.forEach((p,i)=>{
   const id=p.y*cols+p.x+1;laneOf[id]=lane;skillOf[id]=palettes[lane][i%2];
   if(i)dirOf[id]=between(p,path[i-1]);
  });
 });
 const index=paths.map(()=>0),witness=[];
 let turn=bits%paths.length;
 while(witness.length<cols*rows){
  let guard=0;while(index[turn]>=paths[turn].length&&++guard<=paths.length)turn=(turn+1)%paths.length;
  if(guard>paths.length)throw Error('No removable boundary cell');
  const p=paths[turn][index[turn]++];witness.push(p.y*cols+p.x+1);turn=(turn+1)%paths.length;
 }
 const cars=[];
 for(let id=1;id<=cols*rows;id++)cars.push({id,x:(id-1)%cols,y:Math.floor((id-1)/cols),dir:dirOf[id],capacity:2,skill:skillOf[id],lane:laneOf[id]});
 return {cars,witness,split:{axis:vertical?'col':'row',at:mid}};
}
const stages=[
 [4,4,67,'Find the opening','Two cars can leave. Match the front color.','fulfillment','A task can start only after its blockers finish.'],
 [4,5,15,'Across the grain','Send the color at the front. The other car can wait.','dispatcher','Dispatch coordinates the order of work across agents.'],
 [5,5,197,'Inside out','A clear arrow can leave. A blocked arrow has to wait.','inventory','Downstream work waits for inventory to confirm the stock.'],
 [5,6,30,'Side by side','Both open cars are real choices. The front color leaves at once.','fulfillment','A dependency can sit several steps ahead of a task.'],
 [6,6,139,'Open choice','Hold a car only while a parking space stays free.','dispatcher','The dispatcher must coordinate queued work with available agents.'],
 [6,7,194,'Crossed paths','Look at the front pair, then pick the matching car.','courier','A courier waits for the packed order before starting delivery.'],
 [7,7,147,'Deep in the yard','The open cars are the choice. Blocked arrows wait.','inventory','Completing one prerequisite can release several waiting tasks.'],
 [7,8,50,'Unravel it','Matching the front color clears that car at once.','fulfillment','Agents share completion signals so dependent work can proceed.'],
 [8,8,190,'A packed house','Use parking for a car you are not ready to board.','dispatcher','Coordination is about dependencies, not just individual decisions.'],
 [8,9,97,'Full yard','Both groups run to the end. Keep a space free.','dispatcher','The real system coordinates dependencies, queued tasks and limited agent capacity.'],
];
export function generatePuzzle(cols,rows,seed,{slots=3,wave=3}={}){
 if(!Number.isInteger(cols)||!Number.isInteger(rows)||cols<2||rows<2||cols>12||rows>12||!Number.isInteger(seed))throw Error('Use a 2–12 by 2–12 grid and an integer seed');
 if(!Number.isInteger(slots)||slots<2||slots>5||!Number.isInteger(wave)||wave<1||wave>slots)throw Error('Passenger waves must fit the parking bay');
 const yard=generateYard(cols,rows,seed),queue=[];
 // Each witness car meets the next two passengers of its own color and leaves.
 // `wave` stays in the signature so older callers still validate, but it no longer
 // batches several cars into one automatic boarding run.
 for(const id of yard.witness){const skill=yard.cars[id-1].skill;queue.push(skill,skill);}
 return {cols,rows,seed,slots,wave,queue,...yard};
}
export const LEVELS=stages.map(([cols,rows,seed,title,caption,agent,note],index)=>({id:'boarding-'+(index+1),index,title,caption,agent,note,...generatePuzzle(cols,rows,seed,{wave:1})}));
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
