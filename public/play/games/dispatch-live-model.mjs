// Original browser game. Synthetic orders, no network or Python agent execution.
export const QUEUES = ['normal', 'urgent', 'problem'];
export const STORES = [{id:'sol',name:'Sol',x:29,y:55},{id:'chamberi',name:'Chamberí',x:46,y:23},{id:'retiro',name:'Retiro',x:77,y:58}];
export const ROUNDS = [
 {title:'Find a free lane',brief:'Tap a pin, then a lane. Short timers need the fast lane.',count:15,agent:'dispatcher',note:'The dispatcher routes work using deadlines and available capacity.'},
 {title:'Move the team',brief:'Tap a bot, then another lane. Follow the lunch rush.',count:19,agent:'dispatcher',note:'The dispatcher moves available capacity toward the queue that needs it.'},
 {title:'One bag. One owner.',brief:'Keep routing. Stamp Claim before retries reach the shelves.',count:17,agent:'fulfillment',note:'Fulfillment records an owner so a retried request cannot pick the same bag twice.'},
 {title:'Tell the next bot',brief:'Sol runs out of milk. Pin the stock note while you route.',count:17,agent:'inventory',note:'Inventory shares fresh stock facts so the next agent avoids an empty shelf.'},
 {title:'Madrid, all at once',brief:'Pin new facts. Send the changed address to a human.',count:19,agent:'customer_service',note:'Customer service confirms uncertain changes while the dispatcher replans.'},
];
export const DURATION = 50;
function random(seed){let n=seed>>>0;return()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);}
export function makeOrders(round,seed=17){
 const rng=random(seed),count=ROUNDS[round].count;
 return Array.from({length:count},(_,i)=>{
  const arrival=i===0?0: +(1.4+(i-1)*(37/(count-2))).toFixed(2);
  const urgent=round===1?(i>=3&&i<=11):i%4===1||i%7===5,problem=i>2&&i%7===3;
  const kind=problem?'problem':urgent?'cold':'grocery',window=problem?17:urgent?9:19,slot=(i*5+Math.floor(rng()*3))%12;
  return {id:i+1,arrival,due:arrival+window,window,kind,slot,store:i%3===0?'sol':STORES[i%3].id,milk:round>=3&&i%3===0,status:'future',lane:null,late:false,delivered:false,failures:[],needsHuman:false,confirmed:false,escalated:false,version:0};
 });
}
export function createShift(round=0,carry={},seed=17){
 if(!ROUNDS[round])throw new RangeError('Unknown round');
 const budget=round===0?4:6,defaults=round===0?['normal','urgent','urgent','problem']:['normal','normal','normal','normal','urgent','problem'];
 const lanes=Array.isArray(carry.lanes)?carry.lanes:defaults;
 const workers=Array.from({length:budget},(_,i)=>({id:i+1,lane:QUEUES.includes(lanes[i])?lanes[i]:defaults[i],job:null,offline:false,x:46+i*2,y:90}));
 const state={round,time:0,duration:DURATION,orders:makeOrders(round,seed),workers,queues:{normal:[],urgent:[],problem:[]},claims:round>=2&&!!carry.claims,notes:[],rain:false,stockOut:false,events:[],failures:[],score:{onTime:0,late:0,wasted:0,escalations:0},finished:false,result:null,actions:0};
 const fired=new Set();let serial=0;
 const order=id=>state.orders.find(o=>o.id===Number(id));
 function event(kind,text,o=null,extra={}){const e={id:++serial,time:state.time,kind,text,order:o?.id??null,lane:o?.lane??null,...extra};state.events.push(e);return e;}
 function fail(o,kind,text,extra={}){o?.failures.push(kind);const e=event('failure',text,o,{cause:kind,...extra});state.failures.push(e);return e;}
 function addNote(id,text){state.notes.push({id,text,pinned:false});event('note',text,null,{note:id});}
 function pinned(id){return state.notes.some(n=>n.id===id&&n.pinned);}
 function late(o){if(o.late||o.delivered)return;o.late=true;state.score.late++;fail(o,'late',o.status==='new'?'This order waited on the map too long. Tap its pin, then a free lane.':o.kind==='cold'&&o.lane==='normal'?'The cold bag missed its short deadline in Normal. Use Urgent for short timers.':'This lane backed up. Move a bot here or use a lane with spare capacity.',{rule:'lane',delta:'late'});}
 function target(o){return {x:12+(o.slot%4)*25,y:13+Math.floor(o.slot/4)*29};}
 function storeFor(o){return STORES.find(s=>s.id===(state.stockOut&&o.milk&&pinned('milk')?'chamberi':o.store));}
 function queue(o,retry=false){state.queues[o.lane].push({orderId:o.id,retry});if(!retry)o.status='queued';}
 function route(id,lane){
  const o=order(id);if(state.finished||!o||o.status!=='new'||!QUEUES.includes(lane))return false;
  o.lane=lane;queue(o);state.actions++;event('route','Order '+o.id+' enters '+lane+'.',o);return true;
 }
 function moveBot(id,lane){
  const w=workers.find(w=>w.id===Number(id));if(state.finished||round<1||!w||w.offline||!QUEUES.includes(lane)||w.lane===lane)return false;
  w.lane=lane;state.actions++;event('capacity','Bot '+w.id+' joins '+lane+(w.job?' after its current bag.':'.'),null,{lane});return true;
 }
 function claiming(){
  if(state.finished||round<2||state.claims)return false;state.claims=true;state.actions++;
  for(const lane of QUEUES)state.queues[lane]=state.queues[lane].filter(t=>!t.retry);
  for(const w of workers)if(w.job?.retry){w.job=null;event('safe','Claim found: the second picker turns back.');}
  event('claim','Claim stamp on. Every bag has one owner.');return true;
 }
 function pin(id){
  const n=state.notes.find(n=>n.id===id);if(state.finished||!n||n.pinned)return false;n.pinned=true;state.actions++;
  if(id==='milk')for(const w of workers){const j=w.job,o=j&&order(j.orderId);if(j?.phase==='pick'&&o.milk&&j.to.id==='sol'){j.from=workerPosition(w);j.to={...STORES[1]};j.elapsed=0;j.duration=2;}}
  if(id==='offline')for(const w of workers){if(!w.offline||!w.job)continue;const o=order(w.job.orderId);w.job=null;if(!o.delivered){queue(o);event('handoff','Another bot can take the abandoned bag.',o);}}
  event('memory','Pinned: '+n.text,null,{note:id});return true;
 }
 function escalate(id){
  const o=order(id);if(state.finished||round<4||!o||o.status==='future'||o.delivered||o.escalated)return false;
  o.escalated=true;o.confirmed=true;state.score.escalations++;state.actions++;
  if(o.needsHuman){o.needsHuman=false;for(const w of workers)if(w.job?.orderId===o.id){w.job.version=o.version;w.job.to=target(o);w.job.elapsed=0;w.job.duration=2;}}
  else o.due-=2;
  event('human',o.version?'Human confirms the new address. The courier turns toward it.':'A human checked an order that needed no confirmation.',o,{delta:'escalations'});return true;
 }
 function dispatch(w){
  while(state.queues[w.lane].length){
   const task=state.queues[w.lane].shift(),o=order(task.orderId);
   if(o.delivered&&!task.retry)continue;
   if(task.retry&&state.claims){event('safe','Retry skipped: this bag already has an owner.',o);continue;}
   const to=storeFor(o),duration=w.lane==='normal'?(o.kind==='cold'?5.5:3.4):w.lane==='urgent'?1.4:2.3;
   w.job={orderId:o.id,retry:task.retry,phase:'pick',from:{x:w.x,y:w.y},to:{...to},elapsed:0,duration,lane:w.lane,version:o.version};
   if(!task.retry)o.status='picking';return;
  }
 }
 function incident(key,at,fn){if(state.time>=at&&!fired.has(key)){fired.add(key);fn();}}
 function incidents(){
  if(round>=2)for(const t of [10,18,26,34])incident('retry'+t,t,()=>{
   const active=workers.filter(w=>w.job&&!w.offline&&!w.job.retry),w=active.find(w=>w.job.phase==='pick')||active[0];
   if(!w)return;const o=order(w.job.orderId);
   if(state.claims)event('safe','Retry stopped by the claim stamp.',o);
   else {state.queues[o.lane].unshift({orderId:o.id,retry:true});event('retry','Two requests for bag '+o.id+'. Stamp Claim to stop duplicate work.',o);}
  });
  if(round>=3)incident('stock',12,()=>{state.stockOut=true;addNote('milk','Sol: milk sold out. Use Chamberí.');});
  if(round===4){
   incident('rain',8,()=>{state.rain=true;event('weather','Rain slows every courier. Watch the short timers.');});
   incident('offline',22,()=>{const w=workers.find(w=>w.job?.phase==='deliver')||workers.find(w=>w.job);if(!w)return;Object.assign(w,workerPosition(w));w.offline=true;w.offlineAt=state.time;addNote('offline','Courier '+w.id+' offline. Release its bag.');event('offline','A courier stopped. Pin its note to hand the bag to another bot.',order(w.job.orderId));});
   incident('address',32,()=>{const w=workers.find(w=>!w.offline&&w.job&&!w.job.retry);if(!w)return;const o=order(w.job.orderId);o.needsHuman=true;o.version++;o.slot=(o.slot+5)%12;o.due=Math.max(o.due,state.time+9);o.addressAt=state.time;event('address','New address: tap order '+o.id+', then Human.',o);});
   for(const w of workers)if(w.offline&&w.job&&state.time>w.offlineAt+5&&!fired.has('offline-fail')){fired.add('offline-fail');state.score.wasted++;fail(order(w.job.orderId),'offline','This bag is stuck with an offline courier. Pin the offline note to release it.',{rule:'offline',delta:'wasted'});}
  }
 }
 function advance(dt=.05){
  if(state.finished)return state;if(!Number.isFinite(dt)||dt<=0||dt>.25)throw new RangeError('Step must be between 0 and .25 seconds');
  state.time=+Math.min(DURATION,state.time+dt).toFixed(4);
  for(const o of state.orders)if(o.status==='future'&&o.arrival<=state.time){o.status='new';event('arrival','New '+(o.kind==='cold'?'cold bag':o.kind==='problem'?'address problem':'grocery bag')+'. Tap it, then a lane.',o);}
  incidents();
  for(const w of workers){
   if(w.offline)continue;if(!w.job)dispatch(w);
   if(!w.job){w.x=45+Math.sin(state.time*.25+w.id)*18;w.y=79+Math.cos(state.time*.3+w.id)*7;continue;}
   const j=w.job,o=order(j.orderId);
   if(o.needsHuman&&!o.confirmed&&j.phase==='deliver'&&state.time<o.addressAt+6)continue;
   j.elapsed+=dt/(state.rain&&j.phase==='deliver'?1.4:1);if(j.elapsed<j.duration)continue;
   w.x=j.to.x;w.y=j.to.y;
   if(j.phase==='pick'){
    if(j.retry){state.score.wasted++;fail(o,'duplicate','Both bots reached the same bag. Stamp Claim so retries see its owner.',{rule:'claims',delta:'wasted',x:w.x,y:w.y});w.job=null;continue;}
    if(o.kind==='problem'&&j.lane!=='problem'){state.score.wasted++;fail(o,'routing','This address needs checking. Send its pin to Problem.',{rule:'lane',delta:'wasted',x:w.x,y:w.y});o.status='new';w.job=null;continue;}
    if(state.stockOut&&o.milk&&j.to.id==='sol'){state.score.wasted++;fail(o,'stock','The bot found an empty milk shelf. Pin the Sol note before the next trip.',{rule:'milk',delta:'wasted',x:w.x,y:w.y});o.status='new';w.job=null;continue;}
    j.phase='deliver';j.from={x:w.x,y:w.y};j.to=target(o);j.elapsed=0;j.duration=j.lane==='normal'?4.6:j.lane==='urgent'?2.5:3.2;o.status='delivering';
   }else{
    if(j.version!==o.version&&!o.confirmed){state.score.wasted++;fail(o,'address','The bot used the old address. Select that pin and send it to Human.',{rule:'human',delta:'wasted',x:w.x,y:w.y});o.status='new';w.job=null;continue;}
    if(!o.delivered){if(state.time>o.due)late(o);o.delivered=true;o.status='delivered';if(!o.late)state.score.onTime++;event('delivery','Bag '+o.id+' delivered'+(o.late?' late.':' on time.'),o,{delta:o.late?null:'onTime'});}w.job=null;
   }
  }
  for(const o of state.orders)if(o.status!=='future'&&!o.delivered&&state.time>o.due)late(o);
  if(state.time>=DURATION){
   for(const o of state.orders)if(!o.delivered)late(o);
   state.finished=true;const rate=state.score.onTime/state.orders.length,won=rate>=.7&&state.score.wasted<=3&&state.actions>=state.orders.length*.7;
   const stars=rate>=.95&&state.score.wasted===0&&state.score.escalations<=(round===4?1:0)?3:won?2:1;
   state.result={...state.score,total:state.orders.length,stars,won};event('end',won?'Shift complete. The handoffs held.':'Shift complete. Try the same orders again.');
  }
  return state;
 }
 return {state,advance,route,moveBot,claiming,pin,escalate,carry:()=>({claims:state.claims,lanes:workers.map(w=>w.lane)})};
}
export function workerPosition(w){
 if(!w.job||w.offline)return {x:w.x,y:w.y};const j=w.job,t=Math.min(1,j.elapsed/j.duration),dx=j.to.x-j.from.x,dy=j.to.y-j.from.y,d=Math.abs(dx)+Math.abs(dy),travel=d*t;
 return travel<=Math.abs(dx)?{x:j.from.x+Math.sign(dx)*travel,y:j.from.y}:{x:j.to.x,y:j.from.y+Math.sign(dy)*(travel-Math.abs(dx))};
}
// Stable screen slots. Overflow is a count badge, never overlapping hit targets.
export function pinLayout(orders,narrow=false){
 const cols=narrow?3:4,groups=new Map();
 for(const o of orders.filter(o=>o.status==='new'||o.needsHuman&&!o.delivered)){
  const slot=o.slot%(cols*3);if(!groups.has(slot))groups.set(slot,[]);groups.get(slot).push(o);
 }
 return [...groups].map(([slot,items])=>({slot,x:narrow?14+(slot%cols)*36:10+(slot%cols)*26.5,y:17+Math.floor(slot/cols)*31,items:items.sort((a,b)=>Number(b.needsHuman)-Number(a.needsHuman)||a.due-b.due)}));
}
