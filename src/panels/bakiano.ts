// ----------------------------------------------------------------------------
// Bakiano — the venture section.
//
// Not a panel in the usual sense: it takes the full grid width directly under
// the GitHub card and gets its own louder treatment (accent hairline, tinted
// ground) so a real business doesn't read as one more dashboard tile.
// All copy lives in content.ts (BAKIANO); nothing is fetched.
// ----------------------------------------------------------------------------

import type { Env, Panel } from "./types";
import { BAKIANO, type VentureDataset, type VentureProduct } from "../content";
import { esc } from "./helpers";

function stat(s: { value: string; label: string }): string {
  return `<div class="stat"><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`;
}

function dataset(d: VentureDataset): string {
  return `<div class="vset${d.live ? " live" : ""}">
    <div class="vset-name">${esc(d.name)}${d.live ? '<span class="vset-live">live</span>' : ""}</div>
    <div class="vset-blurb">${esc(d.blurb)}</div>
  </div>`;
}

function product(p: VentureProduct): string {
  return `<li class="vprod">
    <div class="vprod-head"><b>${esc(p.name)}</b><span>${esc(p.kind)}</span></div>
    <div class="vprod-blurb">${esc(p.blurb)}</div>
  </li>`;
}

export const bakiano: Panel = {
  key: "bakiano",
  title: BAKIANO.name,

  async render(_env: Env): Promise<string> {
    const host = BAKIANO.href.replace(/^https?:\/\//, "");

    return `<section class="venture" id="bakiano" aria-labelledby="venture-name">
      <div class="venture-top">
        <span class="tag">${esc(BAKIANO.eyebrow)}</span>
        <span class="badge venture-badge">● shipped</span>
      </div>

      <h3 class="venture-name" id="venture-name">
        <a href="${esc(BAKIANO.href)}" target="_blank" rel="noopener noreferrer">${esc(BAKIANO.name)}</a>
        <span class="venture-host">${esc(host)}</span>
      </h3>
      <p class="venture-headline">${esc(BAKIANO.headline)}</p>
      <p class="venture-blurb">${esc(BAKIANO.blurb)}</p>

      <div class="stats venture-stats">${BAKIANO.stats.map(stat).join("")}</div>

      <div class="venture-label">Datasets</div>
      <div class="vsets">${BAKIANO.datasets.map(dataset).join("")}</div>

      <div class="venture-label">Built on it</div>
      <ul class="vprods">${BAKIANO.products.map(product).join("")}</ul>

      <a class="venture-cta" href="${esc(BAKIANO.href)}" target="_blank" rel="noopener noreferrer">
        ${esc(BAKIANO.cta)} <span class="cta-arrow" aria-hidden="true">↗</span>
      </a>
    </section>`;
  },
};
