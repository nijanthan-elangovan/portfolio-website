// vite.config.js
import process from "node:process";
import { resolve } from "node:path";
import { Readable } from "node:stream";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { createContactHandler } from "./api/contact.js";
import { portfolioDiscovery } from "./scripts/portfolio-discovery.js";
import content from "./src/data/content.json";

export default defineConfig(({ mode }) => {
  const mountContact = (server) => {
    const env = { ...process.env, ...loadEnv(mode, process.cwd(), ["MAILTRAP_", "CONTACT_", "TURNSTILE_"]) };
    const handleContact = createContactHandler();
    server.middlewares.use("/api/contact", async (request, response, next) => {
      try {
        const protocol = request.socket.encrypted ? "https" : "http";
        const url = new URL(request.originalUrl, `${protocol}://${request.headers.host}`);
        const options = { method: request.method, headers: request.headers };
        if (request.method !== "GET" && request.method !== "HEAD") {
          options.body = Readable.toWeb(request);
          options.duplex = "half";
        }
        const result = await handleContact(new Request(url, options), env, request.socket.remoteAddress);
        response.writeHead(result.status, Object.fromEntries(result.headers));
        response.end(result.body ? await result.text() : undefined);
      } catch (error) {
        next(error);
      }
    });
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
