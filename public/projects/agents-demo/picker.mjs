// Progressive enhancement: the native select remains the source of the value.
const paths = {
  chevron: 'M6 9 12 15 18 9', check: 'M5 12 10 17 19 7',
  search: 'M15 15 21 21 M17 10A7 7 0 1 1 3 10A7 7 0 0 1 17 10',
  fleet: 'M4 5H10V11H4Z M14 5H20V11H14Z M9 15H15V21H9Z',
  bike: 'M9 6H13 M11 6 15 16H7L11 6 M15 16 18 7H21 M10 16A4 4 0 1 1 2 16A4 4 0 0 1 10 16 M22 16A4 4 0 1 1 14 16A4 4 0 0 1 22 16',
  moto: 'M8 16H15L19 8H16 M5 11H12L15 16 M8 17A3 3 0 1 1 2 17A3 3 0 0 1 8 17 M22 17A3 3 0 1 1 16 17A3 3 0 0 1 22 17',
  van: 'M2 7H14V18H2Z M14 11H19L22 15V18H14 M8 18A2 2 0 1 1 4 18A2 2 0 0 1 8 18 M20 18A2 2 0 1 1 16 18A2 2 0 0 1 20 18',
  mission: 'M5 4H19V20H5Z M9 8H15 M9 12H15 M9 16H12',
  persona: 'M20 12A8 8 0 1 1 4 12A8 8 0 0 1 20 12 M8 10H9 M15 10H16 M8 14Q12 18 16 14',
  tools: 'M14 3A6 6 0 0 0 8 11L3 17A3 3 0 0 0 7 21L13 15A6 6 0 0 0 21 9L17 12 13 8Z',
  memory: 'M4 5H20V19H4Z M8 9H16 M8 13H13 M8 17H10',
  policy: 'M12 2 21 6V12Q20 18 12 22Q4 18 3 12V6Z M7 11 11 15 17 8',
  limits: 'M4 18A9 9 0 1 1 20 18 M12 14 17 8 M5 18H19',
  model: 'M7 7H17V17H7Z M10 3V7 M14 3V7 M10 17V21 M14 17V21 M3 10H7 M3 14H7 M17 10H21 M17 14H21',
  protocols: 'M12 14V22 M9 22H15 M12 10V11 M8 7Q4 11 8 15 M16 7Q20 11 16 15 M5 4Q-2 11 5 18 M19 4Q26 11 19 18',
  events: 'M3 7H18 M14 3 18 7 14 11 M21 17H6 M10 13 6 17 10 21',
  evals: 'M5 3H19V21H5Z M8 11 11 14 17 8 M8 18H16',
  environment: 'M3 11 12 3 21 11 M6 9V21H18V9 M10 21V15H14V21',
};
export function icon(document, kind) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(svg.namespaceURI, 'path');
  path.setAttribute('d', paths[kind] || paths.mission);
  svg.append(path); return svg;
}
const normalize = text => String(text).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
export function matchingItems(items, query) {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  return items.filter(item => terms.every(term => normalize([item.label, item.description, item.group, item.search].join(' ')).includes(term)));
}
export function popupPosition(anchor, viewport, preferredHeight = 380) {
  const edge = 8, gap = 6, minY = (viewport.top || 0) + edge;
  const maxY = (viewport.top || 0) + viewport.height - edge;
  const minX = (viewport.left || 0) + edge;
  const width = Math.min(Math.max(anchor.width, 320), viewport.width - edge * 2);
  const below = Math.max(0, maxY - anchor.bottom - gap), above = Math.max(0, anchor.top - minY - gap);
  const up = below < Math.min(260, preferredHeight) && above > below, height = Math.min(preferredHeight, up ? above : below);
  return {width, height, left: Math.max(minX, Math.min(anchor.left, minX + viewport.width - edge * 2 - width)),
    top: up ? Math.max(minY, anchor.top - height - gap) : Math.min(maxY - height, anchor.bottom + gap)};
}
export function courierChoices(couriers) {
  const district = {chamberi:'Chamberí', retiro:'Retiro', vallecas:'Vallecas'};
  const vehicle = {bike:'Bicycle', moto:'Motorbike', van:'Van'};
  const items = couriers.map((courier, index) => {
    const match = courier.id.match(/(chamberi|retiro|vallecas)-(\d+)$/);
    return {value:String(index), label:match ? district[match[1]] + ' ' + match[2] : courier.id,
      description:(vehicle[courier.mode] || courier.mode) + ' · ' + courier.fleet,
      group:courier.fleet, icon:courier.mode, search:courier.id};
  }).sort((a,b) => a.group.localeCompare(b.group) || a.label.localeCompare(b.label));
  return [{value:'', label:'All couriers', description:couriers.length + ' couriers · ' + new Set(couriers.map(c=>c.fleet)).size + ' fleets', icon:'fleet'}, ...items];
}
export function createPicker(select, {label, placeholder, summary, items = []}) {
  const document = select.ownerDocument, window = document.defaultView;
  const make = (tag, className) => {const node=document.createElement(tag); node.className=className; return node;};
  const control=make('div','choice-control'), symbol=make('span','choice-symbol'), input=make('input','choice-input');
  const meta=make('span','choice-meta'), toggle=make('button','choice-toggle');
  input.id=select.id+'-choice'; input.type='text'; input.autocomplete='off'; input.spellcheck=false;
  input.setAttribute('role','combobox'); input.setAttribute('aria-autocomplete','list');
  input.setAttribute('aria-expanded','false'); input.setAttribute('aria-haspopup','listbox');
  input.setAttribute('aria-label',label); input.setAttribute('aria-controls',select.id+'-options');
  meta.id=input.id+'-description'; input.setAttribute('aria-describedby',meta.id);
  toggle.type='button'; toggle.tabIndex=-1; toggle.setAttribute('aria-label','Show options');
  toggle.append(icon(document,'chevron')); control.append(symbol,input,toggle,meta);
  const popup=make('div','choice-popup'), heading=make('div','choice-heading'), list=make('div','choice-list');
  const empty=make('p','choice-empty'); empty.textContent='No matches. Try a fleet, name or number.';
  popup.hidden=true; list.id=select.id+'-options'; list.setAttribute('role','listbox'); list.setAttribute('aria-label',label);
  heading.setAttribute('role','status'); heading.setAttribute('aria-live','polite'); popup.append(heading,list,empty);
  document.body.append(popup); select.after(control); select.hidden=true;
  const fieldLabel=Array.from(document.querySelectorAll('label')).find(node=>node.htmlFor===select.id);
  if(fieldLabel)fieldLabel.htmlFor=input.id;
  let opened=false, filtered=[], active=-1;
  function symbolFor(item){return typeof item?.icon==='function'?item.icon():icon(document,item?.icon||'search');}
  function sync(){
    if(opened)return;
    const item=items.find(item=>item.value===select.value);
    input.value=item?.label||''; input.placeholder=placeholder; input.disabled=select.disabled||!items.length;
    toggle.disabled=input.disabled; meta.textContent=item?.shortDescription||item?.description||'Choose an option';
    symbol.replaceChildren(symbolFor(item)); input.removeAttribute('aria-activedescendant');
  }
  function position(){
    const rect=control.getBoundingClientRect();
    const visual=window.visualViewport;
    const viewport={width:visual?.width||window.innerWidth,height:visual?.height||window.innerHeight,top:visual?.offsetTop||0,left:visual?.offsetLeft||0};
    if(!rect.width||rect.bottom<viewport.top||rect.top>viewport.top+viewport.height){close();return;}
    popup.style.width=popupPosition(rect,viewport).width+'px';
    const contentHeight=heading.offsetHeight+(filtered.length?list.scrollHeight:empty.offsetHeight)+2;
    const p=popupPosition(rect,viewport,Math.min(380,contentHeight));
    for(const key of ['width','height','left','top'])popup.style[key]=p[key]+'px';
  }
  function highlight(index, scroll=true){
    active=Math.max(0,Math.min(filtered.length-1,index));
    const options=Array.from(list.querySelectorAll('[role=option]'));
    options.forEach((node,i)=>node.dataset.active=String(i===active));
    if(options[active]){input.setAttribute('aria-activedescendant',options[active].id);if(scroll)options[active].scrollIntoView?.({block:'nearest'});}
    else input.removeAttribute('aria-activedescendant');
  }
  function render(query){
    filtered=matchingItems(items,query); list.replaceChildren();
    heading.textContent=query.trim()?filtered.length+' matching '+(filtered.length===1?'option':'options'):summary;
    empty.hidden=filtered.length>0;list.hidden=filtered.length===0;
    if(!filtered.length)empty.textContent='No matches. Try another name or clear the search.';
    const groups=new Map();
    filtered.forEach((item,index)=>{
      let parent=list;
      if(item.group){
        if(!groups.has(item.group)){
          const group=make('div','choice-group'), title=make('div','choice-group-title');
          title.id=list.id+'-group-'+groups.size; title.textContent=item.group;
          const count=make('span','choice-group-count');count.textContent=filtered.filter(option=>option.group===item.group).length;
          title.append(count);group.setAttribute('role','group');group.setAttribute('aria-labelledby',title.id);group.append(title);list.append(group);groups.set(item.group,group);
        } parent=groups.get(item.group);
      }
      const option=make('div','choice-option'), badge=make('span','choice-badge'), copy=make('span','choice-copy');
      const name=make('span','choice-name'), description=make('span','choice-description'), check=make('span','choice-check');
      option.id=list.id+'-'+index;option.setAttribute('role','option');option.dataset.index=String(index);
      option.setAttribute('aria-selected',String(item.value===select.value));
      name.textContent=item.label;description.textContent=item.description||'';badge.append(symbolFor(item));check.append(icon(document,'check'));
      copy.append(name,description);option.append(badge,copy,check);parent.append(option);
    });
    highlight(query ? 0 : Math.max(0,filtered.findIndex(item=>item.value===select.value)),false);
  }
  function open(query=''){
    if(input.disabled)return;
    opened=true;control.dataset.open='true';popup.hidden=false;input.setAttribute('aria-expanded','true');
    input.value=query;input.placeholder='Search…';meta.textContent=placeholder;symbol.replaceChildren(icon(document,'search'));render(query);position();input.focus();
    highlight(active);
  }
  function close(){opened=false;popup.hidden=true;control.dataset.open='false';input.setAttribute('aria-expanded','false');sync();}
  function choose(index){const item=filtered[index];if(!item)return;select.value=item.value;close();select.dispatchEvent(new window.Event('change',{bubbles:true}));input.focus();}
  const onFocus=()=>{if(!opened)input.select();};
  const onInput=()=>{if(!opened)open(input.value);else{render(input.value);position();}};
  const onClick=()=>{if(!opened)open();};
  const onKey=event=>{
    if(event.isComposing)return;
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();if(!opened)open();else highlight(active+(event.key==='ArrowDown'?1:-1));
    }else if(event.key==='Enter'){event.preventDefault();opened?choose(active):open();}
    else if(event.key==='Escape'&&opened){event.preventDefault();event.stopPropagation();close();}
    else if(event.key==='Tab')close();
  };
  input.addEventListener('focus',onFocus); input.addEventListener('click',onClick);input.addEventListener('input',onInput);input.addEventListener('keydown',onKey);
  input.addEventListener('blur',close);toggle.addEventListener('pointerdown',e=>e.preventDefault());
  toggle.addEventListener('click',()=>{if(opened)close();else open();input.focus();});
  list.addEventListener('pointerdown',e=>e.preventDefault());list.addEventListener('click',e=>{const row=e.target.closest('[role=option]');if(row)choose(Number(row.dataset.index));});
  list.addEventListener('pointermove',e=>{const row=e.target.closest('[role=option]');if(row)highlight(Number(row.dataset.index),false);});
  const outside=event=>{if(opened&&!control.contains(event.target)&&!popup.contains(event.target))close();};
  const onScroll=event=>{if(opened&&(!(event.target instanceof window.Node)||!popup.contains(event.target)))position();};
  document.addEventListener('pointerdown',outside);document.addEventListener('scroll',onScroll,true);window.addEventListener('resize',onScroll);
  window.visualViewport?.addEventListener('resize',onScroll);window.visualViewport?.addEventListener('scroll',onScroll);
  select.addEventListener('change',sync);sync();
  return {sync,close,setItems(next){items=next;close();},destroy(){close();select.hidden=false;control.remove();popup.remove();if(fieldLabel)fieldLabel.htmlFor=select.id;
    select.removeEventListener('change',sync);document.removeEventListener('pointerdown',outside);document.removeEventListener('scroll',onScroll,true);window.removeEventListener('resize',onScroll);window.visualViewport?.removeEventListener('resize',onScroll);window.visualViewport?.removeEventListener('scroll',onScroll);}};
}
