import type { NextConfig } from "next";

// STATIC=1 (npm run build:static): plain files for shared hosting (Hostinger public_html), written to out/.
// Language detection then runs in the browser (public/index.html) instead of proxy.ts.
const STATIC = process.env.STATIC === "1";
// Folder the static site lives in (aatlascompany.com.br/portfolio). Set by scripts/build-static.mjs.
const BASE = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // this folder is the project root (a stray package-lock.json in the user folder confused the detection)
  turbopack: { root: process.cwd() },
  ...(STATIC
  ? {
      output: "export",
      basePath: BASE,
      trailingSlash: true, // en/work/index.html, so Apache serves /en/work/ without rewrites
      images: { loader: "custom", loaderFile: "./lib/image-loader.ts" },
      env: { NEXT_PUBLIC_STATIC: "1", NEXT_PUBLIC_BASE: BASE },
    }
  : {
      poweredByHeader: false,
      output: "standalone", // self-contained Node server in .next/standalone, copied to ../dist for upload
      async headers() {
        return [
          {
            source: "/:path*",
            headers: [
              { key: "X-Content-Type-Options", value: "nosniff" },
              { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
              { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
              // ponytail: no script-src; a nonce-based CSP needs a prod-build test
              { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'" },
              { key: "Strict-Transport-Security", value: "max-age=31536000" },
            ],
          },
        ];
      },
    }),
};

export default nextConfig;
