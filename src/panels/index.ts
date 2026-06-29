// ----------------------------------------------------------------------------
// Panel registry — the ordered list rendered into the dashboard grid.
// Add a real module here as you build it; swap out its placeholder.
// ----------------------------------------------------------------------------

import type { Panel } from "./types";
import { github } from "./github";
import { placeholder } from "./placeholder";

export const PANELS: Panel[] = [
  github,
  placeholder("leetcode", "LeetCode", "solved · difficulty · streak"),
  placeholder("shipping", "Shipping log", "projects & deploys timeline"),
  placeholder("status", "Service status", "are my deployed systems up?"),
  placeholder("x", "X / writing", "latest posts · cadence"),
  placeholder("hackathons", "Hackathons", "events & builds"),
];

export type { Panel, Env } from "./types";
