// ----------------------------------------------------------------------------
// Topline outcomes header: two static credibility numbers (from content.ts)
// followed by two LIVE signals so the header itself stays in motion.
// ----------------------------------------------------------------------------

import { OUTCOMES, SHIPLOG } from "./content";
import { latestPushAgo } from "./panels/github";
import type { Env } from "./panels/types";

export interface Outcome {
  value: string;
  label: string;
}

export async function buildOutcomes(env: Env): Promise<Outcome[]> {
  const building = SHIPLOG.filter((e) => e.status === "building").length;
  const pushAgo = await latestPushAgo(env);

  return [
    ...OUTCOMES,
    { value: pushAgo ?? "n/a", label: "last shipped" },
    { value: String(building), label: "now building" },
  ];
}
