// Full-page decorative color, with all readable content on a separate layer.
export const gradientMarkup = `<div class="color-world" aria-hidden="true">
  <div class="color-band"></div>
  <svg class="color-grain" width="100%" height="100%"><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#grain)" opacity=".18"/></svg>
</div>`;
