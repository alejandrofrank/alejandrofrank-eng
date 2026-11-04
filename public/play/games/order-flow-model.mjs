// Original, deterministic browser puzzle. No network or agent runtime.
export const SKILLS = {
 picker: {name:'Picker',letter:'P',color:'#2f7c54',ink:'#fffdf4'},
 courier: {name:'Courier',letter:'C',color:'#3275ac',ink:'#fffdf4'},
 support: {name:'Support',letter:'S',color:'#af5822',ink:'#fffdf4'},
 inventory: {name:'Inventory',letter:'I',color:'#8059b3',ink:'#fffdf4'},
};
const bot=(skill,capacity,x,y,dir='up')=>({skill,capacity,x,y,dir});
const P=(n,x,y,d)=>bot('picker',n,x,y,d),C=(n,x,y,d)=>bot('courier',n,x,y,d),S=(n,x,y,d)=>bot('support',n,x,y,d),I=(n,x,y,d)=>bot('inventory',n,x,y,d);
const queue=(...groups)=>groups.flatMap(([skill,n])=>Array(n).fill(skill));
export const LEVELS = [
 {title:'After you',caption:'Clear the bot in front to open an exit.',slots:4,rows:2,par:3,bots:[P(3,1,1),C(2,1,0),S(2,2,1,'right')],queue:queue(['courier',2],['picker',3],['support',2]),agent:'fulfillment',note:'A dependent task waits until the earlier handoff is complete.'},
 {title:'Room for three',caption:'Keep a slot free for the skill needed next.',slots:3,rows:2,par:5,bots:[P(2,0,0),C(2,1,0),S(2,2,0),C(2,3,0),P(2,0,1,'down')],queue:queue(['picker',4],['courier',4],['support',2]),agent:'dispatcher',note:'Concurrency limits cap how many workers can hold active tasks at once.'},
 {title:'Two can do it',caption:'A big group needs more than one matching bot.',slots:4,rows:2,par:5,bots:[P(3,0,0),C(3,1,0),S(2,2,0),P(3,3,0),C(3,1,1,'down')],queue:queue(['picker',6],['courier',6],['support',2]),agent:'fulfillment',note:'More fulfillment workers can share a queue when demand grows.'},
 {title:'Park ahead',caption:'Park one bot early to free the one you need.',slots:4,rows:2,par:5,bots:[P(3,1,1),C(2,1,0),S(2,2,0),C(2,3,0),P(2,0,1,'left')],queue:queue(['picker',3],['support',2],['courier',4],['picker',2]),agent:'dispatcher',note:'Planning a handoff means reserving capacity before dependent work can start.'},
 {title:'Stock comes first',caption:'Let Inventory leave so the Courier can follow.',slots:4,rows:2,par:4,bots:[C(3,1,1),I(2,1,0),P(2,2,0),S(2,3,1,'down')],queue:queue(['inventory',2],['courier',3],['picker',2],['support',2]),agent:'inventory',note:'Inventory confirms available stock before downstream agents can use it.'},
 {title:'All together',caption:'Plan the exits, the slots and the next skill.',slots:5,rows:3,par:10,bots:[P(3,0,2),C(2,0,1),I(2,0,0),S(2,1,0),C(3,1,1),P(2,1,2),I(3,2,2,'right'),S(3,3,2,'down'),C(2,2,0),P(2,3,0)],queue:queue(['picker',3],['inventory',2],['courier',4],['support',2],['picker',4],['courier',3],['inventory',3],['support',3]),agent:'dispatcher',note:'The dispatcher coordinates queues, worker capacity and dependencies between agents.'},
].map((level,index)=>({...level,index,cols:4,bots:level.bots.map((b,i)=>({...b,id:i+1}))}));

