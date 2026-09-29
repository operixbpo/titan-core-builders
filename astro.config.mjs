// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Static brochure site for Cloudflare Pages (Git push → build → ship).
export default defineConfig({
  site: "https://keepwell.example.com",
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});
