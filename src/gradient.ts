// Full-page decorative color, with all readable content on a separate layer.
export const gradientMarkup = `<div class="color-world" aria-hidden="true">
  <svg class="color-band" viewBox="0 0 1440 900" preserveAspectRatio="none">
    <defs>
      <linearGradient id="ridge-violet" x1="0" y1="0" x2="1" y2=".8">
        <stop stop-color="#ff93bd"/><stop offset=".3" stop-color="#b747ef"/><stop offset=".65" stop-color="#6846f0"/><stop offset="1" stop-color="#619af6"/>
      </linearGradient>
      <linearGradient id="ridge-rose" x1="0" y1="0" x2=".9" y2="1">
        <stop stop-color="#ff8846"/><stop offset=".35" stop-color="#f73c82"/><stop offset=".7" stop-color="#ed67ba"/><stop offset="1" stop-color="#be87ef"/>
      </linearGradient>
      <linearGradient id="ridge-gold" x1="0" y1="0" x2="1" y2=".35">
        <stop stop-color="#ff7749"/><stop offset=".38" stop-color="#ffab63"/><stop offset=".68" stop-color="#ffe192"/><stop offset="1" stop-color="#ff91a5"/>
      </linearGradient>
    </defs>
    <path fill="url(#ridge-violet)" d="M-120 410 C100 490 160 260 390 345 S780 630 1030 420 S1350 270 1560 350 L1560 1050 H-120Z"/>
    <path fill="url(#ridge-rose)" d="M-120 640 C150 420 300 490 520 645 S900 760 1100 585 S1430 520 1560 610 L1560 1050 H-120Z"/>
    <path fill="url(#ridge-gold)" d="M-120 860 C160 770 370 940 630 790 S970 660 1200 785 S1450 860 1560 730 L1560 1050 H-120Z"/>
  </svg>
  <svg class="color-grain" width="100%" height="100%"><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope="2.5" intercept="-.75"/><feFuncG type="linear" slope="2.5" intercept="-.75"/><feFuncB type="linear" slope="2.5" intercept="-.75"/></feComponentTransfer></filter><rect width="100%" height="100%" filter="url(#grain)"/></svg>
</div>`;
