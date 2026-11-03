import {PARTS,ROUNDS,createWorkshop} from './bot-model.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={inventory:'Inventory',dispatcher:'Dispatch',support:'Support'};
const anchors={inventory:[126,258],dispatcher:[357,258],support:[589,258],door:[660,67]};
const short={tool:'Tools',radio:'Talk',memory:'Memory',engine:'Engine',stock:'Stock'};
function robot(role,x,loadout,selected){
 const stamp=role==='inventory'?PARTS.stock.choices.find(c=>c.id===loadout.stock).stamp:role==='support'?PARTS.memory.choices.find(c=>c.id===loadout.memory).stamp:PARTS.tool.choices.find(c=>c.id===loadout.tool).stamp;
 const claw=role==='inventory'||(role==='dispatcher'&&loadout.tool==='reassign');
 return `<g class="bw-bot" data-role="${role}" data-selected="${selected===role}" transform="translate(${x} 155)">
  <ellipse class="bw-pad" cx="0" cy="91" rx="58" ry="15" fill="#142e32" stroke="#6a8981"/><path d="M-42 73H35L47 82-35 91-52 81Z" fill="#0d2329"/>
  <rect x="-36" y="65" width="25" height="21" rx="7" fill="#11272d" stroke="#9bb6b5"/><rect x="13" y="65" width="25" height="21" rx="7" fill="#11272d" stroke="#9bb6b5"/>
  <path d="M-22 2 28-3 38 13 38 62 24 72-22 65Z" fill="#416569" stroke="#142b30" stroke-width="3"/><rect x="-32" y="9" width="56" height="55" rx="9" fill="#a7bfba" stroke="#132b30" stroke-width="3"/>
  <rect x="-25" y="15" width="42" height="42" rx="5" fill="#24434a"/><circle cx="-4" cy="35" r="13" fill="#10292e" stroke="currentColor" stroke-width="3"/><path d="M-10 35H2M-4 29V41" stroke="currentColor" stroke-width="3"/>
  <path d="M-36 21-48 28-48 49" fill="none" stroke="#9bb7b6" stroke-width="10" stroke-linecap="round"/><path d="M34 20 47 29 47 48" fill="none" stroke="#9bb7b6" stroke-width="10" stroke-linecap="round"/>
  ${claw?'<path d="M-55 47V60L-48 65-41 60V47M40 47V60L47 65 54 60V47" fill="none" stroke="currentColor" stroke-width="5"/>':'<path d="M-54 45H-42V61H-54Z M40 48 57 40V64L40 58Z" fill="currentColor" stroke="#183439" stroke-width="2"/>'}
  <path d="M-29-34 25-39 36-26 36 0 22 9-29 1Z" fill="#476e71" stroke="#152e33" stroke-width="3"/><rect x="-38" y="-30" width="60" height="31" rx="7" fill="currentColor" stroke="#193239" stroke-width="3"/>
  <rect x="-31" y="-24" width="46" height="16" rx="4" fill="#14363f"/><path class="bw-eye" d="M-25-20H-13V-15H-25Z M-3-20H9V-15H-3Z" fill="#e0eecc"/>
  <path d="M10-37V-52" stroke="#b7d2c6" stroke-width="3"/><circle cx="10" cy="-56" r="6" fill="${role==='dispatcher'&&loadout.radio==='silent'?'#74817e':'currentColor'}" stroke="#162e33" stroke-width="2"/>
  ${role==='dispatcher'&&loadout.radio==='addressed'?'<path d="M0-65Q-7-56 0-47M20-65Q27-56 20-47" fill="none" stroke="currentColor" stroke-width="2"/>':''}
  ${role==='support'?'<rect x="26" y="22" width="12" height="32" rx="4" fill="#132f35" stroke="currentColor" stroke-width="2"/><rect x="29" y="'+(loadout.memory==='none'?'47':'28')+'" width="6" height="'+(loadout.memory==='none'?'4':'23')+'" fill="currentColor"/>':''}
  ${role==='dispatcher'?'<path d="M27 19H32M27 25H32M27 31H32" stroke="'+(loadout.engine==='reasoning'?'#f4a888':'#d8e5bd')+'" stroke-width="3"/>':''}
  <rect x="-30" y="49" width="52" height="14" rx="3" fill="#142c31"/><text x="-4" y="59" fill="#e6efdd" font-size="7.7" text-anchor="middle">${stamp}</text>
 </g>`;
}
function world(loadout,selected){return `<svg viewBox="0 0 720 330" role="img" aria-label="Robot workshop: Inventory at the shelves, Dispatch beside the courier lane, Support in its office. Choose a robot using the buttons below.">
 <defs><pattern id="bw-floor" width="36" height="24" patternUnits="userSpaceOnUse"><path d="M36 0H0V24" fill="none" stroke="#54726f" stroke-width=".6"/></pattern></defs>
 <rect width="720" height="330" fill="#233c40"/><path d="M0 62 720 62V330H0Z" fill="url(#bw-floor)"/>
 <path d="M24 77 208 77 221 91V275H24Z" fill="#2d4e49" stroke="#769389"/><path d="M24 77V275L9 261V65Z" fill="#496c61"/><path d="M24 77 9 65 195 65 208 77Z" fill="#79978a"/>
 <path d="M485 77H700V276H485Z" fill="#294956" stroke="#71939e"/><path d="M485 77 470 64H685L700 77Z" fill="#75949d"/><path d="M485 77V276L470 261V64Z" fill="#416874"/>
 <path d="M249 64H444V330H249Z" fill="#203138"/><path d="M262 78V315M432 78V315" stroke="#66817c" stroke-width="2"/><path d="M347 78V315" stroke="#8ca19b" stroke-width="2" stroke-dasharray="14 13"/>
 <g fill="#17312f" stroke="#8ca695" stroke-width="3"><path d="M39 102H189V153H39ZM39 126H189M89 102V153M139 102V153"/></g><g fill="#b4c28e" stroke="#233f35" stroke-width="2"><path d="M48 109H71V123H48ZM98 108H121V123H98ZM148 110H171V123H148Z"/></g>
 <path d="M505 109H678V143H505Z" fill="#15323d" stroke="#a2bbc0"/><path d="M511 116H549M560 116H598M610 116H669M511 128H566M578 128H651" stroke="#6d9da9" stroke-width="3"/>
 <path d="M510 260H670L687 276H525Z" fill="#7d9b9f" stroke="#203e48"/><path d="M525 276V299M682 276V299" stroke="#749298" stroke-width="5"/>
 <text x="119" y="38" text-anchor="middle" fill="#d2e4c8" font-size="13">Stock room</text><text x="348" y="38" text-anchor="middle" fill="#f2d49c" font-size="13">Courier lane</text><text x="576" y="38" text-anchor="middle" fill="#c5dfeb" font-size="13">Support office</text>
 <path d="M638 74V39L660 23 682 39V74Z" fill="#d1c49c" stroke="#182e33" stroke-width="3"/><path d="M653 74V53H667V74" fill="#304f4f"/>
 <path class="bw-wire" data-connected="${loadout.radio!=='silent'}" d="M143 258C205 300 287 300 345 257"/><path class="bw-wire" d="M377 256C443 310 519 310 573 256"/><path d="M227 282 235 276 227 271M469 287 477 281 469 276" fill="none" stroke="#c7ded3" stroke-width="2"/>
 <text x="235" y="319" fill="#c4d8cf" font-size="11" text-anchor="middle">stock ready →</text><text x="472" y="319" fill="#c4d8cf" font-size="11" text-anchor="middle">delivery issue →</text>
 ${robot('inventory',126,loadout,selected)}${robot('dispatcher',357,loadout,selected)}${robot('support',589,loadout,selected)}
 <g id="bw-packet" hidden aria-hidden="true"><rect class="bw-packet" x="-8" y="-9" width="16" height="18" rx="3"/><path d="M-4-9V-13H4V-9M0-4V4" fill="none" stroke="#f6cf75" stroke-width="2"/></g>
 <g id="bw-lock" hidden aria-hidden="true"><rect class="bw-lock" x="-11" y="-2" width="22" height="19" rx="3"/><path d="M-6-2V-9A6 6 0 0 1 6-9V-2" fill="none" stroke="#efa895" stroke-width="3"/></g>
 </svg>`;}
