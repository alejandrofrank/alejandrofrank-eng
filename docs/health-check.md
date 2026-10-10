# Portfolio health check

The Worker exposes `GET /health` for a lightweight application check.

```sh
curl --fail https://me.alejandrofranks.workers.dev/health
```

A successful response is HTTP 200 with this JSON body:

```json
{"ok":true}
```

For local development, start `npm run dev` and request the same `/health` path on the local address printed by Wrangler.

This endpoint confirms that the application can handle a request. It does not query GitHub, validate project links, or check the availability of Bakiano. Check those dependencies separately when investigating a missing contribution calendar or an external service failure.
