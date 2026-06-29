// ----------------------------------------------------------------------------
// "Coming soon" panel — a stub until a real module replaces it.
// ----------------------------------------------------------------------------

import type { Panel } from "./types";
import { panelHead } from "./helpers";

export function placeholder(key: string, title: string, note: string, icon = "·"): Panel {
  return {
    key,
    title,
    async render() {
      return `<div class="panel" id="${key}">
        ${panelHead(icon, title, '<span class="badge">coming soon</span>')}
        <div class="note">${note}</div>
      </div>`;
    },
  };
}
