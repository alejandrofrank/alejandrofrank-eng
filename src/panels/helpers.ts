// ----------------------------------------------------------------------------
// Small shared helpers for panel modules.
// ----------------------------------------------------------------------------

/** Consistent panel header: ASCII icon + title, with optional right-side html. */
export function panelHead(icon: string, title: string, right = ""): string {
  return `<div class="panel-head"><h3><span class="panel-icon">${icon}</span>${title}</h3>${right}</div>`;
}

/** Escape user/remote-sourced strings before putting them in HTML. */
export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Compact relative time, e.g. "3h ago". */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const secs = Math.max(0, (Date.now() - then) / 1000);
  const units: [number, string][] = [
    [31536000, "y"],
    [2592000, "mo"],
    [604800, "w"],
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
  ];
  for (const [s, label] of units) {
    if (secs >= s) return `${Math.floor(secs / s)}${label} ago`;
  }
  return "just now";
}

/**
 * Edge-cached fetch. GETs use Cloudflare's built-in subrequest cache.
 * POSTs (the GraphQL calls) can't be cached that way — cf.cacheTtl only
 * applies to GET — so successful POST responses are stored manually in
 * caches.default under a synthetic GET key (per-colo, `ttl` seconds).
 */
export async function cachedFetch(url: string, init: RequestInit, ttl = 300): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  if (method === "GET") {
    return fetch(url, { ...init, cf: { cacheTtl: ttl, cacheEverything: true } } as RequestInit);
  }

  const body = typeof init.body === "string" ? init.body : "";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(url + "\n" + body));
  const hash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const key = new Request(`https://post-cache.internal/${hash}`, { method: "GET" });

  try {
    const hit = await caches.default.match(key);
    if (hit) return hit;
  } catch {
    /* cache unavailable (e.g. some local dev setups) — fall through to fetch */
  }

  const res = await fetch(url, init);
  if (!res.ok) return res;

  const text = await res.text();
  const headers = {
    "Content-Type": res.headers.get("Content-Type") ?? "application/json",
    "Cache-Control": `public, s-maxage=${ttl}`,
  };
  try {
    await caches.default.put(key, new Response(text, { status: res.status, headers }));
  } catch {
    /* best effort */
  }
  return new Response(text, { status: res.status, headers });
}

/** Standard headers GitHub's API expects (it rejects requests without UA). */
export function ghHeaders(token?: string): Record<string, string> {
  const h: Record<string, string> = {
    "User-Agent": "alejandrofrank-eng-worker",
    Accept: "application/vnd.github+json",
  };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}
