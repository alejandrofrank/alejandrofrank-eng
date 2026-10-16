// Original SVG artwork. Each cabinet's screen hints at the underlying project.
export const STATION_ART: Record<string, { color: string; short: string; screen: string }> = {
  bakiano: { color: '#f6b56b', short: 'MARKET RUN', screen: `<path d="M40 88h68l-7 28H48z" fill="none" stroke="currentColor" stroke-width="3"/><path d="m34 79 8 0 9 40h49M54 82V68h15v14M78 83V61h17v22" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="57" cy="128" r="4" fill="currentColor"/><circle cx="94" cy="128" r="4" fill="currentColor"/><path d="M108 60h12m-6-6v12" stroke="#fff1c6" stroke-width="2"/>` },
  'gcp-ingestion-lab': { color: '#87b8f8', short: 'DELIVERY ROOM', screen: `<g fill="none" stroke="currentColor" stroke-width="2"><path d="m40 69 13-7 13 7-13 7zm0 0v18l13 7 13-7V69M53 76v18m28-9 13-7 13 7-13 7zm0 0v18l13 7 13-7V85M94 92v18M38 120h66m-6-5 6 5-6 5"/></g><path d="m86 61 5 5 10-11" fill="none" stroke="#d8f1a1" stroke-width="3"/>` },
  'catalog-match-lab': { color: '#b9e58a', short: 'MATCH / MISMATCH', screen: `<g fill="none" stroke="currentColor" stroke-width="2"><path d="M37 75h22l5 8v38H33V83zm0 0v-9h22v9M36 94h25M90 81h22v37H86V87zm0 0v-9h18v9M89 97h20"/></g><path d="m68 93 5 5 9-12" fill="none" stroke="#f6efc8" stroke-width="3"/><path d="M40 105h15M93 106h12" stroke="currentColor" stroke-width="4"/>` },
  'bigquery-query-guard': { color: '#eee384', short: 'QUERY BUDGET', screen: `<path d="m38 68 10 8-10 8M55 84h18" fill="none" stroke="currentColor" stroke-width="3"/><g fill="currentColor"><path opacity=".3" d="M36 103h80v8H36z"/><path d="M36 103h25v8H36zM36 119h49v5H36z"/></g><path d="m98 63-9 18h11l-7 13 18-20h-12l7-11z" fill="#f8f1c8"/>` },
  'ascii-art': { color: '#c5a2f6', short: 'PIXEL WORKSHOP', screen: `<g shape-rendering="crispEdges"><path d="M58 61h30v6H58zM46 67h54v6H46zM40 73h66v6H40zM34 79h78v18H34zM40 97h66v6H40zM52 103h42v18H52zM46 121h54v6H46z" fill="currentColor"/><path d="M46 73h12v12H46zM82 79h18v12H82zM64 67h12v6H64zM64 103h18v18H64z" fill="#f7eac8"/><path d="M58 109h6v6h-6zM82 109h6v6h-6z" fill="#201b36"/></g>` },
  vesti: { color: '#eea1b4', short: 'OUTFIT PUZZLE', screen: `<path d="m54 65-21 14 12 17 9-6v36h43V90l9 6 12-17-21-14-12 8H66z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M64 68q12 26 23 0M75 86v36" fill="none" stroke="currentColor" stroke-width="2"/><path d="m108 110 4 8 8 4-8 4-4 8-4-8-8-4 8-4z" fill="#f8e7c7"/>` },
};

