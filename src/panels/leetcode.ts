// ----------------------------------------------------------------------------
// LeetCode panel (compact, single column).
//
// No official API — uses LeetCode's public GraphQL endpoint. Needs a browser-ish
// Referer/User-Agent or it 403s. The endpoint is unofficial and may block
// datacenter IPs; we degrade gracefully if so.
// ----------------------------------------------------------------------------

import type { Env, Panel, Slot } from "./types";
import { esc, cachedFetch } from "./helpers";
import { card } from "../ui";

const DEFAULT_USER = "alexfrank";

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

  async render(env: Env, slot: Slot): Promise<string> {
    const user = env.LEETCODE_USER || DEFAULT_USER;
    const s = await fetchStats(user);
    const base = { key: "leetcode", title: "LeetCode", n: slot.n, node: slot.node };

    if (!s) {
      return card({
        ...base,
        body: `<div class="note">Couldn't reach LeetCode right now. Refresh in a bit.</div>`,
        foot: `<span class="badge"><span class="dot-live">●</span> live</span>`,
      });
    }

    const row = (cls: string, label: string, n: number) =>
      `<div class="lc-row"><span class="diamond lc-dot ${cls}"></span>${label}<b>${n}</b></div>`;

    const streak =
      s.streak > 0
        ? `<span class="badge">streak · ${s.streak}d</span>`
        : `<span class="badge">no active streak</span>`;

    const handle = `<a class="badge handle" href="https://leetcode.com/u/${esc(user)}/" target="_blank" rel="noopener noreferrer">@${esc(user)}</a>`;

    return card({
      ...base,
      body: `<div class="lc-total"><b>${s.total}</b><span>solved</span></div>
      <div class="lc-breakdown">
        ${row("easy", "Easy", s.easy)}
        ${row("med", "Medium", s.medium)}
        ${row("hard", "Hard", s.hard)}
      </div>`,
      foot: `${handle}<span class="sep">·</span>${streak}`,
    });
  },
};
