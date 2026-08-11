import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_URL ?? "";
  let proxyTarget = "https://io27flqxz0.execute-api.us-east-2.amazonaws.com";
  try {
    if (apiUrl.startsWith("http")) {
      proxyTarget = new URL(apiUrl).origin;
    }
  } catch {
    // keep default
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // Browser calls same-origin /api/count; Vite forwards to API Gateway so
      // local dev isn't blocked by CloudFront-only CORS.
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
