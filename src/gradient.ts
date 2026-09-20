// Full-page decorative color, with all readable content on a separate layer.
export const gradientMarkup = `<div class="color-world" aria-hidden="true">
  <div class="color-band"><i></i><i></i><i></i></div>
  <svg class="color-grain" width="100%" height="100%"><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope="2.5" intercept="-.75"/><feFuncG type="linear" slope="2.5" intercept="-.75"/><feFuncB type="linear" slope="2.5" intercept="-.75"/></feComponentTransfer></filter><rect width="100%" height="100%" filter="url(#grain)"/></svg>
</div>`;
