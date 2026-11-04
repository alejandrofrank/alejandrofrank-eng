// Original browser puzzle: deterministic coordination, no network or agent runtime.
export const SKILLS = {
 picker:{name:'Picker',letter:'P',color:'#2f7c54'},
 courier:{name:'Courier',letter:'C',color:'#3275ac'},
 support:{name:'Support',letter:'S',color:'#ad501c'},
 inventory:{name:'Inventory',letter:'I',color:'#8059b3'},
 memory:{name:'Memory',letter:'M',color:'#8c4166'},
};
const bot=(skill,capacity,x,y,dir='up',lock=null)=>({skill,capacity,x,y,dir,lock});
const P=(n,x,y,d,l)=>bot('picker',n,x,y,d,l),C=(n,x,y,d,l)=>bot('courier',n,x,y,d,l),
 S=(n,x,y,d,l)=>bot('support',n,x,y,d,l),I=(n,x,y,d,l)=>bot('inventory',n,x,y,d,l),M=(x,y,d)=>bot('memory',0,x,y,d);
const q=(...groups)=>groups.flatMap(([skill,n,retry=false])=>Array.from({length:n},()=>({skill,retry})));
export const LEVELS = [
 {title:'Front first',caption:'Match the front. Full bots leave.',slots:3,rows:2,par:2,budget:4,bots:[P(2,1,0),S(2,2,0)],queue:q(['picker',2],['support',2]),agent:'fulfillment',note:'Fulfillment takes reserved work from a queue and signals when it is ready.'},
 {title:'After you',caption:'Clear the blocker first.',slots:3,rows:2,par:3,budget:5,bots:[P(3,1,1),C(2,1,0),S(2,2,1,'right')],queue:q(['courier',2],['picker',3],['support',2]),agent:'fulfillment',note:'A dependent task waits for the earlier handoff to finish.'},
 {title:'One spare slot',caption:'Keep room for the bot you need.',slots:2,rows:2,par:3,budget:5,bots:[S(2,0,0),C(2,2,0),P(3,2,1)],queue:q(['picker',3],['courier',2],['support',2]),agent:'dispatcher',note:'Concurrency limits leave only a bounded number of tasks active at once.'},
 {title:'Pass the bag',caption:'Collect bags before the fifth arrives.',slots:3,rows:2,par:4,budget:6,handoff:true,bots:[P(3,0,0),P(3,1,0),C(3,2,0),C(3,3,0)],queue:q(['picker',6]),agent:'courier',note:'Packed baskets pass from fulfillment to dispatch and courier work; a bounded queue applies backpressure.'},
 {title:'A narrow handoff',caption:'Free Support. Keep bags moving.',slots:2,rows:2,par:5,budget:7,handoff:true,bots:[C(4,0,0),C(2,2,0),S(2,2,1),P(3,1,0),P(3,3,0)],queue:q(['support',2],['picker',6]),agent:'dispatcher',note:'The dispatcher waits for ready work while keeping worker capacity available for dependencies.'},
 {title:'Room to remember',caption:'See more orders, but give up a slot.',slots:2,rows:3,par:5,budget:7,limited:true,bots:[C(2,0,0),M(2,0),S(2,2,1),P(3,2,2)],queue:q(['picker',3],['courier',2],['support',2]),agent:'dispatcher',part:'memory',note:'Real agents recall scoped, bounded observations; the Memory bot is a puzzle stand-in, not a separate production role.'},
 {title:'Wait for the signal',caption:'Finish one skill to unlock the next.',slots:2,rows:2,par:4,budget:6,bots:[C(2,0,0),S(2,2,0),I(2,2,1),P(3,3,0,'up','inventory')],queue:q(['inventory',2],['picker',3],['support',2],['courier',2]),agent:'inventory',note:'Inventory confirms reserved stock before downstream work can proceed.'},
 {title:'Once more',caption:'Striped orders return once. Plan room.',slots:3,rows:2,par:4,budget:6,bots:[P(3,0,0),C(2,1,0),I(2,2,0),S(2,2,1)],queue:q(['picker',1,true],['picker',1],['support',2],['inventory',2],['courier',2]),agent:'fulfillment',note:'The real queue delivers at least once; idempotent effects keep a retried event from picking the same basket twice.'},
 {title:'Read, unlock, hand off',caption:'Preview, unlock, then pass the bags.',slots:3,rows:2,par:8,budget:10,handoff:true,limited:true,bots:[S(2,0,0),M(1,0),I(2,1,1),P(3,2,0,'up','inventory'),P(3,3,0,'up','inventory'),C(3,2,1,'down'),C(3,3,1,'down')],queue:q(['inventory',2],['picker',6],['support',2]),agent:'dispatcher',note:'Coordination combines scoped memory, completed handoffs and bounded queues rather than independent guesses.'},
 {title:'Every slot counts',caption:'Two belts. One retry. Eleven moves.',slots:3,rows:3,par:10,budget:11,handoff:true,limited:true,bots:[C(2,0,0),M(1,0),I(2,1,1),P(3,2,0,'up','inventory'),P(3,3,0,'up','inventory'),P(3,3,1,'right','inventory'),C(3,2,2,'down'),C(3,1,2,'right'),S(2,0,2,'right')],queue:q(['inventory',2],['picker',1,true],['picker',7],['support',2]),agent:'dispatcher',note:'The system bounds work, retries and memory while agents coordinate; retries repeat handling, not committed delivery effects.'},
].map((l,index)=>({...l,index,id:'coordination-'+(index+1),cols:4,bagLimit:4,handoff:false,limited:false,...l,bots:l.bots.map((b,i)=>({...b,id:i+1})),queue:l.queue.map((o,i)=>({...o,id:i+1}))}));

