// Copies site/ → dist/ and fills in the absolute site URL.
//
// Social previews (og:image, canonical, og:url) need absolute URLs, so the HTML
// uses a %SITE_URL% placeholder. The URL is resolved from, in order:
//   1. SITE_URL                        — set this yourself for a custom domain
//   2. VERCEL_PROJECT_PRODUCTION_URL   — provided by Vercel (hostname only)
// With none of these, canonical/og:url are dropped and og:image stays relative.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'site');
const out = path.join(root, 'dist');

const withScheme = (u) => (u && !/^https?:\/\//.test(u) ? `https://${u}` : u);
const siteUrl = (
  process.env.SITE_URL ||
  withScheme(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
  ''
).replace(/\/+$/, '');

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(src, out, {
  recursive: true,
  filter: (p) => !path.basename(p).startsWith('.') && !path.basename(p).startsWith('_'),
});

const htmlFiles = fs.readdirSync(out).filter((f) => f.endsWith('.html'));
for (const file of htmlFiles) {
  const fp = path.join(out, file);
  let html = fs.readFileSync(fp, 'utf8');
  if (!siteUrl) {
    html = html.replace(/^.*(rel="canonical"|property="og:url").*\n/gm, '');
  }
  html = html.replaceAll('%SITE_URL%', siteUrl);
  fs.writeFileSync(fp, html);
}

if (siteUrl) {
  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(
    path.join(out, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc><lastmod>${today}</lastmod></url>\n</urlset>\n`
  );
  fs.appendFileSync(path.join(out, 'robots.txt'), `\nSitemap: ${siteUrl}/sitemap.xml\n`);
}

console.log(`Built dist/ ${siteUrl ? `for ${siteUrl}` : '(no SITE_URL — social image URL left relative)'}`);
