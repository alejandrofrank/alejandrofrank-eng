// ----------------------------------------------------------------------------
// Shared types for the panel modules.
// A panel owns its own data-fetching and renders its own card HTML.
// ----------------------------------------------------------------------------

export interface Env {
  /** Optional GitHub token (PAT) — unlocks the GraphQL contribution graph. */
  GITHUB_TOKEN?: string;
  /** GitHub username. Defaults to "alejandrofrank" if unset. */
  GITHUB_USER?: string;
  /** LeetCode username. Defaults to "alexfrank" if unset. */
  LEETCODE_USER?: string;
}

export interface Panel {
  key: string;
  title: string;
  /** Render the full `.panel` card. Receives runtime env (secrets/vars). */
  render(env: Env): Promise<string>;
}