export function initialState(l){return {yard:(1<<l.bots.length)-1,bay:Array(l.slots).fill(null),queue:l.queue.map(o=>({...o})),bags:[],departed:[],moves:0,served:0,status:'playing',cause:null};}
export function copyState(s){return {...s,bay:s.bay.map(b=>b?{...b}:null),queue:s.queue.map(o=>({...o})),bags:[...s.bags],departed:[...s.departed]};}
export function inYard(s,id){return !!(s.yard&(1<<(id-1)));}
export function blocker(l,s,id){
 const b=l.bots[id-1];if(!b||!inYard(s,id))return null;
 const [dx,dy]=({up:[0,-1],right:[1,0],down:[0,1],left:[-1,0]})[b.dir];
 for(let x=b.x+dx,y=b.y+dy;x>=0&&x<l.cols&&y>=0&&y<l.rows;x+=dx,y+=dy){const other=l.bots.find(o=>o.x===x&&o.y===y&&inYard(s,o.id));if(other)return other.id;}
 return null;
}
export function locked(l,s,id){const lock=l.bots[id-1]?.lock;return !!lock&&!s.departed.includes(lock);}
export function memoryParked(l,s){return s.bay.some(b=>b&&l.bots[b.id-1].skill==='memory');}
export function visibleOrders(l,s){return s.queue.slice(0,l.limited?(memoryParked(l,s)?8:4):s.queue.length);}
export function legalMoves(l,s){
 if(s.status!=='playing')return [];
 return l.bots.filter(b=>s.bay.some(p=>p?.id===b.id)&&b.skill==='memory'||s.bay.includes(null)&&inYard(s,b.id)&&!blocker(l,s,b.id)&&!locked(l,s,b.id)).map(b=>b.id);
}
const loss=(s,cause)=>{s.status='lost';s.cause=cause;};
export function lossInfo(l,s){
 if(s.cause==='overflow')return {title:'Courier belt overflow',text:'A fifth bag arrived before a Courier could collect it. Ready a Courier earlier.',area:'handoff'};
 if(s.cause==='moves')return {title:'Out of moves',text:'This attempt passed the '+l.budget+'-move budget. Retry with a shorter plan.',area:'moves'};
 return {title:'Out of slots',text:'The bay is full, but none of these bots can serve the front order. Undo and free the needed skill first.',area:'bay'};
}
export function move(l,previous,id,{trace=true}={}){
 const b=l.bots[id-1];if(!b||previous.status!=='playing')return {state:previous,events:[],error:'Retry or Undo to try another plan.'};
 const memorySlot=b.skill==='memory'?previous.bay.findIndex(p=>p?.id===id):-1;
 if(memorySlot<0){
  if(!inYard(previous,id))return {state:previous,events:[],error:'That bot has left the yard.'};
  const by=blocker(l,previous,id);if(by)return {state:previous,events:[],blockedBy:by,error:'Bot '+by+' blocks this arrow. Move it first.'};
  if(locked(l,previous,id))return {state:previous,events:[],error:'Locked: a '+SKILLS[b.lock].name+' must finish and leave first.'};
  if(!previous.bay.includes(null))return {state:previous,events:[],error:'Release Memory or Undo to make a slot.'};
 }
 const s=copyState(previous),events=[];s.moves++;
 const record=(kind,botId,extra={})=>{if(trace)events.push({kind,id:botId,...extra,state:copyState(s)});};
 if(s.moves>l.budget){loss(s,'moves');record('settled',id);return {state:s,events,error:null};}
 if(memorySlot>=0){s.bay[memorySlot]=null;s.departed.push('memory');record('release',id,{slot:memorySlot});}
 else{const slot=s.bay.indexOf(null);s.yard&=~(1<<(id-1));s.bay[slot]={id,remaining:b.capacity};record('enter',id,{slot});}
 const consume=(slot,source)=>{
  const parked=s.bay[slot],bot=l.bots[parked.id-1],order=source==='bags'?s.bags.shift():s.queue.shift();
  parked.remaining--;s.served++;
  let retry=false,produced=false;
  if(source==='queue'){
   if(order.retry){s.queue.push({...order,retry:false});retry=true;}
   else if(l.handoff&&bot.skill==='picker'){s.bags.push(order.id);produced=true;}
  }
  const finished=parked.remaining===0,id=parked.id;
  if(finished){s.bay[slot]=null;if(!s.departed.includes(bot.skill))s.departed.push(bot.skill);}
  if(s.bags.length>l.bagLimit)loss(s,'overflow');
  record('serve',id,{slot,source,retry,produced,finished});
 };
 while(s.status==='playing'){
  const courier=l.handoff&&s.bags.length?s.bay.findIndex(p=>p&&l.bots[p.id-1].skill==='courier'):-1;
  if(courier>=0){consume(courier,'bags');continue;}
  const skill=s.queue[0]?.skill,worker=skill?s.bay.findIndex(p=>p&&l.bots[p.id-1].skill===skill&&skill!=='memory'):-1;
  if(worker<0)break;consume(worker,'queue');
 }
 if(s.status==='playing'){
  if(!s.queue.length&&!s.bags.length&&s.yard===0&&s.bay.every(p=>!p))s.status='won';
  else if(s.bay.every(Boolean)&&!memoryParked(l,s))loss(s,'slots');
 }
 record('settled',id);return {state:s,events,error:null};
}
export function rating(l,moves,undos){return undos>0?1:moves===l.par?3:2;}
export function validateLevel(l){
 if(![2,3].includes(l.slots)||l.par>l.budget)throw Error('Invalid bay or budget');
 const totals=Object.fromEntries(Object.keys(SKILLS).map(k=>[k,0])),cells=new Set();
 for(const b of l.bots){
  if(!SKILLS[b.skill]||(b.skill==='memory'?b.capacity!==0:![2,3,4].includes(b.capacity))||!['up','right','down','left'].includes(b.dir)||b.x<0||b.x>=l.cols||b.y<0||b.y>=l.rows||cells.has(b.x+','+b.y)||b.lock&&!SKILLS[b.lock])throw Error('Invalid bot in '+l.title);
  cells.add(b.x+','+b.y);totals[b.skill]+=b.capacity;
 }
 for(const o of l.queue){if(!SKILLS[o.skill]||o.skill==='memory'||l.handoff&&o.skill==='courier')throw Error('Invalid order');totals[o.skill]-=1+Number(o.retry);if(l.handoff&&o.skill==='picker')totals.courier--;}
 if(Object.values(totals).some(n=>n!==0))throw Error('Capacity differs from work in '+l.title);
 return true;
}
export function solve(l,start=initialState(l),limit=250000){
 const key=s=>s.yard+'|'+s.bay.map(b=>b?b.id+':'+b.remaining:'-').join(',')+'|'+s.queue.map(o=>o.id+(o.retry?'r':'')).join(',')+'|'+s.bags.join(',')+'|'+[...s.departed].sort().join(',');
 const nodes=[{state:copyState(start),parent:-1,id:null}],seen=new Set([key(start)]);
 for(let cursor=0;cursor<nodes.length;cursor++){
  const node=nodes[cursor];if(node.state.status==='won'){const path=[];for(let n=cursor;nodes[n].parent>=0;n=nodes[n].parent)path.push(nodes[n].id);return {moves:path.length,path:path.reverse(),visited:seen.size};}
  for(const id of legalMoves(l,node.state)){const state=move(l,node.state,id,{trace:false}).state;if(state.status==='lost')continue;const k=key(state);if(seen.has(k))continue;seen.add(k);nodes.push({state,parent:cursor,id});if(nodes.length>limit)throw Error('BFS state limit exceeded');}
 }
 return null;
}
// Deterministic baseline: front skill first, otherwise the first clear yard bot,
// in authored reading order. Release Memory only when no yard move is available.
export function greedy(l){
 let state=initialState(l);const path=[];
 for(let n=0;n<50&&state.status==='playing';n++){
  const choices=legalMoves(l,state),yard=choices.filter(id=>inYard(state,id));
  const id=yard.find(id=>l.bots[id-1].skill===state.queue[0]?.skill)??yard[0]??choices[0];
  if(id===undefined)break;path.push(id);state=move(l,state,id,{trace:false}).state;
 }
 return {state,path};
}

