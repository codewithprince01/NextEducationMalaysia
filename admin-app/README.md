# Admin panel

A Vite + React 19 single-page app that is **served by the Next site under `/admin`**
— it is not deployed on its own domain or port.

It talks to the Next API with plain relative paths (`/api/v1/admin/...`), so being
on the same origin is what makes authentication and cookies work.

## How the `/admin` mount works

| Piece | Where | What it does |
| --- | --- | --- |
| `base: '/admin/'` | `vite.config.ts` | every emitted asset URL is `/admin/assets/...` |
| `basename={import.meta.env.BASE_URL}` | `src/App.tsx` | react-router routes stay written as `/dashboard`, and resolve under `/admin` |
| `outDir: '../public/admin'` | `vite.config.ts` | the build lands inside the Next app's `public/`, so Next serves it as static files |
| `rewrites()` | `../next.config.ts` | `/admin/*` falls through to `index.html` so deep links and refreshes work |
| `matcher` | `../middleware.ts` | `/admin` is excluded from the student-session middleware |

## Development

Two servers, one URL. From the **repo root**:

```bash
npm run dev         # Next  — the site
npm run admin:dev   # Vite  — the admin panel, with HMR
```

Then open **http://localhost:3000/admin**. Next proxies `/admin/*` to the Vite dev
server on port 5174, so you get hot reload while staying on the site's origin and
the `/api` calls hit the real backend.

Opening http://127.0.0.1:5174/admin directly also works; in that case Vite proxies
`/api` to the Next server (override with `NEXT_ORIGIN` if Next is not on port 3000).

## Production

```bash
npm run build:all   # from the repo root: builds the admin panel, then the Next app
```

`public/admin/` is generated output and is git-ignored, so **the admin build must run
before `next build` on the deploy machine** — that is exactly what `build:all` does.
Running plain `npm run build` leaves `/admin` returning a 404.

## Adding a page

Add the component under `src/pages/`, then register it in `src/App.tsx` with a plain
path (`/my-page`, not `/admin/my-page`) — the basename adds the prefix.
