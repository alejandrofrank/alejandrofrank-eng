# alejandrofrank-eng

Personal builder dashboard for **Alejandro Frank** — a live, build-in-public
peek into what I'm shipping (GitHub activity, LeetCode, X, hackathons, service
status), framed by what I've already built.

Built with [Hono](https://hono.dev) on **Cloudflare Workers**.

## Develop

```bash
npm install
npm run dev        # local dev server
npm run deploy     # deploy to Cloudflare Workers
```

Live at `live.alejandrofranks.workers.dev` (custom domain `alejandrofrank.dev`
coming). Rename the URL slug via the `name` field in `wrangler.jsonc`.

## Status

v0.1 — skeleton: hero, outcomes header, dashboard panel shells. Live data panels
land incrementally (see roadmap). Each new panel = one build-in-public post.
