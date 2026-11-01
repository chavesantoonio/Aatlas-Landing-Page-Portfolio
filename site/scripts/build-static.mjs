// npm run build:static → out/: plain files for shared hosting (Hostinger public_html, Apache/LiteSpeed).
// proxy.ts cannot run there, so it is set aside during the build and its job moves to the browser:
// out/index.html picks the language, and each page sends Brazilian browsers to /pt-br (app/[lang]/layout.tsx).
import { execSync } from "node:child_process";
import { renameSync, writeFileSync, existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { join, basename, dirname, relative, sep } from "node:path";

// The folder the site is uploaded to: aatlascompany.com.br/portfolio. BASE_PATH="" builds for a domain root.
const BASE = process.env.BASE_PATH ?? "/portfolio";

const off = "proxy.ts.static-off";
renameSync("proxy.ts", off);
try {
  execSync("npx next build", { stdio: "inherit", env: { ...process.env, STATIC: "1", BASE_PATH: BASE } });
} finally {
  if (existsSync(off)) renameSync(off, "proxy.ts");
}

// Next adds BASE to links and its own files, not to the plain "/assets/..." paths in our code and CSS: add it here.
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
const walkDirs = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? [join(dir, e.name), ...walkDirs(join(dir, e.name))] : []));
if (BASE) {
  for (const f of walk("out").filter((f) => /\.(html|js|css|txt|json)$/.test(f))) {
    const s = readFileSync(f, "utf8");
    const t = s.replace(/(?<![\w.-])\/assets\//g, `${BASE}/assets/`);
    if (t !== s) writeFileSync(f, t);
  }
}

// Next writes segment prefetches as folders (__next.$d$lang/work/__PAGE__.txt) but the router requests them
// with dots (__next.$d$lang.work.__PAGE__.txt): flatten them so client navigation gets its data instead of a 404.
for (const dir of walkDirs("out").filter((d) => basename(d).startsWith("__next."))) {
  for (const f of walk(dir)) {
    const flat = [basename(dir), ...relative(dir, f).split(sep)].join(".").replace(/\.txt\.txt$/, ".txt");
    writeFileSync(join(dirname(dir), flat), readFileSync(f));
  }
  rmSync(dir, { recursive: true, force: true });
}

// Same rule as pickLocale in lib/locales.ts: the first pt/es/en tag decides; pt-BR is locked.
writeFileSync(
  "out/index.html",
  `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Antonio Chaves</title><meta name="robots" content="noindex"><style>body{margin:0;background:#0E0B09}</style>
<script>(function(){var L=navigator.languages||[navigator.language],p="en",c=(document.cookie.match(/(?:^|; )lang=([^;]*)/)||[])[1];
for(var i=0;i<L.length;i++){var t=(L[i]||"").toLowerCase();
if(t.indexOf("pt-br")===0){p="pt-br";break}if(t.indexOf("pt")===0){p="pt-pt";break}
if(t.indexOf("es")===0){p="es";break}if(t.indexOf("en")===0){p="en";break}}
if(p!=="pt-br"&&/^(en|es|pt-pt)$/.test(c||""))p=c;location.replace("${BASE}/"+p+"/")})()</script></head>
<body><noscript><a href="${BASE}/pt-br/">Português (Brasil)</a> · <a href="${BASE}/pt-pt/">Português</a> · <a href="${BASE}/es/">Español</a> · <a href="${BASE}/en/">English</a></noscript></body></html>
`,
);

// Next's own unstyled 404 pages; ours below replaces them
for (const d of ["out/404", "out/_not-found"]) rmSync(d, { recursive: true, force: true });

// Apache serves this for any missing path (ErrorDocument below): self-contained, in the site's look, in every language.
writeFileSync(
  "out/404.html",
  `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>404 · Antonio Chaves</title><meta name="robots" content="noindex"><link rel="icon" href="${BASE}/icon.png">
<style>
*{box-sizing:border-box;margin:0}
body{min-height:100svh;display:grid;place-items:center;padding:32px 20px;background:radial-gradient(60% 55% at 85% 8%,rgba(232,80,2,.3),transparent 62%),linear-gradient(160deg,#1A1410,#0E0B09);color:#F0EDE8;font:400 17px/1.6 system-ui,-apple-system,"Segoe UI",Arial,sans-serif;text-align:center}
.lg{width:56px;height:46px;margin:0 auto 28px;background:#FF6A00;-webkit-mask:url(${BASE}/assets/logo.png) center/contain no-repeat;mask:url(${BASE}/assets/logo.png) center/contain no-repeat}
h1{font:400 clamp(64px,14vw,120px)/1 Georgia,"Times New Roman",serif;color:#FF9F66}
p{max-width:480px;margin:18px auto 0;color:#D9CFC6}
nav{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:32px}
a{display:inline-flex;align-items:center;min-height:48px;padding:0 20px;border-radius:8px;border:2px solid rgba(255,255,255,.6);color:#FFF;font-weight:700;letter-spacing:1px;text-decoration:none;font-size:14px}
a:first-child{background:#E85002;border-color:#E85002}
a:hover{background:rgba(255,255,255,.12)}a:first-child:hover{background:#C24300}
a:focus-visible{outline:2px solid #FF9F66;outline-offset:3px}
</style></head><body><main>
<div class="lg" role="img" aria-label="Aatlas"></div>
<h1>404</h1>
<p>Esta página não existe. · This page does not exist. · Esta página no existe.</p>
<nav><a href="${BASE}/pt-br/">PORTUGUÊS (BR)</a><a href="${BASE}/en/">ENGLISH</a><a href="${BASE}/es/">ESPAÑOL</a><a href="${BASE}/pt-pt/">PORTUGUÊS (PT)</a></nav>
</main></body></html>
`,
);

writeFileSync(
  "out/.htaccess",
  `Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 ${BASE}/404.html

<IfModule mod_rewrite.c>
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

AddType image/webp .webp
AddDefaultCharset UTF-8
AddCharset utf-8 .txt .json .xml

<IfModule mod_headers.c>
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "DENY"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
Header always set Cross-Origin-Opener-Policy "same-origin-allow-popups"
Header always set Content-Security-Policy "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'; upgrade-insecure-requests"
# no includeSubDomains: other subdomains (lp.) must not be forced to HTTPS by this folder
Header always set Strict-Transport-Security "max-age=31536000"
Header unset X-Powered-By
# pages and settings revalidate on every visit, so an upload is live at once; images keep for 30 days
<FilesMatch "\\.(html|txt|xml|json)$">
Header set Cache-Control "public, max-age=0, must-revalidate"
</FilesMatch>
<FilesMatch "\\.(webp|png|jpg|svg|ico|woff2)$">
Header set Cache-Control "public, max-age=2592000"
</FilesMatch>
</IfModule>

<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml application/xml application/json application/javascript text/javascript image/svg+xml
</IfModule>
`,
);

// hashed file names never change, so browsers may keep them for a year
writeFileSync(
  "out/_next/static/.htaccess",
  `<IfModule mod_headers.c>
Header set Cache-Control "public, max-age=31536000, immutable"
</IfModule>
`,
);

console.log(`
out/ ready: upload its contents to public_html${BASE} (site at https://aatlascompany.com.br${BASE}/).`);