export function cabinetArt(slug: string, number: string): string {
  const art = STATION_ART[slug];
  return `<svg class="cabinet" viewBox="0 0 160 244" aria-hidden="true">
    <ellipse class="cabinet-shadow" cx="80" cy="231" rx="68" ry="10" fill="#000" opacity=".4"/>
    <path d="m119 16 22 14-6 102 12 19-5 72-23 12-4-82z" fill="#151522" stroke="#080a11" stroke-width="3"/>
    <path d="m123 24 12 8-4 94-10 6z" fill="currentColor" opacity=".24"/>
    <path d="M23 16h96l-5 112 15 20-10 87H23l-9-87 15-20z" fill="#262536" stroke="#080a11" stroke-width="3"/>
    <path d="M23 16h96v30H23z" fill="currentColor"/>
    <path d="M28 22h86v19H28z" fill="#10141d"/>
    <text x="71" y="34" text-anchor="middle" fill="currentColor" font-size="7.1" font-weight="700" font-family="monospace">${art.short}</text>
    <path d="M28 48h86l-4 83H32z" fill="#0b0f16" stroke="#535364"/>
    <path class="screen-wash" d="M33 54h75l-3 71H36z" fill="currentColor" opacity=".07"/>
    <g class="screen-art">${art.screen}</g>
    <path d="M35 57h69M35 61h69M35 65h69M35 69h69M35 73h69M35 77h69M35 81h69M35 85h69M35 89h69M35 93h69M35 97h69M35 101h69M35 105h69M35 109h69M35 113h69M35 117h69M35 121h69" stroke="#10141d" stroke-width="1" opacity=".25"/>
    <path d="m29 134 85 0 12 15H17z" fill="currentColor" opacity=".7"/>
    <path d="M17 151h109l-2 9H19z" fill="#11131f"/>
    <ellipse cx="47" cy="145" rx="11" ry="3" fill="#151522"/><path d="M47 144v-11" stroke="#d5d9df" stroke-width="3"/><circle cx="47" cy="131" r="5" fill="currentColor" stroke="#11131f" stroke-width="2"/>
    <ellipse cx="84" cy="143" rx="5" ry="3" fill="#f5e9cb"/><ellipse cx="101" cy="141" rx="5" ry="3" fill="currentColor"/>
    <path d="m25 165 90 0-7 59H31z" fill="#191a27"/>
    <path d="m31 180 28 44h11l-39-59zm39-15 36 59h7l-35-59z" fill="currentColor" opacity=".15"/>
    <rect x="62" y="175" width="22" height="29" rx="2" fill="#0c0e17" stroke="#484455"/>
    <path d="M69 183h9" stroke="currentColor" stroke-width="3"/><circle cx="74" cy="196" r="2" fill="currentColor"/>
    <text x="43" y="217" fill="currentColor" font-size="9" font-family="monospace">${number}</text>
    <path d="M23 228h96" stroke="currentColor" stroke-width="2" opacity=".6"/>
    <path d="M23 16v30m0 3 5 78-14 21 9 87" fill="none" stroke="currentColor" stroke-width="2" opacity=".55"/>
  </svg>`;
}

// A fictional player character, not a portrait. Limbs move only during navigation.
export const PLAYER = `<svg class="player-sprite" viewBox="0 0 28 38" aria-hidden="true" shape-rendering="crispEdges">
  <ellipse cx="14" cy="36" rx="13" ry="2" fill="#05080d" opacity=".6"/>
  <g class="player-body"><path fill="#30273d" d="M8 4h13v14H8zM6 8h3v7H6z"/><path fill="#e5ac83" d="M9 8h12v9H9zM11 17h7v4h-7z"/>
  <path fill="#1c1722" d="M8 4h12v5H8zM18 8h3v3h-3zM17 11h2v2h-2zM12 15h9v3h-9z"/>
  <path fill="#bbdda0" d="M8 3h12v3H8zM6 6h18v3H6z"/><path fill="#536c4e" d="M8 4h3v2H8z"/>
  <path fill="#96c9a2" d="M8 20h12v10H8zM5 21h3v8H5zM20 21h3v7h-3z"/><path fill="#dbe4bf" d="M12 20h3v10h-3z"/>
  <path fill="#35494f" d="M4 20h5v10H4z"/><path fill="#e5ac83" d="M5 29h3v3H5zM20 28h3v3h-3z"/>
  </g><g class="player-leg left"><path fill="#7777a6" d="M9 30h5v5H9z"/><path fill="#f0e7ce" d="M8 35h6v2H8z"/></g><g class="player-leg right"><path fill="#585c84" d="M16 30h5v5h-5z"/><path fill="#f0e7ce" d="M16 35h7v2h-7z"/></g>
</svg>`;
