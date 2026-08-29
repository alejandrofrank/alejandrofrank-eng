// ----------------------------------------------------------------------------
// Site content. This is the file you edit most — copy, numbers, panels, links.
// No HTML/CSS here; just data.
// ----------------------------------------------------------------------------

export const SITE = {
  name: "Alejandro Frank",
  location: "Madrid",
  thesis: "The wall is never the code.",
  subtitle:
    "Engineer. I take ambiguous problems and ship the ambitious version: live systems other people can depend on.",
};

// Outcomes header — the two static credibility numbers. The header module
// (header.ts) appends two LIVE signals (last shipped, now building) after these.
export const OUTCOMES: { value: string; label: string }[] = [
  { value: "7 yrs", label: "shipping production systems" },
  { value: "8+", label: "enterprise clients" },
];

// Dashboard panels now live as modules under src/panels/ (see panels/index.ts).

// Shipping log — a curated timeline you control. Newest first.
// status: "shipped" (live) · "building" (in progress) · "planned" (next up).
export type ShipStatus = "shipped" | "building" | "planned";
export interface ShipEntry {
  date: string; // free text, e.g. "Jun 2026" or "2025"
  title: string;
  status: ShipStatus;
  blurb: string;
  href?: string;
}

export const SHIPLOG: ShipEntry[] = [
  {
    date: "Jun 2026",
    title: "me.alejandrofranks.workers.dev",
    status: "shipped",
    blurb: "This dashboard: live GitHub + LeetCode panels, more landing weekly.",
    href: "https://me.alejandrofranks.workers.dev",
  },
  {
    date: "2026",
    title: "Fitness & meal-planning app", // TODO: rename once it has a name
    status: "building",
    blurb: "Personalized weekly plan from your budget + stores: shopping list, recipes, workouts.",
  },
  {
    date: "2025",
    title: "Holded MCP server",
    status: "shipped",
    blurb: "Open-source TypeScript MCP server automating invoicing via the Holded API.",
  },
];

// Bakiano (bakiano.com) — the business. Rendered as its own full-width section
// in the dashboard, directly under the GitHub panel. Static copy: no fetching,
// so edits here are the only thing that moves it.
export interface VentureDataset {
  name: string;
  blurb: string;
  /** Shipped and serving data today — badges the chip. */
  live?: boolean;
}
export interface VentureProduct {
  name: string;
  kind: string;
  blurb: string;
}

export const BAKIANO = {
  name: "Bakiano",
  href: "https://bakiano.com",
  eyebrow: "Market intelligence platform · Venezuela",
  headline: "The price of everything in Venezuela.",
  blurb:
    "An AI engine tracking tens of thousands of prices every day across supermarkets, retail, real estate and telecom — every price normalized to USD at the official BCV rate, every movement recorded.",
  stats: [
    { value: "4", label: "data domains" },
    { value: "8", label: "live sources" },
    { value: "60K+", label: "rows / snapshot" },
    { value: "Daily", label: "refresh" },
  ] as { value: string; label: string }[],
  datasets: [
    { name: "Supermarket", blurb: "8 chains, every shelf, every day", live: true },
    { name: "Retail", blurb: "catalogue + price history" },
    { name: "Real estate", blurb: "listings, comps, yields" },
    { name: "Telecom", blurb: "plans and tariffs" },
  ] as VentureDataset[],
  products: [
    { name: "Canasta", kind: "AI meal planner", blurb: "Weekly plans on your budget; picks the cheapest store per ingredient." },
    { name: "Vitrina", kind: "Real estate terminal", blurb: "Bloomberg-style terminal: fair value, yields, comp analysis." },
    { name: "OpenClaw", kind: "Data assistant", blurb: "Ask about Venezuelan prices in plain language, over live data." },
    { name: "PrecioRadar", kind: "Alert engine", blurb: "Set a target price; get pinged the moment any chain drops under it." },
  ] as VentureProduct[],
  cta: "Open bakiano.com",
};

// Nav links. `cta` promotes a link out of the quiet text row: "primary" is the
// filled pill (the one thing you want a visitor to click), "secondary" is the
// same pill outlined — louder than plain text, clearly quieter than the fill.
// At most one of each, both last so the two pills sit together on the right.
export const LINKS: { label: string; href: string; cta?: "primary" | "secondary" }[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/alejandrofrank" },
  { label: "Email", href: "mailto:alejandrofranks@gmail.com" },
  { label: "GitHub", href: "https://github.com/alejandrofrank", cta: "secondary" },
  { label: "Resume / CV", href: "/timeline", cta: "primary" },
];

// Service status board — deployed things I'm responsible for keeping up.
// Entries WITH a url get pinged (edge-cached ~60s). The entry without a url is
// this site itself: if you're reading the page, it's up by definition.
export interface ServiceEntry {
  name: string;
  /** Health/root URL to ping (GET). Omit for this site itself. */
  url?: string;
  /** Public link for the row label. */
  href?: string;
}

export const SERVICES: ServiceEntry[] = [
  { name: "this dashboard", href: "https://me.alejandrofranks.workers.dev" },
  // add services as they ship, e.g.:
  // { name: "DataMarket API", url: "https://api.example.com/health", href: "https://example.com" },
];

// Site changelog (/log) — the build-in-public journal of the site itself.
// Newest first. Every entry = a shipped change = a postable update.
export interface LogEntry {
  date: string; // e.g. "Jul 5, 2026"
  title: string;
  blurb: string;
}

export const CHANGELOG: LogEntry[] = [
  {
    date: "Aug 29, 2026",
    title: "Bakiano gets its own section",
    blurb:
      "The market-intelligence business is public, so it stops being a line in the shipping log and becomes a full-width section under the GitHub panel: the four datasets, the numbers behind them, and the four products built on top. DataMarket — its working title — retires from the log.",
  },
  {
    date: "Aug 13, 2026",
    title: "Read the experience instead of watching it",
    blurb:
      "Every role now has a 'Full text' dropdown: the summary plus every beat written out, so you can take a job in at once instead of slide by slide. The walkthrough got a pause button (clicking a dot or swiping pauses too), roles are deep-linkable at /resume#company, and ctrl-P prints the whole thing as a real 11-page CV.",
  },
  {
    date: "Jul 5, 2026",
    title: "Mobile pass + status board + this changelog",
    blurb:
      "Panels stack on phones, the timeline scrolls sideways with tilted year labels, diagrams pan instead of shrinking. Plus: service status panel, /log, og:image, and edge-caching for the GraphQL calls.",
  },
  {
    date: "Jul 2, 2026",
    title: "/timeline — the career on one line",
    blurb:
      "Gantt-style blueprint of every role since 2019, colour-coded by type. Click a company and its keynote plays in a modal.",
  },
  {
    date: "Jul 1, 2026",
    title: "/resume — roles as animated keynotes",
    blurb:
      "A Python scene DSL compiles each job into JSON; an SVG engine plays it beat by beat: sources, cores, sinks, glowing flows.",
  },
  {
    date: "Jun 29, 2026",
    title: "Live GitHub + LeetCode panels",
    blurb:
      "Contribution heatmap, streak, a daily 'shipped today' nudge, and solved-problem counts — all fetched live at the edge.",
  },
  {
    date: "Jun 29, 2026",
    title: "v0.1 — the skeleton ships",
    blurb:
      "Hono on Cloudflare Workers. Hero with ASCII Möbius + rain, outcomes header, dashboard grid. The site is the first build-in-public project.",
  },
];