export function initBotGame(root=document.getElementById('bot-game')){
 if(!root)return null;
 const doc=root.ownerDocument,win=doc.defaultView,game=createWorkshop();root.hidden=false;
 const el=id=>root.querySelector('#bw-'+id),panel=root.closest('[data-station-panel]'),motion=win.matchMedia('(prefers-reduced-motion: reduce)');
 let focus='tool',phase='build',playing=false,frame=0,last=0,elapsed=0,event=null;
 const state=()=>game.state,round=()=>ROUNDS[state().round];
 function selectPart(key){const restore=el('tabs').contains(doc.activeElement);focus=key;renderBench();renderWorld();if(restore)el('tabs').querySelector('[data-part="'+key+'"]').focus();}
 function renderWorld(){el('world').innerHTML=world(state().loadout,PARTS[focus].role);root.querySelectorAll('[data-bw-robot]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bwRobot===PARTS[focus].role)));drawPacket(0);}
 function renderBench(){
  const s=state(),part=PARTS[focus],editable=phase==='build'&&round().unlocked.includes(focus);
  el('tabs').innerHTML=Object.keys(PARTS).filter(key=>PARTS[key].role===part.role).map(key=>'<button type="button" data-part="'+key+'" aria-pressed="'+(key===focus)+'">'+short[key]+'</button>').join('');
  el('part-title').textContent=labels[part.role]+' · '+part.name;
  el('part-help').textContent=editable?'Choose an attachment, then run the shift.':phase==='build'?'Already equipped for this round. Inspect it, or return to the highlighted challenge.':'Return to the workbench to change parts.';
  el('choices').innerHTML=part.choices.filter(c=>editable||c.id===s.loadout[focus]).map(c=>'<button type="button" class="bw-choice" data-choice="'+c.id+'" aria-pressed="'+(c.id===s.loadout[focus])+'"'+(!editable?' disabled':'')+'><strong>'+esc(c.name)+'</strong><span>'+esc(c.detail)+'</span></button>').join('');
  el('installed').textContent='Challenge: '+PARTS[round().focus].name+'.';
  el('hint').textContent=round().hint;
 }
 function stats(e){el('goal').textContent=(e?.delivered||0)+' / '+round().target+' delivered';el('budget').textContent=(e?.credits||0)+' / '+round().budget+' game credits';}
 function controls(){el('run').textContent=playing?'Pause':phase==='run'?'Resume shift':phase==='complete'?'Replay shift':'Run shift';el('step').disabled=phase==='complete';el('repair').hidden=phase==='build';el('next').hidden=phase!=='complete'||!state().result?.won||state().round===4;}
 function setup(){stop();phase='build';event=null;focus=round().focus;el('round').textContent='Round '+(state().round+1)+' of 5';el('title').textContent=round().title;el('brief').textContent=round().brief;el('result').hidden=true;el('log').replaceChildren();el('trace-count').textContent='';el('progress').style.width='0%';el('speech').textContent='Fit the '+PARTS[focus].name.toLowerCase()+', or run once to see what breaks.';el('speech').dataset.kind='';stats();renderBench();renderWorld();controls();}
 function stop(){playing=false;if(frame)win.cancelAnimationFrame(frame);frame=0;last=0;controls();}
 function pause(){if(!playing)return;stop();el('speech').textContent='Shift paused. Resume when you are ready.';}
 function drawPacket(progress){
  const packet=el('packet'),lock=el('lock');if(!packet||!lock)return;
  packet.toggleAttribute('hidden',!event||!['message','delivery'].includes(event.kind));lock.toggleAttribute('hidden',!event||event.kind!=='blocked');
  if(event){const a=anchors[event.from]||anchors[event.role],b=anchors[event.to]||a,t=motion.matches?1:progress;
   const x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t+(event.kind==='delivery'?-35:40)*Math.sin(Math.PI*t);packet.setAttribute('transform','translate('+x+' '+y+')');lock.setAttribute('transform','translate('+a[0]+' '+(a[1]-160)+')');
   root.querySelectorAll('.bw-bot').forEach(bot=>bot.dataset.working=String(bot.dataset.role===event.role));
  }
 }
 function advance(){
  event=game.step();if(!event)return;stats(event);el('speech').textContent=labels[event.role]+': '+event.text;el('speech').dataset.kind=event.kind;
  const li=doc.createElement('li');li.textContent=labels[event.role]+': '+event.text;el('log').append(li);const s=state();el('trace-count').textContent='('+ (s.cursor+1)+(s.cursor===0?' step)':' steps)');el('progress').style.width=((s.cursor+1)/s.result.events.length*100)+'%';drawPacket(0);
  if(event.kind==='result'){
   stop();phase='complete';el('result').hidden=false;el('result').dataset.won=String(s.result.won);
   el('result-title').textContent=s.result.won?(s.round===4?'Workshop complete. Your team survived Friday.':'Shift complete. Ready for the next part.'):'A repair is needed.';
   el('result-copy').textContent=s.result.delivered+' delivered · '+s.result.lost+' missed · '+s.result.declined+' declined · '+s.result.credits+' credits · '+s.result.blocks+' unsafe requests blocked. '+(s.result.won?'Safety gates held throughout.':round().hint);
   controls();renderBench();
  }
 }
 function start(){game.run();phase='run';elapsed=0;event=null;el('log').replaceChildren();el('result').hidden=true;renderBench();advance();}
 function tick(now){
  frame=0;if(!playing)return;if(doc.hidden||panel?.hidden){pause();return;}
  if(last)elapsed+=Math.min(now-last,80);last=now;drawPacket(Math.min(1,elapsed/1000));
  root.querySelectorAll('.bw-bot').forEach(bot=>{const x=anchors[bot.dataset.role][0],tilt=!motion.matches&&bot.dataset.working==='true'?Math.sin(Math.min(1,elapsed/1000)*Math.PI*2)*1.8:0;bot.setAttribute('transform','translate('+x+' 155) rotate('+tilt+')');});
  if(elapsed>=1200){elapsed=0;advance();}if(playing)frame=win.requestAnimationFrame(tick);
 }
 el('run').addEventListener('click',()=>{if(playing){pause();return;}if(phase!=='run')start();playing=true;last=0;controls();frame=win.requestAnimationFrame(tick);});
 el('step').addEventListener('click',()=>{stop();if(phase==='build')start();else advance();elapsed=0;drawPacket(1);controls();});
 el('repair').addEventListener('click',()=>{stop();game.repair();phase='build';focus=round().focus;event=null;el('result').hidden=true;el('log').replaceChildren();el('trace-count').textContent='';el('progress').style.width='0%';stats();renderBench();renderWorld();controls();el('speech').textContent='Change a part, then retry the same incident. Safety gates stay on.';el('speech').dataset.kind='';el('choices').querySelector('[aria-pressed=true]').focus();});
 el('next').addEventListener('click',()=>{if(game.next()){setup();el('run').focus();}});
 el('restart').addEventListener('click',()=>{game.reset();setup();});
 el('tabs').addEventListener('click',e=>{const b=e.target.closest('[data-part]');if(b)selectPart(b.dataset.part);});
 el('choices').addEventListener('click',e=>{const b=e.target.closest('[data-choice]');if(!b||phase!=='build')return;if(game.equip(focus,b.dataset.choice)){const choice=b.dataset.choice;renderBench();renderWorld();el('choices').querySelector('[data-choice="'+choice+'"]').focus();el('speech').textContent='Attachment fitted. Run the shift to test the team.';el('speech').dataset.kind='';}});
 root.querySelectorAll('[data-bw-robot]').forEach(b=>b.addEventListener('click',()=>{const keys=Object.keys(PARTS).filter(k=>PARTS[k].role===b.dataset.bwRobot);selectPart(keys.find(k=>round().unlocked.includes(k))||keys[0]);}));
 el('world').addEventListener('click',e=>{const bot=e.target.closest('[data-role]');if(bot)root.querySelector('[data-bw-robot="'+bot.dataset.role+'"]').click();});
 const visibility=()=>{if(doc.hidden)pause();};doc.addEventListener('visibilitychange',visibility);win.addEventListener('blur',pause);motion.addEventListener('change',pause);
 const observer=new win.MutationObserver(()=>{if(panel?.hidden)pause();});if(panel)observer.observe(panel,{attributes:true,attributeFilter:['hidden']});
 el('gcp').innerHTML='<dl>'+Object.values(PARTS).map(p=>'<dt>'+esc(p.name)+'</dt><dd>'+esc(p.gcp)+' <a href="https://github.com/alejandrofrank/madrid-delivery-sim/blob/main/'+p.source+'" target="_blank" rel="noopener noreferrer">Source</a></dd>').join('')+'</dl>';
 setup();return {game,pause,get playing(){return playing;},destroy(){stop();observer.disconnect();doc.removeEventListener('visibilitychange',visibility);win.removeEventListener('blur',pause);motion.removeEventListener('change',pause);}};
}
