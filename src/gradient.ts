// Full-page decorative color, with all readable content on a separate layer.
export const gradientMarkup = `<div class="color-world" aria-hidden="true">
  <svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><filter id="cursor-waves" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feImage id="wave-map" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="waves"/><feDisplacementMap in="SourceGraphic" in2="waves" scale="65" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg>
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
   waves=waves.filter(w=>now-w.t<3200);
   if(!waves.length){stop();return;}
   if(now-lastPaint>40){
     lastPaint=now;
     const width=128,height=Math.max(48,Math.round(width*innerHeight/innerWidth));
     if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
     const pixels=ctx.createImageData(width,height),data=pixels.data,aspect=innerWidth/innerHeight;
     for(let y=0;y<height;y++)for(let x=0;x<width;x++){
       let dx=0,dy=0;
       for(const w of waves){
         const age=(now-w.t)/1000,px=(x/width-w.x)*aspect,py=y/height-w.y,d=Math.hypot(px,py),front=d-age*.20;
         const force=Math.sin(front*32)*Math.exp(-front*front*65)*Math.exp(-age*1.05)*Math.min(age*8,1)*w.strength;
         dx+=px/Math.max(d,.02)*force;dy+=py/Math.max(d,.02)*force;
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
   if(e.target.closest && e.target.closest('a,button,summary,.reveal-body,.tlp-dialog'))return;
   const now=performance.now(),x=e.clientX/innerWidth,y=e.clientY/innerHeight;
   if(now-lastPointer<95)return;
   const distance=previous?Math.hypot(x-previous.x,y-previous.y):.025;
   if(distance<.008)return;
   waves.push({x,y,t:now,strength:Math.min(.8,.3+distance*5)});if(waves.length>7)waves.shift();
   previous={x,y};lastPointer=now;
   if(!frame)frame=requestAnimationFrame(paint);
 },{passive:true});
 reduced.addEventListener('change',stop);document.addEventListener('visibilitychange',stop);
})();
</script>`;
