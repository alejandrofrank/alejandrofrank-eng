// ----------------------------------------------------------------------------
// Shared types for the panel modules.
// A panel owns its own data-fetching and renders its own card HTML.
// ----------------------------------------------------------------------------

export interface Env {
  /** Optional GitHub token (PAT) — unlocks the GraphQL contribution graph. */
  GITHUB_TOKEN?: string;
  /** GitHub username. Defaults to "alejandrofrank" if unset. */
  GITHUB_USER?: string;
}

/** Where the layout placed this panel: its index and whether it gets a seam node. */
export interface Slot {
  n: number;
  node: boolean;
}

export interface Panel {
  key: string;
  title: string;
  /** Full-width card. The layout uses this to place seam nodes. */
  span?: 2;
  /** Render the full card (see ui.ts `card`). Receives runtime env + placement. */
  render(env: Env, slot: Slot): Promise<string>;
}
