// ----------------------------------------------------------------------------
// GitHub activity panel.
//
// No token:  public REST API → repos, followers, recent commits (last 7d),
//            latest push. Works out of the box.
// With token (GITHUB_TOKEN secret): also pulls the GraphQL contribution
//            calendar → year total, current streak, and the heatmap.
// ----------------------------------------------------------------------------

import type { Env, Panel } from "./types";
import { esc, timeAgo, cachedFetch, ghHeaders, panelHead } from "./helpers";

const ICON = "▦";

const DEFAULT_USER = "alejandrofrank";

interface Profile {
  login: string;
  public_repos: number;
  followers: number;
  html_url: string;
}

interface LatestRepo {
  repo: string;
  when: string;
}

interface Calendar {
  total: number;
  streak: number;
  todayCount: number;
  weeks: { days: { count: number; date: string }[] }[];
}

// --- Data fetching -----------------------------------------------------------

async function fetchProfile(user: string, env: Env): Promise<Profile | null> {
  const res = await cachedFetch(
    `https://api.github.com/users/${user}`,
    { headers: ghHeaders(env.GITHUB_TOKEN) },
    300
  );
  if (!res.ok) return null;
  return (await res.json()) as Profile;
}

// Most-recently-pushed repo (owned + public only — used as a fallback).
async function fetchLatestRepo(user: string, env: Env): Promise<LatestRepo | null> {
  const res = await cachedFetch(
    `https://api.github.com/users/${user}/repos?sort=pushed&direction=desc&per_page=1`,
    { headers: ghHeaders(env.GITHUB_TOKEN) },
    300
  );
  if (!res.ok) return null;
  const repos = (await res.json()) as any[];
  const r = repos?.[0];
  if (!r) return null;
  return { repo: r.full_name as string, when: r.pushed_at as string };
}

// The user's most recent push across ALL repos — own, org, and (with the
// user's own token) private. The events feed tracks pushes the user made,
// unlike /users/:u/repos which only sees repos they own publicly. Falls back
// to the latest-pushed owned repo if the feed is empty or unreachable.
async function fetchLatestPushISO(user: string, env: Env): Promise<string | null> {
  const res = await cachedFetch(
    `https://api.github.com/users/${user}/events?per_page=100`,
    { headers: ghHeaders(env.GITHUB_TOKEN) },
    300
  );
  if (res.ok) {
    const events = (await res.json()) as any[];
    const push = events?.find((e) => e?.type === "PushEvent");
    if (push?.created_at) return push.created_at as string;
  }
  const repo = await fetchLatestRepo(user, env);
  return repo?.when ?? null;
}

async function fetchCalendar(user: string, env: Env): Promise<Calendar | null> {
  if (!env.GITHUB_TOKEN) return null; // GraphQL requires auth

  const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}`;
  const res = await cachedFetch(
    "https://api.github.com/graphql",
    {
      method: "POST",
      headers: { ...ghHeaders(env.GITHUB_TOKEN), "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { login: user } }),
    },
    300
  );
  if (!res.ok) return null;

  const json = (await res.json()) as any;
  const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!cal) return null;

  const weeks = (cal.weeks as any[]).map((w) => ({
    days: (w.contributionDays as any[]).map((d) => ({
      count: d.contributionCount as number,
      date: d.date as string,
    })),
  }));

  // Current streak: consecutive days with >0, counting back from the most
  // recent day (today may legitimately be 0, so skip a single trailing zero).
  const days = weeks.flatMap((w) => w.days);
  let streak = 0;
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--; // today not yet committed — don't break streak
  for (; i >= 0; i--) {
    if (days[i].count > 0) streak++;
    else break;
  }

  // Last day in the calendar is today (UTC).
  const todayCount = days.length ? days[days.length - 1].count : 0;

  return { total: cal.totalContributions, streak, todayCount, weeks };
}

/** Shared with the topline header: "last shipped" signal. Edge-cached. */
export async function latestPushAgo(env: Env): Promise<string | null> {
  const user = env.GITHUB_USER || DEFAULT_USER;
  const when = await fetchLatestPushISO(user, env);
  return when ? timeAgo(when) : null;
}

// --- Rendering ---------------------------------------------------------------

function heatColor(count: number): string {
  if (count <= 0) return "var(--hm0)";
  if (count <= 2) return "var(--hm1)";
  if (count <= 4) return "var(--hm2)";
  if (count <= 7) return "var(--hm3)";
  return "var(--hm4)";
}

function statChip(value: string, label: string): string {
  return `<div class="stat"><b>${value}</b><span>${label}</span></div>`;
}

function renderHeatmap(cal: Calendar): string {
  const cols = cal.weeks
    .map(
      (w) =>
        `<div class="hm-col">${w.days
          .map(
            (d) =>
              `<span class="hm-d" style="background:${heatColor(
                d.count
              )}" title="${d.date}: ${d.count}"></span>`
          )
          .join("")}</div>`
    )
    .join("");
  return `<div class="hm">${cols}</div>`;
}

export const github: Panel = {
  key: "github",
  title: "GitHub activity",

  async render(env: Env): Promise<string> {
    const user = env.GITHUB_USER || DEFAULT_USER;

    const [profile, latestPush, cal] = await Promise.all([
      fetchProfile(user, env),
      fetchLatestPushISO(user, env),
      fetchCalendar(user, env),
    ]);

    // Total failure (rate-limited / offline): keep the card, show a soft note.
    if (!profile) {
      return `<div class="panel span2" id="github">
        ${panelHead(ICON, "GitHub activity", '<span class="badge">● live</span>')}
        <div class="note">Couldn't reach GitHub right now. Refresh in a bit.</div>
      </div>`;
    }

    const chips: string[] = [];
    if (cal) {
      chips.push(statChip(cal.total.toLocaleString(), "contributions / yr"));
      chips.push(statChip(`${cal.streak}d`, "current streak"));
    }
    chips.push(statChip(String(profile.public_repos), "public repos"));
    chips.push(statChip(String(profile.followers), "followers"));

    // Daily nudge: amber/empty until today has a commit, then flips green.
    const today = cal
      ? cal.todayCount > 0
        ? `<div class="gh-today on">✓ shipped today · ${cal.todayCount}</div>`
        : `<div class="gh-today off">○ nothing shipped today yet</div>`
      : "";

    const heatmap = cal ? renderHeatmap(cal) : "";

    // Intentionally no repo name/link here: the last-pushed repo can be a
    // private/client repo, so we surface recency only, never the name.
    const latestLine = latestPush
      ? `<div class="gh-latest">↳ last push · ${timeAgo(latestPush)}</div>`
      : "";

    const badge = `<a class="badge" href="${esc(profile.html_url)}" target="_blank" rel="noopener noreferrer">@${esc(profile.login)}</a>`;

    return `<div class="panel span2" id="github">
      ${panelHead(ICON, "GitHub activity", badge)}
      <div class="stats">${chips.join("")}</div>
      ${today}
      ${heatmap}
      ${latestLine}
    </div>`;
  },
};
