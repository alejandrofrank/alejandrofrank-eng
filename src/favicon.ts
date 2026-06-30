// ----------------------------------------------------------------------------
// Inline SVG favicon: a terminal prompt ">_" in accent green on a dark tile.
// Embedded as a data URI so there's no separate asset to serve.
// ----------------------------------------------------------------------------

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#0a0a0b"/>
  <path d="M9 10 L16 16 L9 22" fill="none" stroke="#6ee7b7" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="18" y="20" width="6.5" height="2.8" rx="1.4" fill="#6ee7b7"/>
</svg>`;

export const FAVICON = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${encodeURIComponent(
  SVG
)}">`;
