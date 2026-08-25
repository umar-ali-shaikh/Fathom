import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// Vercel sets VERCEL=1 during its build; every other target (local build,
// Render, etc.) falls back to Nitro's own default (a plain Node server).
const nitroPreset = process.env.VERCEL ? "vercel" : undefined;

export default defineConfig({
  // Pin the dev port to 5173 (Vite's own default) — the nitro plugin's dev
  // server otherwise falls back to 3000, colliding with the backend's port.
  server: { port: 5173, strictPort: false },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
    }),
    viteReact(),
    nitro({ preset: nitroPreset }),
  ],
});
