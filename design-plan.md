# Keepwell (Operix child site) — plan summary
 
Status as of 2026-09-29. Full plan: Claude Doc "Keepwell: Site, Stack & Lead Hub Plan" https://claude.ai/code/artifact/231e2f31-d659-43a9-9228-770b55710412 · shareable copy: claude/keepwell/plan.md
Homepage mockup (Round 2, locked direction = moodboard 2): https://claude.ai/artifact/KSw5LVXEx3duqufXicP4LA · locked rules: claude/keepwell/ROUND-2-CONTEXT.md
Moodboards 1–5: https://claude.ai/artifact/UiXXtT7hQdB5Gioswjad4W (details: claude/keepwell/moodboards-notes.md)
Rejected: Round 1 type-only directions A–J https://claude.ai/artifact/9kt4YP5VpL83aNXysaCw4L
 
## What it is
- New offline US field-services business (child of Operix), same model as primevisionservice.com and propertyguardians.us: maintenance, preservation, inspection via licensed local vendors.
- "Keepwell Property Services" is a placeholder name.
- Brochure site, no real backend; contact/quote + vendor forms rarely used; leads must land in Operix webmail.
- Operix has no backend yet; domains and webmail not set up yet.
## Decisions (proposed)
- Site: Astro static output + Tailwind CSS v4 (user prefers Tailwind) on Cloudflare Pages with Git integration: push to main on GitHub builds and ships, every branch gets a preview URL (user needs Vercel-style CI/CD; Astro is OK on that condition). Vercel Hobby is non-commercial only, so Vercel would mean Pro.
- No monorepo: each child site is its own repo (e.g. `keepwell-web`) with its own Pages project; the lead gateway is its own repo (`operix-lead-gateway`). Sites share only the `/v1/leads` contract (JSON schema kept in the gateway repo, optional hosted `client.js` at leads.<operix-domain>/v1/client.js); breaking changes ship as `/v2` beside `/v1`.
- Forms / lead gateway: TypeScript Cloudflare Worker with Hono, deployed with Wrangler, hosted on Cloudflare Workers free plan (no server/VPS), at leads.<operix-domain>/v1/leads: Turnstile + honeypot + rate limit + schema check → D1 (Cloudflare's hosted SQLite: sites, leads, lead_events, outbox) → Cloudflare Email Service send_email to verified leads@<operix-domain>, Reply-To = visitor.
- No Supabase (free projects pause after ~7 days of low activity).
- Mail: Zoho Mail Forever Free on the Operix domain (web-only); child domains use Cloudflare Email Routing to forward into it.
- Later: Operix backend (stack still open) receives HMAC-signed webhooks from the gateway + one-off backfill; gateway stays the public edge. New child site = one row in `sites` + one Turnstile widget.
## Design
- Locked 2026-09-29: moodboard 2 "crews in hi-vis" — paper #FAFAF7, hi-vis yellow #E6DC3A (single accent), slate #39434E, ink #1E2227, Outfit; light, no orange, photo-led, rounded containers.
- Round 2 homepage mockup built in Tailwind v4 (browser build) + GSAP ScrollTrigger + Lenis: hide-on-scroll pill nav with scrollspy + mobile menu, split hero with highlighter + floating work-order card, velocity marquee, scrubbed intro with inline images, sticky stacking service cards, pinned "how it works" with progress rail, pinned horizontal work gallery, gapless bento, hi-vis vendor band, accordion FAQ, tabbed quote/vendor form (validation, loading, success; builds the /v1/leads payload; submit mocked), giant footer wordmark.
- Placeholders to replace: brand name, phone/email, Pexels photos → real job photos, reviews (none shown until real).
- Next after approval: HTML style guide from the mockup, then Astro + Tailwind build.
## Open
- Final name + domain; Operix domain; real states covered; auto-reply to visitors (needs Workers Paid or Resend); vendor document uploads (R2) or by email; feedback on the mockup.
 