export function initialState(level){return {yard:(1<<level.bots.length)-1,bay:Array(level.slots).fill(null),front:0,status:'playing'};}
export function copyState(s){return {...s,bay:s.bay.map(b=>b?{...b}:null)};}
export function inYard(s,id){return !!(s.yard&(1<<(id-1)));}
export function blocker(level,s,id){
 const b=level.bots[id-1];if(!b||!inYard(s,id))return null;
 const [dx,dy]=({up:[0,-1],right:[1,0],down:[0,1],left:[-1,0]})[b.dir];
 for(let x=b.x+dx,y=b.y+dy;x>=0&&x<level.cols&&y>=0&&y<level.rows;x+=dx,y+=dy){const other=level.bots.find(o=>o.x===x&&o.y===y&&inYard(s,o.id));if(other)return other.id;}
 return null;
}
export function legalMoves(level,s){return s.status==='playing'&&s.bay.includes(null)?level.bots.filter(b=>inYard(s,b.id)&&!blocker(level,s,b.id)).map(b=>b.id):[];}
export function move(level,previous,id,{trace=true}={}){
 if(previous.status!=='playing')return {state:previous,events:[],error:'Use Undo or Replay to try another order.'};
 if(!inYard(previous,id)||!level.bots[id-1])return {state:previous,events:[],error:'That bot has already left the yard.'};
 const blockedBy=blocker(level,previous,id);if(blockedBy)return {state:previous,events:[],blockedBy,error:'Bot '+blockedBy+' blocks this arrow. Move it first.'};
 const slot=previous.bay.indexOf(null);if(slot<0)return {state:previous,events:[],error:'The bay is full. Undo a move to make room.'};
 const state=copyState(previous),events=[];
 const record=(kind,botId,extra={})=>{if(trace)events.push({kind,id:botId,...extra,state:copyState(state)});};
 state.yard&=~(1<<(id-1));state.bay[slot]={id,remaining:level.bots[id-1].capacity};record('enter',id,{slot});
 while(state.front<level.queue.length){
  const at=state.bay.findIndex(b=>b&&level.bots[b.id-1].skill===level.queue[state.front]);if(at<0)break;
  const parked=state.bay[at];parked.remaining--;state.front++;record('serve',parked.id,{slot:at});
  if(parked.remaining===0){state.bay[at]=null;record('leave',parked.id,{slot:at});}
 }
 if(state.front===level.queue.length&&state.yard===0&&state.bay.every(b=>b===null))state.status='won';
 else if(state.bay.every(Boolean)&&!state.bay.some(b=>level.bots[b.id-1].skill===level.queue[state.front]))state.status='lost';
 record('settled',id);return {state,events,error:null};
}
export function rating(level,moves,undos){return moves<=level.par&&undos===0?3:undos<=2&&moves<=level.par+2?2:1;}
export function validateLevel(level){
 const cells=new Set();const totals=Object.fromEntries(Object.keys(SKILLS).map(s=>[s,0]));
 for(const b of level.bots){if(!SKILLS[b.skill]||![2,3,4].includes(b.capacity)||!['up','down','left','right'].includes(b.dir)||b.x<0||b.x>=level.cols||b.y<0||b.y>=level.rows||cells.has(b.x+','+b.y))throw Error('Invalid yard in '+level.title);cells.add(b.x+','+b.y);totals[b.skill]+=b.capacity;}
 for(const q of level.queue){if(!SKILLS[q])throw Error('Unknown skill');totals[q]--;}
 if(Object.values(totals).some(n=>n!==0))throw Error('Orders and bot capacities differ');
 return true;
}

// Breadth-first search explores actual legal turns, including premature parking.
// No hint or solution is baked into the model. The tests verify each authored par.
export function solve(level,start=initialState(level),limit=250000){
 const key=s=>s.front+'|'+s.yard+'|'+s.bay.map(b=>b?b.id+':'+b.remaining:'-').join(',');
 const nodes=[{state:copyState(start),parent:-1,id:null}],seen=new Set([key(start)]);let cursor=0;
 while(cursor<nodes.length){
  const index=cursor++,node=nodes[index];
  if(node.state.status==='won'){const path=[];for(let n=index;nodes[n].parent>=0;n=nodes[n].parent)path.push(nodes[n].id);return {moves:path.length,path:path.reverse(),visited:seen.size};}
  for(const id of legalMoves(level,node.state)){const next=move(level,node.state,id,{trace:false}).state;if(next.status==='lost')continue;const signature=key(next);if(seen.has(signature))continue;seen.add(signature);nodes.push({state:next,parent:index,id});if(nodes.length>limit)throw Error('Solver state limit exceeded');}
 }
 return null;
}
