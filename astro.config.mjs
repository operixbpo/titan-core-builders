// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Static brochure site for Cloudflare Pages (Git push → build → ship).
export default defineConfig({
  site: "https://www.titancorellc.com",
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});
