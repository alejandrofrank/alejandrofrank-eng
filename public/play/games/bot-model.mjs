// Original teaching model. Game credits and timings are not cloud measurements.
export const PARTS = {
 tool:{name:'Tool arm',role:'dispatcher',symbol:'arm',source:'config/agents/dispatcher/role.json',gcp:'ADK tools propose actions; scoped tools validate them.',choices:[
  {id:'notify',name:'Message arm',detail:'Explain a delay. Cannot assign a replacement courier.',stamp:'CHAT'},
  {id:'reassign',name:'Dispatch arm',detail:'Read availability and assign a replacement courier.',stamp:'ROUTE'}]},
 radio:{name:'Communication antenna',role:'dispatcher',symbol:'radio',source:'docs/A2A.md',gcp:'Authenticated A2A calls carry typed requests to the intended role.',choices:[
  {id:'silent',name:'Local only',detail:'Keep the request inside this robot. No handoff.',stamp:'LOCAL'},
  {id:'addressed',name:'Addressed request',detail:'Send the order to Dispatch with its permitted scope.',stamp:'A2A'},
  {id:'broadcast',name:'Broadcast everything',detail:'Send every order to every role. The privacy gate will block it.',stamp:'ALL'}]},
 memory:{name:'Memory tank',role:'support',symbol:'memory',source:'docs/AGENT-MEMORY.md',gcp:'Scoped SQL remains authoritative; pgvector and Vertex recall are optional profiles.',choices:[
  {id:'none',name:'No recall',detail:'Ask the customer again, even if this order already has an answer.',stamp:'EMPTY'},
  {id:'scoped',name:'Order notebook',detail:'Recall this order’s valid facts for this role. Ignore expired notes.',stamp:'SCOPED'},
  {id:'shared',name:'Everyone’s notebook',detail:'Read another order’s notes too. The scope gate will block it.',stamp:'SHARED'}]},
 engine:{name:'Reasoning engine',role:'dispatcher',symbol:'engine',source:'docs/ADK-RESTAURANT.md',gcp:'Routine rules avoid model calls; model-backed decisions can use ADK and Vertex AI.',choices:[
  {id:'rules',name:'Rules only',detail:'Routine routes cost 0 credits. Unfamiliar detours must wait.',stamp:'RULES'},
  {id:'hybrid',name:'Rules + reasoning',detail:'Routine routes are free; spend 4 credits on the unfamiliar detour.',stamp:'MIXED'},
  {id:'reasoning',name:'Reason about everything',detail:'Spend 4 credits on every route, even the familiar ones.',stamp:'THINK'}]},
 stock:{name:'Stock gripper',role:'inventory',symbol:'stock',source:'config/agents/inventory/role.json',gcp:'Scoped database tools reserve physical stock before promising it.',choices:[
  {id:'optimistic',name:'Promise first',detail:'Promise every basket before checking. Stock gates still reject impossible picks.',stamp:'PROMISE'},
  {id:'reserve',name:'Reserve first',detail:'Reserve available stock. Safely decline a basket that cannot be filled.',stamp:'RESERVE'}]},
};
export const ROUNDS = [
 {title:'Wrong tool for the job',brief:'A courier goes offline with an order waiting. Give Dispatch a way to find a replacement.',focus:'tool',unlocked:['tool'],target:3,budget:8,initial:{tool:'notify'},hint:'Messages explain the problem. A dispatch tool can change the assignment.'},
 {title:'Can you hear me?',brief:'The bags are packed, but Dispatch never receives them. Repair the handoff.',focus:'radio',unlocked:['radio'],target:3,budget:8,initial:{radio:'silent'},hint:'The receiving role needs an addressed request with just the permitted order.'},
 {title:'You already asked me that',brief:'A customer already chose a safe delivery location. Help Support remember without reading anyone else’s notes.',focus:'memory',unlocked:['memory'],target:3,budget:9,initial:{memory:'none'},hint:'A useful note belongs to this order, this role and this run, and has not expired.'},
 {title:'Expensive taste',brief:'One street has an unfamiliar detour. Deliver all three orders with just 9 game credits.',focus:'engine',unlocked:['engine'],target:3,budget:9,initial:{engine:'reasoning'},hint:'Only the unfamiliar detour needs reasoning. Routine routes already have a rule.'},
 {title:'Friday evening',brief:'Rain, a detour and a courier dropout. Five orders, four baskets. Deliver four and safely decline one.',focus:'stock',unlocked:['stock','tool','radio','memory','engine'],target:4,budget:10,initial:{tool:'notify',radio:'silent',memory:'none',engine:'reasoning',stock:'optimistic'},hint:'Reserve the four real baskets, address handoffs, equip recovery, scope recall and reason only when needed.'},
];
const DEFAULTS={tool:'reassign',radio:'addressed',memory:'scoped',engine:'hybrid',stock:'reserve'};
const copy=value=>JSON.parse(JSON.stringify(value));
export function loadoutFor(round){return {...DEFAULTS,...ROUNDS[round].initial};}
export function recall(records,scope,now){return records.filter(r=>r.run===scope.run&&r.order===scope.order&&r.role===scope.role&&r.expires>now);}
function rng(seed){let x=seed>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
export function simulate(roundIndex,loadout,seed=17){
 const round=ROUNDS[roundIndex];if(!round)throw new RangeError('Unknown round');
 for(const [key,part] of Object.entries(PARTS))if(!part.choices.some(c=>c.id===loadout[key]))throw new TypeError('Unknown part: '+key);
 const random=rng(seed),names=['Luz','Nico','Sol','Vera','Dani','Inés'];
 for(let i=names.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[names[i],names[j]]=[names[j],names[i]];}
 const count=roundIndex===4?5:3,offline=Math.floor(random()*Math.min(3,count)),detour=(offline+1)%3;
 const events=[],orders=[];let credits=0,stock=roundIndex===4?4:3,delivered=0,declined=0,blocks=0,remembered=false;
 const emit=(role,text,extra={})=>events.push({role,text,from:role,to:role,credits,delivered,declined,stock,blocks,...extra});
 const charge=(amount,role)=>{if(credits+amount>round.budget){emit(role,'Budget lock: this action needs '+amount+' credits. Nothing was charged.',{kind:'blocked',reason:'budget'});return false;}credits+=amount;return true;};
 emit('inventory','Three robots. One shift. Safety gates are always on.',{kind:'start'});
 if(roundIndex===4)emit('dispatcher','Heavy rain slows the courier lane. One route needs a detour.',{kind:'chaos'});
 for(let i=0;i<count;i++){
  const order={id:'basket-'+(i+1),name:names[i],status:'waiting',courier:'courier-'+i};orders.push(order);
  if(stock===0){
   order.status='declined';declined++;
   if(loadout.stock==='optimistic'){blocks++;emit('inventory','Stock lock: '+order.name+' was promised a basket that does not exist.',{kind:'blocked',reason:'stock',order:order.name});}
   else emit('inventory','No basket left for '+order.name+'. Declined before making a promise.',{kind:'declined',order:order.name});
   continue;
  }
  if(!charge(1,'inventory')){order.status='lost';continue;}
  stock--;emit('inventory',order.name+'’s basket is reserved and packed.',{kind:'pick',order:order.name});
  if(loadout.radio!=='addressed'){
   order.status='lost';if(loadout.radio==='broadcast')blocks++;
   emit('dispatcher',loadout.radio==='silent'?'I packed it. Did anyone tell Dispatch?':'Privacy lock: this request includes orders the receiver cannot access.',{kind:loadout.radio==='silent'?'stuck':'blocked',reason:'radio',from:'inventory',to:'dispatcher',order:order.name});continue;
  }
  emit('dispatcher','Inventory → Dispatch: '+order.name+'’s basket is ready.',{kind:'message',from:'inventory',to:'dispatcher',order:order.name});
  const unfamiliar=roundIndex>=3&&i===detour;
  const reasoning=loadout.engine==='reasoning'||(unfamiliar&&loadout.engine==='hybrid');
  if(!charge(reasoning?4:0,'dispatcher')){order.status='lost';continue;}
  if(unfamiliar&&loadout.engine==='rules'){order.status='lost';emit('dispatcher','This detour is outside my route rules. Escalated; the delivery window closes.',{kind:'stuck',reason:'engine',order:order.name});continue;}
  emit('dispatcher',reasoning?'A reasoning step resolves '+order.name+'’s route. 4 credits spent.':'A known route fits '+order.name+'’s order. No model needed.',{kind:'route',order:order.name,reasoning});
  if(i===offline){
   emit('dispatcher','Courier offline! '+order.name+'’s bag is still at the dock.',{kind:'chaos',order:order.name});
   if(loadout.tool!=='reassign'){order.status='lost';emit('dispatcher','I can explain the delay. I cannot assign another courier.',{kind:'stuck',reason:'tool',order:order.name});continue;}
   if(!charge(1,'dispatcher')){order.status='lost';continue;}
   order.courier='replacement';emit('dispatcher','Replacement courier assigned. Same bag, new pair of wheels.',{kind:'recovery',order:order.name});
  }
  if(roundIndex>=2&&i===detour){
   emit('support','Dispatch → Support: confirm '+order.name+'’s safe delivery location.',{kind:'message',from:'dispatcher',to:'support',order:order.name});
   const scope={run:'workshop-'+seed,role:'support',order:order.id};
   const notes=[{...scope,expires:100,value:'reception'},{...scope,order:'other-order',expires:100,value:'neighbour'},{...scope,expires:1,value:'old address'}];
   if(loadout.memory==='shared'){blocks++;order.status='lost';emit('support','Scope lock: another order’s notebook stays closed.',{kind:'blocked',reason:'memory',order:order.name});continue;}
   if(loadout.memory==='none'){order.status='lost';emit('support','You already told me? Sorry, I need to ask again. The delivery window closes.',{kind:'stuck',reason:'memory',order:order.name});continue;}
   if(!charge(1,'support')){order.status='lost';continue;}
   const facts=recall(notes,scope,20);remembered=facts.length===1&&facts[0].value==='reception';
   if(!remembered)throw new Error('Invalid recall');
   emit('support','This order’s valid note says reception. Other orders and expired notes stay closed.',{kind:'recall',order:order.name});
  }
  order.status='delivered';delivered++;emit('dispatcher',order.name+'’s basket reaches the doorstep.',{kind:'delivery',from:'dispatcher',to:'door',order:order.name});
 }
 const lost=orders.filter(o=>o.status==='lost').length;
 const won=delivered===round.target&&lost===0&&blocks===0&&(roundIndex!==4||declined===1);
 emit('support',won?'Shift complete. Right parts, right boundaries.': 'Back to the workbench. Repair the part, then replay this same shift.',{kind:'result'});
 return {won,events,orders,delivered,lost,declined,blocks,credits,stock,remembered,seed,round:roundIndex,loadout:copy(loadout)};
}
export function createWorkshop(seed=17){
 let round=0,loadout=loadoutFor(0),completed=[],attempts=0,result=null,cursor=-1;
 return {
  get state(){return copy({round,loadout,completed,attempts,result,cursor,seed});},
  equip(key,value){if(!ROUNDS[round].unlocked.includes(key)||!PARTS[key]?.choices.some(c=>c.id===value))return false;loadout[key]=value;result=null;cursor=-1;return true;},
  run(){attempts++;result=simulate(round,loadout,seed);cursor=-1;return copy(result);},
  step(){if(!result)return null;if(cursor<result.events.length-1)cursor++;if(cursor===result.events.length-1&&result.won&&!completed.includes(round))completed.push(round);return copy(result.events[cursor]);},
  next(){if(!result?.won||cursor!==result.events.length-1||round===ROUNDS.length-1)return false;round++;loadout=loadoutFor(round);result=null;cursor=-1;return true;},
  repair(){result=null;cursor=-1;},
  reset(){round=0;loadout=loadoutFor(0);completed=[];attempts=0;result=null;cursor=-1;},
 };
}
