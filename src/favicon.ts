// ----------------------------------------------------------------------------
// Inline SVG favicon: a chamfered cream tile with the ">_" prompt — the
// caret in near-black, the underscore in the site orange.
// Embedded as a data URI so there's no separate asset to serve.
// ----------------------------------------------------------------------------

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path d="M5 0h22l5 5v22l-5 5H5l-5-5V5z" fill="#e9e2d3"/>
  <path d="M9 10 16 16 9 22" fill="none" stroke="#16150f" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="18" y="20" width="6.5" height="2.8" fill="#f4551d"/>
</svg>`;

export const FAVICON = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${encodeURIComponent(
  SVG
)}">`;
