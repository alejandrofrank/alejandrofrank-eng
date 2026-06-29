// ----------------------------------------------------------------------------
// Panel registry — the ordered list rendered into the dashboard grid.
// Add a real module here as you build it; swap out its placeholder.
// ----------------------------------------------------------------------------

import type { Panel } from "./types";
import { github } from "./github";
import { leetcode } from "./leetcode";
import { placeholder } from "./placeholder";

export const PANELS: Panel[] = [
  github,
  leetcode,
  placeholder("shipping", "Shipping log", "projects & deploys timeline"),
  placeholder("status", "Service status", "are my deployed systems up?"),
  placeholder("x", "X / writing", "latest posts · cadence"),
  placeholder("hackathons", "Hackathons", "events & builds"),
];

export type { Panel, Env } from "./types";
