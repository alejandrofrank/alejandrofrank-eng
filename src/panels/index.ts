// ----------------------------------------------------------------------------
// Panel registry — the ordered list rendered into the dashboard grid.
// Add a real module here as you build it; swap out its placeholder.
// ----------------------------------------------------------------------------

import type { Panel } from "./types";
import { github } from "./github";
import { bakiano } from "./bakiano";
import { leetcode } from "./leetcode";
import { shipping } from "./shipping";
import { status } from "./status";
import { placeholder } from "./placeholder";

export const PANELS: Panel[] = [
  github,
  // Full-width venture section — sits directly under the GitHub card.
  bakiano,
  leetcode,
  shipping,
  status,
  placeholder("x", "X / writing", "latest posts · cadence", "✎"),
  placeholder("hackathons", "Hackathons", "events & builds", "◆"),
];

export type { Panel, Env } from "./types";
