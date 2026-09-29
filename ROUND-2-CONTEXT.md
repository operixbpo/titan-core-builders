# Keepwell — Round 2 context (locked direction)

Locked: 2026-09-29, user chose moodboard 2 ("Lets go with 2"). Moodboards: https://claude.ai/artifact/UiXXtT7hQdB5Gioswjad4W
Earlier rejected: type-only directions A–J.

## Premise
Crews in hi-vis. The work is done by people who physically show up; the site should feel practical, energetic and organised (work orders, checklists, photo reports), not luxury and not corporate.

## Invariants (keep unless the user reopens)
- Light, paper ground; never dark-led; no orange anywhere.
- Hi-vis yellow is the single accent: highlighter under key words, primary CTA fill, status chips, vendor band. Never for body text.
- Outfit only (Google Fonts). Headlines 600, tight tracking (-0.04em), max 3 lines; body 300–400.
- Rounded, photo-led containers (outer radius 32–34px, inner media radius = outer − padding).
- Signature devices: highlighter sweep on the key phrase; floating work-order card; checklists/status chips (Done / Sending / Scheduled); two-row velocity marquee; sticky stacking service cards; pinned horizontal proof gallery; ink pill buttons with a yellow circular arrow.
- Honest content: placeholder brand, no invented reviews, stats or phone numbers.

## Tokens
paper #FAFAF7 · surface #FFFFFF · ink #1E2227 · muted #62676D · line #E5E5DF · hivis #E6DC3A · hivis-soft #F5F1BE · slate #39434E
Radii: 34 / 24 / 16 px. Ease: cubic-bezier(0.16, 1, 0.3, 1). Press scale 0.96.

## Round 2 artifact
Full homepage mockup in HTML, Tailwind v4 (browser build) + GSAP ScrollTrigger + Lenis, so markup ports to Astro + Tailwind.
