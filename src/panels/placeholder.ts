// ----------------------------------------------------------------------------
// "Coming soon" panel — a stub until a real module replaces it.
// ----------------------------------------------------------------------------

import type { Panel } from "./types";

export function placeholder(key: string, title: string, note: string): Panel {
  return {
    key,
    title,
    async render() {
      return `<div class="panel" id="${key}">
        <div class="panel-head"><h3>${title}</h3><span class="badge">coming soon</span></div>
        <div class="note">${note}</div>
      </div>`;
    },
  };
}
