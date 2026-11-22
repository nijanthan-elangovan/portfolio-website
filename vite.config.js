// vite.config.js
import process from "node:process";
import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { createContactHandler } from "./api/contact.js";
import { portfolioDiscovery } from "./scripts/portfolio-discovery.js";
import content from "./src/data/content.json";

export default defineConfig(({ mode }) => {
  const mountContact = (server) => {
    const env = loadEnv(mode, process.cwd(), ["MAILTRAP_", "CONTACT_"]);
    server.middlewares.use("/api/contact", createContactHandler({ ...process.env, ...env }));
  };

  return {
    build: {
      rollupOptions: {
        input: {
          home: resolve("index.html"),
          admin: resolve("admin/index.html"),
          notFound: resolve("404.html"),
        },
      },
    },
    plugins: [
      react(),
      portfolioDiscovery(content),
      {
        name: "portfolio-contact",
        configureServer: mountContact,
        configurePreviewServer: mountContact,
      },
    ],
  };
});
