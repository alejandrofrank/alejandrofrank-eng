// ----------------------------------------------------------------------------
// LeetCode panel (compact, single column).
//
// No official API — uses LeetCode's public GraphQL endpoint. Needs a browser-ish
// Referer/User-Agent or it 403s. The endpoint is unofficial and may block
// datacenter IPs; we degrade gracefully if so.
// ----------------------------------------------------------------------------

import type { Env, Panel } from "./types";
import { esc, cachedFetch, panelHead } from "./helpers";

const DEFAULT_USER = "alexfrank";
const ICON = "λ";

interface LCStats {
  user: string;
  total: number;
  easy: number;
  medium: number;
  hard: number;
  streak: number;
}

async function fetchStats(user: string): Promise<LCStats | null> {
  const query = `query($u:String!){matchedUser(username:$u){username submitStatsGlobal{acSubmissionNum{difficulty count}} userCalendar{streak}}}`;
  const res = await cachedFetch(
    "https://leetcode.com/graphql",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
        "User-Agent": "Mozilla/5.0 (compatible; alejandrofrank-eng-worker)",
      },
      body: JSON.stringify({ query, variables: { u: user } }),
    },
    300
  );
  if (!res.ok) return null;

  const json = (await res.json()) as any;
  const m = json?.data?.matchedUser;
  if (!m) return null;

  const nums = (m.submitStatsGlobal?.acSubmissionNum ?? []) as any[];
  const by = (d: string) => nums.find((n) => n.difficulty === d)?.count ?? 0;

  return {
    user: m.username ?? user,
    total: by("All"),
    easy: by("Easy"),
    medium: by("Medium"),
    hard: by("Hard"),
    streak: m.userCalendar?.streak ?? 0,
  };
}

export const leetcode: Panel = {
  key: "leetcode",
  title: "LeetCode",

  async render(env: Env): Promise<string> {
    const user = env.LEETCODE_USER || DEFAULT_USER;
    const s = await fetchStats(user);

    if (!s) {
      return `<div class="panel" id="leetcode">
        ${panelHead(ICON, "LeetCode", '<span class="badge">● live</span>')}
        <div class="note">Couldn't reach LeetCode right now. Refresh in a bit.</div>
      </div>`;
    }

    const row = (cls: string, label: string, n: number) =>
      `<div class="lc-row"><span class="lc-dot ${cls}"></span>${label}<b>${n}</b></div>`;

    const streakLine =
      s.streak > 0
        ? `<div class="lc-streak">current streak · ${s.streak}d</div>`
        : `<div class="lc-streak">no active streak yet</div>`;

    const badge = `<a class="badge" href="https://leetcode.com/u/${esc(user)}/">@${esc(user)}</a>`;

    return `<div class="panel" id="leetcode">
      ${panelHead(ICON, "LeetCode", badge)}
      <div class="lc-total"><b>${s.total}</b><span>solved</span></div>
      <div class="lc-breakdown">
        ${row("easy", "Easy", s.easy)}
        ${row("med", "Medium", s.medium)}
        ${row("hard", "Hard", s.hard)}
      </div>
      ${streakLine}
    </div>`;
  },
};
