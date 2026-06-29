// ----------------------------------------------------------------------------
// Shipping log panel — a curated timeline. Data lives in content.ts (SHIPLOG),
// so updating it is a one-line edit, no fetching.
// ----------------------------------------------------------------------------

import type { Env, Panel } from "./types";
import { SHIPLOG, type ShipEntry } from "../content";
import { esc, panelHead } from "./helpers";

const ICON = "▸";

function item(e: ShipEntry): string {
  const title = e.href
    ? `<a class="ship-title" href="${esc(e.href)}">${esc(e.title)}</a>`
    : `<span class="ship-title">${esc(e.title)}</span>`;
  return `<li class="ship-item">
    <div class="ship-row">
      <span class="ship-dot ${e.status}" title="${e.status}"></span>
      ${title}
      <span class="ship-date">${esc(e.date)}</span>
    </div>
    <div class="ship-blurb">${esc(e.blurb)}</div>
  </li>`;
}

export const shipping: Panel = {
  key: "shipping",
  title: "Shipping log",

  async render(_env: Env): Promise<string> {
    return `<div class="panel" id="shipping">
      ${panelHead(ICON, "Shipping log", '<span class="badge">building in public</span>')}
      <ul class="ship">${SHIPLOG.map(item).join("")}</ul>
    </div>`;
  },
};
