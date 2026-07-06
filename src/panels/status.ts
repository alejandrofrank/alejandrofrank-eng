// ----------------------------------------------------------------------------
// Service status panel — pings the deployed services listed in content.ts
// (SERVICES) and shows an up/down dot per service. Pings are edge-cached for
// ~60s so a page-view storm can't hammer the services themselves.
//
// The site itself is listed without a url: a worker can't fetch its own route
// (Cloudflare blocks self-requests), and if this page rendered, it's up.
// ----------------------------------------------------------------------------

import type { Env, Panel } from "./types";
import { SERVICES, type ServiceEntry } from "../content";
import { esc, cachedFetch, panelHead } from "./helpers";

const ICON = "◉";
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
  return `<div class="svc-row"><span class="svc-dot ${up ? "up" : "down"}"></span>${name}${state}</div>`;
}

export const status: Panel = {
  key: "status",
  title: "Service status",

  async render(_env: Env): Promise<string> {
    const results = await Promise.all(
      SERVICES.map(async (e) => {
        const self = !e.url;
        const up = self ? true : await ping(e.url!);
        return { e, up, self };
      })
    );

    const allUp = results.every((r) => r.up);
    const badge = allUp
      ? '<span class="badge svc-all up">all systems up</span>'
      : '<span class="badge svc-all down">degraded</span>';

    return `<div class="panel" id="status">
      ${panelHead(ICON, "Service status", badge)}
      <div class="svc">${results.map((r) => row(r.e, r.up, r.self)).join("")}</div>
      <div class="svc-note">checked from the edge · cached ~60s</div>
    </div>`;
  },
};
