import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';
import {createPicker,courierChoices,matchingItems,popupPosition} from '../public/projects/agents-demo/picker.mjs';
const couriers=JSON.parse(readFileSync(new URL('../public/projects/agents-demo/city.json',import.meta.url))).couriers;
const choices=courierChoices(couriers);
function setup(){
 const window=new Window(),doc=window.document;
 doc.body.innerHTML='<label for="courier">Follow a courier</label><select id="courier"></select><button id="next">Next action</button>';
 const select=doc.querySelector('select');
 for(const item of choices){const option=doc.createElement('option');option.value=item.value;option.textContent=item.label;select.append(option);}
 const picker=createPicker(select,{label:'Follow a courier',placeholder:'Search fleet or district',summary:'Choose a courier',items:choices});
 doc.querySelector('.choice-control').getBoundingClientRect=()=>({top:100,bottom:170,left:100,right:340,width:240,height:70});
 const input=doc.querySelector('[role=combobox]');
 return {window,doc,select,picker,input,key:key=>input.dispatchEvent(new window.KeyboardEvent('keydown',{key,bubbles:true,cancelable:true})),type:query=>{input.value=query;input.dispatchEvent(new window.Event('input',{bubbles:true}));},dispose:async()=>{picker.destroy();await window.happyDOM.close();}};
}
test('courier presentation preserves all identities and searches fleet, district, accents and raw IDs',()=>{
 assert.equal(choices.length,43);assert.equal(choices[0].label,'All couriers');
 assert.equal(new Set(choices.map(c=>c.value)).size,43);
 const item=choices.find(c=>c.value==='16');assert.equal(item.label,'Chamberí 08');assert.match(item.description,/Motorbike · Bakiano/);
 assert.equal(matchingItems(choices,'chamberi 08')[0],item);
 assert.equal(matchingItems(choices,'castellana-retiro-02').length,1);
 assert.equal(matchingItems(choices,'BAKIANO').length,24);
 assert.equal(matchingItems(choices,'not a real fleet').length,0);
});
test('search and keyboard commit one real selection; Escape restores the committed value',async()=>{
 const f=setup();try{
  let changes=0;f.select.addEventListener('change',()=>changes++);
  f.input.focus();f.key('ArrowDown');assert.equal(f.input.getAttribute('aria-expanded'),'true');assert.equal(f.doc.activeElement,f.input);
  f.type('chamberi 08');assert.equal(f.doc.querySelectorAll('[role=option]').length,1);
  const active=f.doc.getElementById(f.input.getAttribute('aria-activedescendant'));assert.match(active.textContent,/Chamberí 08/);
  f.key('Enter');assert.equal(f.select.value,'16');assert.equal(changes,1);assert.equal(f.input.value,'Chamberí 08');assert.equal(f.input.getAttribute('aria-expanded'),'false');
  f.key('ArrowDown');f.type('retiro');f.key('ArrowDown');f.key('Escape');assert.equal(f.select.value,'16');assert.equal(f.input.value,'Chamberí 08');assert.equal(changes,1);
 }finally{await f.dispose();}
});
test('pointer choice, outside dismissal and programmatic map changes stay synchronized',async()=>{
 const f=setup();try{
  f.input.click();f.type('castellana-retiro-02');f.doc.querySelector('[role=option]').click();
  assert.equal(couriers[Number(f.select.value)].id,'castellana-retiro-02');
  f.input.click();f.doc.querySelector('#next').dispatchEvent(new f.window.PointerEvent('pointerdown',{bubbles:true}));assert.equal(f.input.getAttribute('aria-expanded'),'false');
  f.select.value='16';f.picker.sync();assert.equal(f.input.value,'Chamberí 08');
  f.input.click();assert.equal(f.doc.querySelector('[aria-selected=true]').textContent.includes('Chamberí 08'),true);
  f.window.dispatchEvent(new f.window.Event('resize'));f.doc.dispatchEvent(new f.window.Event('scroll'));
  f.key('Tab');assert.equal(f.input.getAttribute('aria-expanded'),'false');assert.equal(f.select.value,'16');
 }finally{await f.dispose();}
});
test('empty search cannot commit a bogus option and clear search restores the fleet groups',async()=>{
 const f=setup();try{
  f.input.click();f.type('zzzzzz');f.key('Enter');assert.equal(f.select.value,'');assert.equal(f.doc.querySelector('.choice-empty').hidden,false);assert.equal(f.input.hasAttribute('aria-activedescendant'),false);
  f.type('');assert.equal(f.doc.querySelectorAll('[role=group]').length,3);assert.equal(f.doc.querySelectorAll('[role=option]').length,43);
  f.key('Escape');assert.equal(f.input.value,'All couriers');
 }finally{await f.dispose();}
});
test('changing available parts rebuilds the menu and teardown restores native labeling',async()=>{
 const f=setup();try{
  f.select.innerHTML='<option value="memory">Memory</option>';f.picker.setItems([{value:'memory',label:'What it remembers',description:'Memory and scope',icon:'memory'}]);
  assert.equal(f.input.value,'What it remembers');f.input.click();assert.equal(f.doc.querySelectorAll('[role=option]').length,1);
  f.picker.destroy();assert.equal(f.select.hidden,false);assert.equal(f.doc.querySelector('label').htmlFor,'courier');assert.equal(f.doc.querySelector('.choice-popup'),null);
 }finally{await f.window.happyDOM.close();}
});
test('popup stays inside desktop, narrow and keyboard-reduced viewports and flips above the anchor',()=>{
 for(const viewport of [{width:1280,height:720},{width:390,height:650},{width:320,height:568},{width:390,height:290,top:180}]){
  for(const y of [40,viewport.height-90]){
   const top=(viewport.top||0)+y,anchor={left:viewport.width-255,top,bottom:top+65,width:240};
   const p=popupPosition(anchor,viewport);assert.ok(p.left>=8);assert.ok(p.left+p.width<=viewport.width-8);assert.ok(p.top>=(viewport.top||0)+8);assert.ok(p.top+p.height<=(viewport.top||0)+viewport.height-8);
  }
 }
 const p=popupPosition({left:900,top:580,bottom:650,width:240},{width:1280,height:720});assert.ok(p.top<580);
 const compact=popupPosition({left:900,top:450,bottom:515,width:240},{width:1280,height:720},130);
 assert.equal(compact.height,130);assert.equal(compact.top,521);
 const above=popupPosition({left:900,top:580,bottom:650,width:240},{width:1280,height:720},130);
 assert.equal(above.height,130);assert.equal(above.top,444);
});
