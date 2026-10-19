# Altitude

Portfolio of Nimit Mangal. One ascent from a single pixel to a country-scale market, then one dive back.

- Concept and content plan: see the "Altitude" portfolio plan (v0.1).
- Build decisions, architecture, scope: [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md).

## Run

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run check    # type check
```

## Where things live

| Change | File |
|---|---|
| Chapter altitudes, cursors, sound mix | `src/data/altitude.ts` |
| Case study content (six beats) | `src/data/cases.ts` |
| Chapter copy and markup | `src/components/chapters/*.astro` |
| Chapter noise → order behaviour | `src/scripts/chapters/*.ts` |
| Scroll rhythm (hold / cut timings) | `src/scripts/main.ts` (`IN`, `OUT`) |
| Colours, type, tokens | `src/styles/global.css` |

Placeholders waiting on parked questions use `class="tbd" data-q="Q#"`. Switch to the **Structure** lens to see which question each depends on. `grep -rn 'tbd' src` lists all of them.

## Deploy

Pushes to `main` build and deploy to GitHub Pages via `.github/workflows/deploy.yml`:
https://nimitman.github.io/portfolio1/

One-time setup: repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Internal links go through `url()` (`src/data/url.ts`) so the `/portfolio1` base path is applied. For a custom domain, set `BASE_PATH=/` and `SITE_URL=https://your.domain` in the workflow's build step.
