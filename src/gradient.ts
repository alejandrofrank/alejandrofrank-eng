// Full-page decorative color, with all readable content on a separate layer.
export const gradientMarkup = `<div class="color-world" aria-hidden="true">
  <svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><filter id="cursor-waves" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feImage id="wave-map" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="waves"/><feDisplacementMap in="SourceGraphic" in2="waves" scale="125" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg>
  <div class="color-motion"><div class="color-band"><i></i><i></i><i></i></div></div>
</div>
<script>
(() => {
 const surface=document.querySelector('.color-motion'),map=document.getElementById('wave-map');
 if(!surface||!map)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
 if(!ctx)return;
 let waves=[],frame=0,lastPaint=0,lastPointer=0,previous=null;
 function stop(){cancelAnimationFrame(frame);frame=0;waves=[];previous=null;surface.classList.remove('is-rippling');}
 function paint(now){
   frame=0;
   if(reduced.matches||document.hidden){stop();return;}
   waves=waves.filter(w=>now-w.t<6000);
   if(!waves.length){stop();return;}
   if(now-lastPaint>40){
     lastPaint=now;
     const width=128,height=Math.min(192,Math.max(48,Math.round(width*innerHeight/innerWidth)));
     if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
     const pixels=ctx.createImageData(width,height),data=pixels.data,aspect=innerWidth/innerHeight;
     for(let y=0;y<height;y++)for(let x=0;x<width;x++){
       let dx=0,dy=0;
       for(const w of waves){
         const age=(now-w.t)/1000,px=(x/width-w.x)*aspect,py=y/height-w.y+age*.026,d=Math.hypot(px,py),front=d-age*.14;
         const envelope=Math.exp(-front*front*28)*Math.exp(-age*.65)*Math.min(age*6,1)*Math.min(1,(6-age)/1.2)*w.strength;
         const force=Math.sin(front*19)*envelope,curl=Math.cos(front*12-age)*envelope*.6;
         dx+=(px*force-py*curl)/Math.max(d,.025)+w.vx*envelope*2;
         dy+=(py*force+px*curl)/Math.max(d,.025)+w.vy*envelope*2;
       }
       const i=(y*width+x)*4;
       data[i]=128+Math.max(-110,Math.min(110,dx*100));data[i+1]=128+Math.max(-110,Math.min(110,dy*100));data[i+2]=128;data[i+3]=255;
     }
     ctx.putImageData(pixels,0,0);map.setAttribute('href',canvas.toDataURL());surface.classList.add('is-rippling');
   }
   frame=requestAnimationFrame(paint);
 }
 window.addEventListener('pointermove',e=>{
   if(reduced.matches||document.hidden||e.pointerType==='touch')return;
   const now=performance.now(),x=e.clientX/innerWidth,y=e.clientY/innerHeight,aspect=innerWidth/innerHeight;
   if(now-lastPointer<70)return;
   const distance=previous?Math.hypot(x-previous.x,y-previous.y):.025;
   if(distance<.006)return;
   waves.push({x,y,t:now,strength:Math.min(1,.4+distance*6),vx:previous?(x-previous.x)*aspect:0,vy:previous?y-previous.y:0});if(waves.length>14)waves.shift();
   previous={x,y};lastPointer=now;
   if(!frame)frame=requestAnimationFrame(paint);
 },{passive:true});
 reduced.addEventListener('change',stop);document.addEventListener('visibilitychange',stop);
})();
</script>`;
