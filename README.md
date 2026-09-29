# Stone Ridge web

Static marketing site for **Stone Ridge Constructions LLC**. Built from the Round 2 homepage mockup for Cloudflare Pages.

## Stack

- [Astro](https://astro.build/) static output
- [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite`
- GSAP ScrollTrigger + Lenis (motion; respects `prefers-reduced-motion`)
- Outfit Variable (self-hosted via Fontsource)
- Forms build the Lead Gateway `/v1/leads` payload (mocked until `PUBLIC_LEADS_URL` is set)

## Local development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

Requires Node 22.12+.

## Environment

Copy `.env.example` to `.env` if needed. No secrets are required for a brochure build.

| Variable | Purpose |
| --- | --- |
| `PUBLIC_LEADS_URL` | Full URL to `POST /v1/leads`. Empty = mock success UI |
| `PUBLIC_TURNSTILE_SITE_KEY` | Reserved for Turnstile when the gateway goes live |

Never commit `.env` files with real tokens.

## Deploy (Cloudflare Pages)

Preferred path from the tech plan: connect this GitHub repo to a Cloudflare Pages project.

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node version:** `22`

Every push to `main` builds and ships. Preview URLs are created for other branches.

GitHub Actions (`.github/workflows/ci.yml`) runs `npm ci` + `npm run build` on push and pull requests so broken builds fail before Pages.

Optional Wrangler config lives in `wrangler.toml` (`pages_build_output_dir = dist`).

## Design

Locked Round 2 direction (moodboard 2): paper ground `#FAFAF7`, hi-vis accent `#E6DC3A`, ink `#1E2227`, Outfit, light-only. See `ROUND-2-CONTEXT.md` and `docs/blueprint-homepage.html`.

## Project layout

```
src/
  components/   Nav, LeadForm
  layouts/      BaseLayout
  pages/        index, privacy, terms
  scripts/      client motion + forms
  styles/       design tokens + components (global.css)
  lib/          shared constants
public/img/     photography placeholders
docs/           blueprint HTML mockup
```

## Remaining TODOs

- [ ] Final brand name and domain
- [ ] Replace placeholder photos with real job photos
- [ ] Wire `PUBLIC_LEADS_URL` + Turnstile to `operix-lead-gateway`
- [ ] Legal copy for Privacy and Terms
- [ ] Phone / email once the Operix mailbox exists
