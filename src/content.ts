// ----------------------------------------------------------------------------
// Site content. This is the file you edit most — copy, numbers, panels, links.
// No HTML/CSS here; just data.
// ----------------------------------------------------------------------------

export const SITE = {
  name: "Alejandro Frank",
  location: "Madrid",
  thesis: "The wall is never the code.",
  subtitle:
    "Forward-deployed engineer. I take ambiguous problems and ship the ambitious version: live systems other people can depend on.",
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
    title: "DataMarket",
    status: "building",
    blurb: "Live retail-pricing platform: daily data from 22 retailers, LLM enrichment layer.",
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

export const LINKS: { label: string; href: string }[] = [
  { label: "GitHub", href: "https://github.com/alejandrofrank" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/alejandrofrank" },
  { label: "Email", href: "mailto:alejandrofranks@gmail.com" },
];
