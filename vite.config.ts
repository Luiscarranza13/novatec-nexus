// Vercel-compatible config: SPA mode with static prerender
// Cloudflare plugin is disabled; TanStack Start runs in SPA/prerender mode.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    spa: {
      enabled: true,
    },
  },
});
