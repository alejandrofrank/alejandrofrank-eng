// A small, dependency-free color field. Ripples refract the field itself;
// no cursor-following DOM elements or decorative rings over the content.
export const playgroundMarkup = `<div class="playground-world" aria-hidden="true"><canvas id="gradient-playground"></canvas></div>`;

export const gradientPlaygroundScript = `<script>
(() => {
 const canvas = document.getElementById('gradient-playground');
 const root = canvas && canvas.parentElement;
 const toggle = document.getElementById('gradient-toggle');
 const reset = document.getElementById('gradient-reset');
 if (!canvas || !root || !toggle || !reset) return;
 const gl = canvas.getContext('webgl', { alpha:false, antialias:false, depth:false, powerPreference:'low-power' });
 if (!gl) return;
 const vertex = 'attribute vec2 position; void main(){gl_Position=vec4(position,0.0,1.0);}';
 const fragment = \`
 precision mediump float;
 uniform vec2 resolution;
 uniform float clock;
 uniform vec3 ripples[8];
 float blob(vec2 p,vec2 c,vec2 scale){vec2 d=(p-c)/scale;return exp(-dot(d,d)*2.0);}
 void main(){
   vec2 uv=gl_FragCoord.xy/resolution;
   float aspect=resolution.x/resolution.y;
   vec2 p=vec2(uv.x*aspect,uv.y);
   for(int i=0;i<8;i++){
     float age=clock-ripples[i].z;
     if(age>=0.0 && age<7.0){
       vec2 d=p-vec2(ripples[i].x*aspect,ripples[i].y);
       float dist=length(d);
       float front=dist-age*.16;
       float wave=sin(front*36.0)*exp(-front*front*38.0)*exp(-age*.65);
       p+=d/max(dist,.025)*wave*.019;
     }
   }
   uv=vec2(p.x/aspect,p.y);
   float t=clock*.075;
   uv+=vec2(sin(uv.y*4.0+t),cos(uv.x*3.0+t*.8))*.035;
   vec3 navy=vec3(.055,.078,.12);
   vec3 teal=vec3(.02,.57,.61);
   vec3 orange=vec3(.96,.30,.105);
   vec3 cream=vec3(.91,.81,.64);
   float a=blob(uv,vec2(.51+sin(t)*.035,.26+cos(t)*.035),vec2(.49,.35));
   float b=blob(uv,vec2(.87+cos(t*.8)*.045,.60+sin(t*.7)*.04),vec2(.32,.48));
   float c=blob(uv,vec2(.73+sin(t*.6)*.045,.48),vec2(.28,.35));
   vec3 color=mix(navy,teal,a*.94);
   color=mix(color,orange,b*.92);
   color=mix(color,cream,c*.82);
   float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5;
   color+=grain*.033;
   gl_FragColor=vec4(color,1.0);
 }
 \`;
 function shader(kind,source){const s=gl.createShader(kind);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);return null;}return s;}
 const vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);
 if(!vs || !fs) return;
 const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
 gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
 const size=gl.getUniformLocation(program,'resolution'),time=gl.getUniformLocation(program,'clock'),points=gl.getUniformLocation(program,'ripples[0]');
 const waves=new Float32Array(24);for(let i=2;i<24;i+=3)waves[i]=-100;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=reduce.matches,frame=0,last=0,elapsed=0,index=0,lastWave=-1,px=-1,py=-1,lost=false;
 function draw(){if(lost)return;gl.uniform2f(size,canvas.width,canvas.height);gl.uniform1f(time,elapsed);gl.uniform3fv(points,waves);gl.drawArrays(gl.TRIANGLES,0,6);}
 function resize(){const scale=Math.min(devicePixelRatio||1,1.5,1400/innerWidth);canvas.width=Math.round(innerWidth*scale);canvas.height=Math.round(innerHeight*scale);gl.viewport(0,0,canvas.width,canvas.height);draw();}
 function tick(now){frame=0;if(paused||document.hidden||lost)return;if(now-last>=32){elapsed+=Math.min((now-last)/1000,.06);last=now;draw();}frame=requestAnimationFrame(tick);}
 function sync(){cancelAnimationFrame(frame);frame=0;last=performance.now();toggle.textContent=paused?'Play gradient':'Pause gradient';toggle.setAttribute('aria-pressed',String(paused));if(!paused&&!document.hidden&&!lost)frame=requestAnimationFrame(tick);}
 function clear(){waves.fill(0);for(let i=2;i<24;i+=3)waves[i]=-100;index=0;lastWave=-1;px=py=-1;}
 window.addEventListener('pointermove',e=>{
   if(paused||reduce.matches||e.pointerType==='touch'||elapsed-lastWave<.10)return;
   if(e.target.closest && e.target.closest('a,button,summary,.reveal-body,.tlp-dialog'))return;
   const x=e.clientX/innerWidth,y=1-e.clientY/innerHeight;
   if(Math.hypot(x-px,y-py)<.012)return;
   waves[index*3]=x;waves[index*3+1]=y;waves[index*3+2]=elapsed;
   index=(index+1)%8;lastWave=elapsed;px=x;py=y;
 },{passive:true});
 toggle.addEventListener('click',()=>{paused=!paused;sync();});
 reset.addEventListener('click',()=>{clear();elapsed=0;draw();});
 reduce.addEventListener('change',()=>{paused=reduce.matches;clear();sync();draw();});
 document.addEventListener('visibilitychange',sync);
 window.addEventListener('resize',resize,{passive:true});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(frame);root.classList.remove('playground-ready');toggle.hidden=true;reset.hidden=true;});
 resize();root.classList.add('playground-ready');toggle.hidden=false;reset.hidden=false;sync();
})();
</script>`;
