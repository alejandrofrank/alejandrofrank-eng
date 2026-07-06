// ----------------------------------------------------------------------------
// Hero background: a spinning ASCII Möbius strip on <canvas>.
// Ported to vanilla JS (no React) from the scrapmarket landing, scaled smaller
// and tinted to the site accent. Respects prefers-reduced-motion.
//
// NOTE: the script below avoids template literals / backticks / "</script>" so
// it stays safe inside this module's template literal and inside the HTML page.
// ----------------------------------------------------------------------------

export const MOBIUS_CANVAS = '<canvas id="mobius" class="mobius" aria-hidden="true"></canvas>';

export const MOBIUS_SCRIPT = `<script>
(function () {
  var canvas = document.getElementById('mobius');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var CHARS = ' .:;-=+*%&#@';
  var SPEED_A = 0.003, SPEED_B = 0.005, TILT = 0.75;
  var CELL_W = 6, CELL_H = 11;
  var SCALE = 1.8;        // smaller than the original (was 2.8)
  var A = 0.8, B = 0.4;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    var p = canvas.parentElement;
    if (!p) return;
    canvas.width = p.offsetWidth;
    canvas.height = p.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function frame() {
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    var cosA = Math.cos(A), sinA = Math.sin(A), cosB = Math.cos(B), sinB = Math.sin(B);
    var R = 4.5, K2 = 3.0;
    var K1 = (W * K2 * SCALE) / (8 * (R + 1));
    var HALF_W = 3.5;
    var cosT = Math.cos(TILT), sinT = Math.sin(TILT);
    var TWO_PI = 6.2832;

    var gridW = Math.floor(W / CELL_W), gridH = Math.floor(H / CELL_H);
    var n = gridW * gridH;
    var zbuffer = new Array(n), output = new Array(n);
    for (var i = 0; i < n; i++) { zbuffer[i] = 0; output[i] = ' '; }

    var cx = W / 2, cy = H / 2;

    for (var u = 0; u < TWO_PI; u += 0.012) {
      var cosU = Math.cos(u), sinU = Math.sin(u);
      var cosHU = Math.cos(u * 0.5), sinHU = Math.sin(u * 0.5);

      for (var v = -HALF_W; v <= HALF_W; v += 0.06) {
        var scale = 1 + (v * 0.5) * cosHU;
        var sx = scale * cosU, sy = scale * sinU, sz = (v * 0.5) * sinHU;

        var y1 = sy * cosA - sz * sinA, z1 = sy * sinA + sz * cosA;
        var x2 = sx * cosB + z1 * sinB, z2i = -sx * sinB + z1 * cosB;
        var x3 = x2 * cosT - y1 * sinT, y3 = x2 * sinT + y1 * cosT, z2 = z2i;

        var depth = K2 + z2;
        if (depth <= 0.2) continue;
        var ooz = 1 / depth;

        var gx = Math.floor((cx + K1 * ooz * x3) / CELL_W);
        var gy = Math.floor((cy - (K1 * 0.55) * ooz * y3) / CELL_H);
        if (gx < 0 || gx >= gridW || gy < 0 || gy >= gridH) continue;
        var idx = gy * gridW + gx;

        if (ooz > zbuffer[idx]) {
          zbuffer[idx] = ooz;
          var du = 0.01;
          var cosUd = Math.cos(u + du), sinUd = Math.sin(u + du);
          var cosHUd = Math.cos((u + du) * 0.5), sinHUd = Math.sin((u + du) * 0.5);
          var s2 = 1 + (v * 0.5) * cosHUd;
          var dxdu = s2 * cosUd - sx, dydu = s2 * sinUd - sy, dzdu = (v * 0.5) * sinHUd - sz;
          var dv = 0.04;
          var s3 = 1 + ((v + dv) * 0.5) * cosHU;
          var dxdv = s3 * cosU - sx, dydv = s3 * sinU - sy, dzdv = ((v + dv) * 0.5) * sinHU - sz;
          var nx = dydu * dzdv - dzdu * dydv, ny = dzdu * dxdv - dxdu * dzdv, nz = dxdu * dydv - dydu * dxdv;
          var len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
          var L = (nx / len) * 0.4 + (ny / len) * 0.35 + (nz / len) * 0.85;
          var li = Math.max(1, Math.min(CHARS.length - 1, Math.floor(L * (CHARS.length + 2))));
          output[idx] = CHARS[li] || CHARS[1];
        }
      }
    }

    ctx.font = CELL_H + 'px monospace';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(110,231,183,0.18)'; // accent green, subtle
    for (var gy2 = 0; gy2 < gridH; gy2++) {
      for (var gx2 = 0; gx2 < gridW; gx2++) {
        var id2 = gy2 * gridW + gx2;
        if (output[id2] === ' ') continue;
        ctx.fillText(output[id2], gx2 * CELL_W, gy2 * CELL_H);
      }
    }

    A += SPEED_A; B += SPEED_B;
  }

  // Render loop pauses while the hero is scrolled out of view (saves battery).
  var visible = true, raf = 0;
  function loop() {
    raf = 0;
    frame();
    if (!reduce && visible) raf = requestAnimationFrame(loop);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && !raf && !reduce) raf = requestAnimationFrame(loop);
    }).observe(canvas);
  }
  raf = requestAnimationFrame(loop);
})();
</script>`;

// Full-viewport ambient ASCII rain (ported from scrapmarket, a touch dimmer).
export const RAIN_CANVAS = '<canvas id="rain" class="rain" aria-hidden="true"></canvas>';

export const RAIN_SCRIPT = `<script>
(function () {
  var canvas = document.getElementById('rain');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var GLYPHS = '01:;.+=-~*%&#|/^';
  var CELL = 14, MAX_DROPS = 120;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var drops = [];

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    // Mobile URL-bar show/hide fires resize on scroll; ignore small height-only
    // changes so the canvas isn't cleared and reallocated mid-animation.
    if (canvas.width === w && Math.abs(canvas.height - h) < 140) return;
    canvas.width = w; canvas.height = h;
  }
  resize();
  window.addEventListener('resize', resize);

  function spawn() {
    return {
      x: Math.floor(Math.random() * (canvas.width / CELL)) * CELL,
      y: -CELL,
      speed: 0.3 + Math.random() * 0.8,
      char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      opacity: 0.015 + Math.random() * 0.05,   // a little dimmer than the original
      ttl: 200 + Math.floor(Math.random() * 400)
    };
  }

  for (var i = 0; i < 40; i++) { var d = spawn(); d.y = Math.random() * (canvas.height + 200); drops.push(d); }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = CELL + 'px monospace';
    ctx.textBaseline = 'top';

    if (drops.length < MAX_DROPS && Math.random() < 0.3) drops.push(spawn());

    for (var j = drops.length - 1; j >= 0; j--) {
      var p = drops[j];
      p.y += p.speed; p.ttl--;
      if (Math.random() < 0.02) p.char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      var fade = p.ttl < 60 ? p.ttl / 60 : 1;
      ctx.fillStyle = 'rgba(200,210,255,' + (p.opacity * fade) + ')';
      ctx.fillText(p.char, p.x, p.y);
      if (p.ttl <= 0 || p.y > canvas.height + CELL) drops.splice(j, 1);
    }

    if (!reduce) requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
</script>`;
