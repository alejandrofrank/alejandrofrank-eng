// A deterministic point field; no network assets or animation dependencies.
export const waveMarkup = `<div class="wave-field" aria-hidden="true"><canvas id="waves"></canvas><svg class="wave-fallback" viewBox="0 0 900 500"><defs><linearGradient id="wave-color"><stop stop-color="#6d80ef"/><stop offset="1" stop-color="#b3a4ff"/></linearGradient></defs><g fill="none" stroke="url(#wave-color)" stroke-width="2">${Array.from({length: 28}, (_, i) => `<path d="M-50 ${220+i*7} C180 ${-120+i*9} 400 ${620-i*6} 950 ${100+i*9}"/>`).join('')}</g></svg></div>`;

export const waveScript = `<script>
(() => {
  const canvas = document.getElementById('waves');
  const ctx = canvas && canvas.getContext('2d');
  if (!ctx) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, frame = 0, visible = true, last = 0, time = 0;
  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (let row = 0; row < 48; row++) {
      for (let col = 0; col < 106; col++) {
        const u = col / 105, v = row / 47;
        const envelope = Math.sin(u * Math.PI);
        const wave = Math.sin(u * 9 + v * 3 - time) * envelope;
        const x = u * (width + 80) - 40;
        const y = height * (.22 + v * .57) + wave * height * .22 + Math.cos(u * 5 + time * .5) * height * .08;
        const alpha = (.22 + .62 * Math.sin(v * Math.PI)) * (.35 + .65 * envelope);
        ctx.fillStyle = 'rgba(' + Math.round(75 + v*58) + ', ' + Math.round(97 + v*29) + ', 232,' + alpha + ')';
        const size = .8 + 1.05 * envelope;
        ctx.fillRect(x,y,size,size);
      }
    }
  }
  function tick(now) {
    frame = 0;
    if (!visible || document.hidden || reduce.matches) return;
    if (now - last >= 32) { time += Math.min((now-last)/1000, .05)*.45; last = now; draw(); }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = performance.now();
    draw();
    if (visible && !document.hidden && !reduce.matches) frame = requestAnimationFrame(tick);
  }
  new ResizeObserver(() => {
    width = canvas.clientWidth; height = canvas.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width*dpr; canvas.height = height*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0); draw();
  }).observe(canvas);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(canvas);
  reduce.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
  canvas.parentElement.classList.add('wave-ready');
})();
</script>`;
