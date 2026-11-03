import {frameAt} from './story-playback.js';
export function createCity(canvas, data, onCourier, onStore) {
  const ctx=canvas.getContext('2d'), base=document.createElement('canvas'), bg=base.getContext('2d');
  const motion=globalThis.CourierMotion.createReplayMotion({duration:data.clock.duration,couriers:data.couriers.map(c=>c.id),routes:data.routes,frames:data.frames.map(f=>({time:f.time,positions:f.couriers.map(c=>[c[0],c[1],c[3]])}))});
  let width=0,height=0,scale=1,ox=0,oy=0,time=0,selected=-1,points=[];
  const unit=data.map.units, aspect=data.map.aspect_ratio;
  const xy=p=>[ox+p[0]/unit*scale*aspect,oy+p[1]/unit*scale];
  function line(context,points){if(!points.length)return;context.beginPath();points.forEach((p,i)=>{const [x,y]=xy(p);i?context.lineTo(x,y):context.moveTo(x,y);});context.stroke();}
  function resize(){
    const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;if(!width||!height)return;
    const dpr=Math.min(devicePixelRatio||1,2);canvas.width=base.width=Math.round(width*dpr);canvas.height=base.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);bg.setTransform(dpr,0,0,dpr,0,0);
    scale=Math.min((width-36)/aspect,height-76);ox=(width-scale*aspect)/2;oy=(height-scale)/2-12;
    bg.fillStyle='#e5e8dc';bg.fillRect(0,0,width,height);bg.strokeStyle='#fafaf3';bg.lineWidth=1.3;
    for(const road of data.map.roads)line(bg,road);
    bg.font='12px system-ui';bg.textAlign='center';bg.fillStyle='#52665b';
    for(const site of data.map.sites){const [x,y]=xy(site.point);if(site.kind==='hub'){bg.fillText(site.district,x,y-12);}else{bg.strokeStyle='#718477';bg.lineWidth=1.2;bg.strokeRect(x-2.5,y-2.5,5,5);}}
    render(time,selected);
  }
  function render(nextTime,nextSelected){
    time=nextTime;selected=nextSelected;if(!width)return;ctx.clearRect(0,0,width,height);ctx.drawImage(base,0,0,width,height);
    const frame=frameAt(data.frames,time);points=[];
    if(selected>=0){const state=frame.couriers[selected],route=state[3]>=0?data.routes[state[3]]:[];ctx.strokeStyle='#8e704b';ctx.lineWidth=2.5;ctx.setLineDash([5,4]);line(ctx,route);ctx.setLineDash([]);ctx.strokeStyle='#bd511f';ctx.lineWidth=4;const travelled=route.filter(p=>p[2]<=time);const pos=motion.position(data.couriers[selected].id,time/data.clock.duration*60);if(pos)travelled.push([pos[1],pos[0]]);line(ctx,travelled);}
    for(let i=0;i<data.couriers.length;i++){
      const p=motion.position(data.couriers[i].id,time/data.clock.duration*60);if(!p)continue;const [x,y]=xy([p[1],p[0]]);points.push({x,y,i});
      const status=data.statuses[frame.couriers[i][2]],active=['delivering','to_pickup','repositioning'].includes(status);
      ctx.beginPath();ctx.arc(x,y,i===selected?7:active?4:2.7,0,Math.PI*2);ctx.fillStyle=i===selected?'#bd511f':active?'#087c43':'#859689';ctx.fill();ctx.strokeStyle='#fffdf6';ctx.lineWidth=1.5;ctx.stroke();
      if(i===selected){ctx.font='600 12px system-ui';const text=data.couriers[i].id,tw=ctx.measureText(text).width;const tx=Math.max(6,Math.min(width-tw-16,x+13)),ty=Math.max(22,y-9);ctx.fillStyle='#fffdf6';ctx.fillRect(tx-5,ty-15,tw+10,23);ctx.fillStyle='#203c31';ctx.fillText(text,tx,ty);}
    }
  }
  canvas.addEventListener('click',event=>{const r=canvas.getBoundingClientRect(),x=event.clientX-r.left,y=event.clientY-r.top;const hit=points.map(p=>({...p,d:Math.hypot(p.x-x,p.y-y)})).sort((a,b)=>a.d-b.d)[0];if(hit?.d<18){onCourier(hit.i);return;}const store=data.map.sites.find(s=>s.kind!=='hub'&&Math.hypot(xy(s.point)[0]-x,xy(s.point)[1]-y)<12);if(store)onStore();});
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  return {render,dispose(){observer.disconnect();}};
}
