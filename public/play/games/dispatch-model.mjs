// Original, deterministic teaching model. No network, model calls or real orders.
export const QUEUES = ['normal', 'urgent', 'problem'];
export const STORES = [{id:'sol',name:'Sol',x:252,y:254},{id:'chamberi',name:'Chamberí',x:320,y:105},{id:'retiro',name:'Retiro',x:530,y:260}];
export const ZONES = [{name:'Chamberí',x:170,y:95},{name:'Salamanca',x:545,y:98},{name:'Centro',x:160,y:285},{name:'Retiro',x:635,y:280},{name:'Arganzuela',x:290,y:400},{name:'Pacífico',x:545,y:405}];
export const HUB = {x:390,y:245};
export const ROUNDS = [
 {title:'Every order needs a lane',brief:'Six orders. Urgent bags need a fast lane; address problems need the problem team.',lesson:'routing',count:6,note:'The dispatcher hands work to the right role through typed requests.',agent:'dispatcher'},
 {title:'The lunch rush',brief:'Six urgent orders arrive together. Move your six agents where the work is.',lesson:'capacity',count:8,note:'The dispatcher balances available couriers against waiting orders.',agent:'dispatcher'},
 {title:'One bag. Two pickers?',brief:'A delayed receipt triggers a retry. The second worker cannot see the first worker’s claim.',lesson:'claims',count:7,note:'Fulfillment keeps order work and handoffs tied to one order.',agent:'fulfillment'},
 {title:'Who told the next shift?',brief:'Sol runs out of milk. The next worker needs to hear about it before leaving.',lesson:'milk',count:8,note:'Inventory shares stock facts so other roles do not promise missing items.',agent:'inventory'},
 {title:'Madrid, all at once',brief:'Rain, an offline courier and a new address. Keep the handoffs moving without sending every issue to a human.',lesson:'chaos',count:10,note:'Customer service escalates uncertain changes while the dispatcher replans.',agent:'customer_service'},
];
export function rulesFor(round){
 if(!ROUNDS[round])throw new RangeError('Unknown round');
 return {routing:{normal:'normal',urgent:round===0?'normal':'urgent',problem:round===0?'normal':'problem'},staff:round===1?{normal:4,urgent:1,problem:1}:{normal:2,urgent:3,problem:1},claims:round>2,milk:round>3,offline:false,escalate:'never'};
}
export function validRules(r){return !!r&&QUEUES.every(q=>QUEUES.includes(r.routing?.[q])&&Number.isInteger(r.staff?.[q])&&r.staff[q]>=0&&r.staff[q]<=6)&&QUEUES.reduce((n,q)=>n+r.staff[q],0)<=6&&['claims','milk','offline'].every(k=>typeof r[k]==='boolean')&&['never','address','all'].includes(r.escalate);}
function rng(seed){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
const copy=value=>structuredClone(value);
export function makeOrders(round,seed=17){
 const random=rng(seed),n=ROUNDS[round].count;
 return Array.from({length:n},(_,i)=>{
  const type=round===1?(i<6?'urgent':'normal'):i%4===1?'urgent':i%4===3?'problem':'normal';
  const zone=ZONES[(i+Math.floor(random()*3))%ZONES.length];
  const arrival=round===1?i*.35:i*1.15;
  return {id:i+1,type,arrival,due:arrival+(type==='urgent'?(round===1?8.5:6.5):12)+(round===4?5:0),x:zone.x+(random()-.5)*36,y:zone.y+(random()-.5)*26,zone:zone.name,store:round>=3&&i%2===0?'sol':STORES[i%3].id,milk:round>=3&&i%2===0,status:'future',failures:[],deliveries:0,addressVersion:0};
 });
}
export function createShift(round,rules,seed=17){
 if(!ROUNDS[round]||!validRules(rules))throw new TypeError('Invalid shift rules');
 const plan=copy(rules),orders=makeOrders(round,seed),workers=QUEUES.flatMap(q=>Array.from({length:plan.staff[q]},(_,i)=>({id:q+'-'+i,queue:q,job:null,x:HUB.x,y:HUB.y,offline:false})));
 const queues=Object.fromEntries(QUEUES.map(q=>[q,[]]));
 const state={round,time:0,duration:28,orders,workers,queues,notes:[],events:[],failures:[],rain:false,stockOut:false,finished:false,score:{onTime:0,delivered:0,wasted:0,escalations:0},result:null};
 const claims=new Set(),arrived=new Set(),fired=new Set();let serial=0;
 function event(kind,text,order=null,rule=null){const e={id:++serial,time:state.time,kind,text,order:order?.id??null,rule};state.events.push(e);return e;}
 function fail(order,kind,text,rule){if(order.failures.includes(kind))return;order.failures.push(kind);state.failures.push(event('failure',text,order,rule));}
 function note(kind,text){if(!state.notes.some(n=>n.kind===kind)){state.notes.push({kind,text,time:state.time});event('memory',text);}}
 function enqueue(order,retry=false){
  if(retry&&plan.claims&&(claims.has(order.id)||order.deliveries)){event('safe','Retry ignored: this bag already has an owner.',order);return;}
  const queue=plan.routing[order.type];queues[queue].push({orderId:order.id,retry});if(!retry)order.status='waiting';
  event(retry?'retry':'arrival',retry?'Receipt delayed. The same order has arrived again.':order.type[0].toUpperCase()+order.type.slice(1)+' order arrives in '+order.zone+'.',order);
 }
 function escalate(order,reason){state.score.escalations++;event('human',reason,order);}
 function dispatch(w){
  while(queues[w.queue].length){
   const task=queues[w.queue].shift(),o=orders[task.orderId-1];
   if(plan.claims&&(claims.has(o.id)||o.deliveries)){event('safe','Already claimed. This worker takes the next bag.',o);continue;}
   claims.add(o.id);
   if(task.retry){state.score.wasted++;fail(o,'duplicate','Two workers picked the same bag; write a claimed marker before starting work.','claims');}
   const store=STORES.find(s=>s.id===(state.stockOut&&o.milk&&plan.milk?'chamberi':o.store));
   if(state.stockOut&&o.milk&&plan.milk)event('safe','Shared note read: milk is available at Chamberí.',o);
   const extra=o.type==='problem'?1.1:0;
   w.job={orderId:o.id,retry:task.retry,phase:'pick',elapsed:0,duration:1.1+extra,store:copy(store),from:{x:w.x,y:w.y},to:copy(store),addressVersion:o.addressVersion};
   if(!task.retry)o.status='picking';
   if(plan.escalate==='all'){escalate(o,'Human asked to check this handoff.');w.job.duration+=1.2;}
   event('claim',w.queue[0].toUpperCase()+w.queue.slice(1)+' team takes the bag'+(plan.claims?' and records its claim.':'.'),o);return;
  }
 }
 function incident(key,at,fn){if(state.time>=at&&!fired.has(key)){fired.add(key);fn();}}
 function incidents(){
  if(round>=2)incident('retry',2.75,()=>enqueue(orders[0],true));
  if(round>=3)incident('milk',3.25,()=>{state.stockOut=true;event('incident','Sol has run out of milk.');if(plan.milk){note('milk','Sol: no milk. Use Chamberí.');for(const w of workers){const j=w.job;if(j?.phase==='pick'&&j.store.id==='sol'&&orders[j.orderId-1].milk){const p=workerPosition(w);j.store=copy(STORES[1]);j.from=p;j.to=copy(STORES[1]);j.elapsed=0;j.duration=1.3;event('safe','The stock note redirects a picker before it reaches the empty shelf.',orders[j.orderId-1]);}}}});
  if(round===4){
   incident('rain',4,()=>{state.rain=true;event('incident','Rain slows every route by 35%.');});
   incident('offline',6,()=>{
    const w=workers.find(a=>a.job?.phase==='deliver')||workers.find(a=>a.job);if(!w)return;
    Object.assign(w,workerPosition(w));w.offline=true;const o=orders[w.job.orderId-1];event('incident','A courier has gone offline mid-delivery.',o);
    if(plan.offline){note('offline','Courier offline. Release and reassign its bag.');claims.delete(o.id);w.job=null;enqueue(o);event('safe','The abandoned claim was released; another worker can continue.',o);}
    else fail(o,'offline','A bag is stuck with an offline courier; share the offline note so its claim can be reassigned.','offline');
   });
   incident('address',9,()=>{
    const w=workers.find(a=>!a.offline&&a.job?.phase==='deliver')||workers.find(a=>!a.offline&&a.job);const o=w?orders[w.job.orderId-1]:orders.find(a=>a.status==='waiting');if(!o)return;
    o.addressVersion++;o.x=610;o.y=365;event('incident','The customer changes their address after pickup.',o);
    if(plan.escalate!=='never'){
     escalate(o,'Human confirms the new address; the courier gets a fresh destination.');o.due+=2;
     if(w){w.job.addressVersion=o.addressVersion;if(w.job.phase==='deliver'){w.job.from={x:w.x,y:w.y};w.job.to={x:o.x,y:o.y};w.job.elapsed=0;w.job.duration=2+Math.hypot(o.x-w.x,o.y-w.y)/140;}}
     note('address','New address confirmed. Discard the old destination.');
    }else fail(o,'address','The courier still has the old address; escalate uncertain address changes before continuing.','escalate');
   });
  }
 }
 function advance(dt=.25){
  if(state.finished)return state;if(!Number.isFinite(dt)||dt<=0||dt>.25)throw new RangeError('Use fixed steps up to a quarter second');
  state.time=+(state.time+dt).toFixed(4);
  for(const o of orders)if(o.arrival<=state.time&&!arrived.has(o.id)){arrived.add(o.id);enqueue(o);}
  incidents();
  for(const w of workers){
   if(w.offline)continue;if(!w.job)dispatch(w);if(!w.job)continue;
   const j=w.job,o=orders[j.orderId-1];j.elapsed+=dt/(state.rain&&j.phase==='deliver'?1.35:1);
   if(j.elapsed<j.duration)continue;
   w.x=j.to.x;w.y=j.to.y;
   if(j.phase==='pick'){
    if(o.type==='problem'&&w.queue!=='problem'){state.score.wasted++;fail(o,'routing','The delivery team cannot resolve this address problem; route problem orders to the problem queue.','routing');o.status='failed';w.job=null;continue;}
    if(state.stockOut&&o.milk&&j.store.id==='sol'){state.score.wasted++;fail(o,'stale','Another picker reached an empty milk shelf; share the stock note before sending the next order.','milk');o.status='failed';w.job=null;continue;}
    j.phase='deliver';j.elapsed=0;j.duration=1.1+Math.hypot(o.x-w.x,o.y-w.y)/145;j.from={x:w.x,y:w.y};j.to={x:o.x,y:o.y};if(!j.retry)o.status='delivering';event('handoff','Bag packed. The courier takes it to '+o.zone+'.',o);
   }else{
    if(j.addressVersion!==o.addressVersion){state.score.wasted++;o.status='failed';fail(o,'address','The courier used an old address; escalate uncertain address changes before continuing.','escalate');}
    else if(!o.deliveries){o.deliveries++;o.status='delivered';o.deliveredAt=state.time;state.score.delivered++;if(state.time<=o.due)state.score.onTime++;event('delivery',state.time<=o.due?'Delivered on time.':'Delivered, but the customer waited too long.',o);}
    else{o.deliveries++;event('waste','A second bag reached the same doorstep.',o);}
    w.job=null;
   }
  }
  for(const o of orders)if(o.status!=='future'&&o.status!=='delivered'&&o.status!=='failed'&&state.time>o.due){
   const wrong=o.type==='urgent'&&plan.routing.urgent!=='urgent';
   fail(o,'late',wrong?'An urgent bag waited behind normal orders; give urgent orders their own queue.':o.status==='waiting'?'This queue has more work than workers; move an agent here before the next shift.':'This bag missed its window; shift capacity toward its queue so it can leave sooner.',wrong?'routing':'capacity');
  }
  const done=arrived.size===orders.length&&QUEUES.every(q=>!queues[q].length)&&workers.every(w=>!w.job||w.offline);
  if((done&&state.time>=(round===4?12:round>=3?5:round>=2?3:0))||state.time>=state.duration){
   state.finished=true;const won=state.score.onTime===orders.length&&state.score.wasted===0&&state.failures.length===0;
   state.result={...state.score,total:orders.length,won,stars:won?(state.score.escalations<=(round===4?1:0)?3:2):state.score.onTime>=orders.length*.6?1:0};
   event('result',won?'Every handoff held. The whole shift arrived on time.':'Same orders, same timing. Change the rule that broke the handoff.');
  }
  return state;
 }
 return {state,advance,plan};
}
export function simulate(round,rules,seed=17){const shift=createShift(round,rules,seed);while(!shift.state.finished)shift.advance();return copy(shift.state);}
export function workerPosition(worker,fraction=0){if(!worker.job||worker.offline)return {x:worker.x,y:worker.y};const j=worker.job,t=Math.min(1,(j.elapsed+fraction)/j.duration);const mid={x:j.to.x,y:j.from.y};const a=Math.abs(mid.x-j.from.x),b=Math.abs(j.to.y-mid.y),distance=(a+b)*t;if(distance<=a&&a)return {x:j.from.x+(mid.x-j.from.x)*distance/a,y:j.from.y};return {x:mid.x,y:mid.y+(j.to.y-mid.y)*(b?(distance-a)/b:1)};}
