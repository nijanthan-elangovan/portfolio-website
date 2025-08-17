import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  // Use your new repo name here:
  base: "/portfolio-website/",
});
