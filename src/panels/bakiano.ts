// ----------------------------------------------------------------------------
// Bakiano — the venture card.
//
// Takes the full grid width directly under the GitHub card and is the one
// orange card on the page: a real business shouldn't read as one more tile.
// All copy lives in content.ts (BAKIANO); nothing is fetched.
// ----------------------------------------------------------------------------

import type { Env, Panel, Slot } from "./types";
import { BAKIANO, type VentureDataset, type VentureFeature } from "../content";
import { esc } from "./helpers";
import { card, DIAMOND } from "../ui";
import { bakianoTechnical } from "./technical";

function stat(s: { value: string; label: string }): string {
  return `<div class="stat"><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`;
}

function dataset(d: VentureDataset): string {
  const flag = d.live
    ? '<span class="vset-flag live">live</span>'
    : d.soon
      ? '<span class="vset-flag soon">soon</span>'
      : "";
  return `<div class="vset chamfer">
    <div class="vset-name">${esc(d.name)}${flag}</div>
    <div class="vset-blurb">${esc(d.blurb)}</div>
  </div>`;
}

function feature(f: VentureFeature): string {
  return `<li class="vprod">
    <div class="vprod-head"><b>${esc(f.name)}</b><span>${esc(f.kind)}</span></div>
    <div class="vprod-blurb">${esc(f.blurb)}</div>
  </li>`;
}

export const bakiano: Panel = {
  key: "bakiano",
  title: BAKIANO.name,
  span: 2,

  async render(_env: Env, slot: Slot): Promise<string> {
    const host = BAKIANO.href.replace(/^https?:\/\//, "");

    const body = `<div class="v-eyebrow label">${esc(BAKIANO.eyebrow)}</div>
      <p class="v-headline">${esc(BAKIANO.headline)}</p>
      <p class="v-blurb">${esc(BAKIANO.blurb)}</p>

      <div class="stats v-stats">${BAKIANO.stats.map(stat).join("")}</div>

      <div class="v-label">${DIAMOND}<span>Datasets</span><span class="leader"></span></div>
      <div class="vsets">${BAKIANO.datasets.map(dataset).join("")}</div>

      <div class="v-label">${DIAMOND}<span>Inside the workspace</span><span class="leader"></span>
        <span class="v-note">${esc(BAKIANO.workspaceNote)}</span>
      </div>
      <ul class="vprods">${BAKIANO.features.map(feature).join("")}</ul>
      ${bakianoTechnical()}`;

    const foot = `<a class="badge strong" href="${esc(BAKIANO.href)}" target="_blank" rel="noopener noreferrer">${esc(BAKIANO.cta)} ↗</a><span class="sep">·</span><span class="badge">${esc(host)}</span><span class="sep">·</span><span class="badge"><span class="dot-live">●</span> shipped</span>`;

    return card({
      key: "bakiano",
      title: BAKIANO.name,
      n: slot.n,
      node: slot.node,
      span2: true,
      tone: "orange",
      body,
      foot,
    });
  },
};
