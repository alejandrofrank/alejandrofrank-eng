// ----------------------------------------------------------------------------
// Service status panel — pings the deployed services listed in content.ts
// (SERVICES) and shows an up/down mark per service. Pings are edge-cached for
// ~60s so a page-view storm can't hammer the services themselves.
//
// The site itself is listed without a url: a worker can't fetch its own route
// (Cloudflare blocks self-requests), and if this page rendered, it's up.
// ----------------------------------------------------------------------------

import type { Env, Panel, Slot } from "./types";
import { SERVICES, type ServiceEntry } from "../content";
import { esc, cachedFetch } from "./helpers";
import { card } from "../ui";

const PING_TIMEOUT_MS = 5000;

async function ping(url: string): Promise<boolean> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), PING_TIMEOUT_MS);
  try {
    const res = await cachedFetch(
      url,
      { signal: ctrl.signal, headers: { "User-Agent": "alejandrofrank-eng-statusboard" } },
      60
    );
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

function row(e: ServiceEntry, up: boolean, self: boolean): string {
  const name = e.href
    ? `<a class="svc-name" href="${esc(e.href)}" target="_blank" rel="noopener noreferrer">${esc(e.name)}</a>`
    : `<span class="svc-name">${esc(e.name)}</span>`;
  const state = self
    ? `<b class="svc-state up">up · serving this page</b>`
    : up
      ? `<b class="svc-state up">up</b>`
      : `<b class="svc-state down">down</b>`;
  return `<div class="svc-row"><span class="diamond svc-dot ${up ? "up" : "down"}"></span>${name}${state}</div>`;
}

export const status: Panel = {
  key: "status",
  title: "Service status",

  async render(_env: Env, slot: Slot): Promise<string> {
    const results = await Promise.all(
      SERVICES.map(async (e) => {
        const self = !e.url;
        const up = self ? true : await ping(e.url!);
        return { e, up, self };
      })
    );

    const allUp = results.every((r) => r.up);
    const badge = allUp
      ? '<span class="badge up">all systems up</span>'
      : '<span class="badge down">degraded</span>';

    return card({
      key: "status",
      title: "Service status",
      n: slot.n,
      node: slot.node,
      body: `<div class="svc">${results.map((r) => row(r.e, r.up, r.self)).join("")}</div>`,
      foot: `${badge}<span class="sep">·</span><span class="badge">edge · cached ~60s</span>`,
    });
  },
};
