// ----------------------------------------------------------------------------
// "Coming soon" panel — a stub until a real module replaces it.
// ----------------------------------------------------------------------------

import type { Panel } from "./types";
import { card } from "../ui";

export function placeholder(key: string, title: string, note: string): Panel {
  return {
    key,
    title,
    async render(_env, slot) {
      return card({
        key,
        title,
        n: slot.n,
        node: slot.node,
        body: `<div class="note">${note}</div>`,
        foot: `<span class="badge">coming soon</span>`,
      });
    },
  };
}
