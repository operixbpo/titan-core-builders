# Cloudflare Pages
#
# Connect this GitHub repo in the Cloudflare dashboard (preferred), or deploy
# with Wrangler using a token that is never committed.
#
# Build configuration:
#   Framework preset: Astro (or None)
#   Build command:    npm run build
#   Build output:     dist
#   Root directory:   /
#   Node version:     22
#
# Environment variables (Pages → Settings → Environment variables):
#   PUBLIC_LEADS_URL              https://leads.<operix-domain>/v1/leads
#   PUBLIC_TURNSTILE_SITE_KEY     (Turnstile widget for this domain)
#
# Preview deployments: enabled for all branches by default on Pages.
