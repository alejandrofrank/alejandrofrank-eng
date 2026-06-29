// ----------------------------------------------------------------------------
// Small shared helpers for panel modules.
// ----------------------------------------------------------------------------

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

/** Edge-cached GET (Cloudflare caches the subrequest for `ttl` seconds). */
export function cachedFetch(url: string, init: RequestInit, ttl = 300): Promise<Response> {
  return fetch(url, { ...init, cf: { cacheTtl: ttl, cacheEverything: true } } as RequestInit);
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
