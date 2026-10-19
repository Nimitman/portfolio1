import { defineConfig } from 'astro/config';

// GitHub Pages project site: https://nimitman.github.io/portfolio1/
// Override with SITE_URL / BASE_PATH (e.g. BASE_PATH=/ for a custom domain).
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://nimitman.github.io',
  base: process.env.BASE_PATH ?? '/portfolio1',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
