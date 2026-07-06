# alejandrofrank-eng

Personal builder dashboard for **Alejandro Frank** — a live, build-in-public
peek into what I'm shipping (GitHub activity, LeetCode, X, hackathons, service
status), framed by what I've already built.

Built with [Hono](https://hono.dev) on **Cloudflare Workers**.

## Structure

```
src/
  index.ts      routes only (the Hono app)
  content.ts    editable content — copy, numbers, services, changelog, links (edit this most)
  styles.ts     all CSS
  layout.ts     HTML page template (home)
  log.ts        /log — the site's own build-in-public changelog
  panels/       dashboard panel modules (github, leetcode, shipping, status, …)
  resume/       /resume — roles as animated SVG keynotes
  timeline/     /timeline — the career Gantt view
public/         static assets (og.png social card)
wrangler.jsonc  Cloudflare Worker config (URL slug = "name" field)
_personal/      job-application materials — gitignored, never pushed
```

Adding a live panel later: write its module under `src/panels/`, add an entry to
`PANELS` in `content.ts`, render it in `layout.ts`.

## Develop

```bash
npm install
npm run dev        # local dev server
npm run deploy     # deploy to Cloudflare Workers
```

Live at `me.alejandrofranks.workers.dev` (custom domain `alejandrofrank.dev`
coming). Rename the URL slug via the `name` field in `wrangler.jsonc`.

## Status

v0.1 — skeleton: hero, outcomes header, dashboard panel shells. Live data panels
land incrementally (see roadmap). Each new panel = one build-in-public post.
