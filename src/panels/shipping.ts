// ----------------------------------------------------------------------------
// Shipping log panel — a curated timeline. Data lives in content.ts (SHIPLOG),
// so updating it is a one-line edit, no fetching.
// ----------------------------------------------------------------------------

import type { Env, Panel, Slot } from "./types";
import { SHIPLOG, type ShipEntry } from "../content";
import { esc } from "./helpers";
import { card } from "../ui";

function item(e: ShipEntry): string {
  const title = e.href
    ? `<a class="ship-title" href="${esc(e.href)}" target="_blank" rel="noopener noreferrer">${esc(e.title)}</a>`
    : `<span class="ship-title">${esc(e.title)}</span>`;
  return `<li class="ship-item">
    <div class="ship-row">
      <span class="diamond ship-dot ${e.status}" title="${e.status}"></span>
      ${title}
      <span class="ship-date">${esc(e.date)}</span>
    </div>
    <div class="ship-blurb">${esc(e.blurb)}</div>
  </li>`;
}

export const shipping: Panel = {
  key: "shipping",
  title: "Shipping log",

  async render(_env: Env, slot: Slot): Promise<string> {
    return card({
      key: "shipping",
      title: "Shipping log",
      n: slot.n,
      node: slot.node,
      body: `<ul class="ship">${SHIPLOG.map(item).join("")}</ul>`,
      foot: `<span class="badge">building in public</span>`,
    });
  },
};
