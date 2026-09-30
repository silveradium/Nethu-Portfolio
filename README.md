# Nethu Lamahewa — portfolio

Static site: plain HTML, CSS and JS. No framework, no dependencies.

```
site/                 ← the website (edit here)
  index.html
  css/styles.css
  js/main.js          parallax, mobile menu, lazy Canva/YouTube embeds
  assets/             WebP images (same names as the original export)
  favicon.ico, favicon-32.png, apple-touch-icon.png, icon-192/512.png
  og-image.jpg        1200×630 social-share preview
  site.webmanifest, robots.txt
scripts/build.mjs     copies site/ → dist/ and fills in the absolute site URL
netlify.toml          Netlify config
vercel.json           Vercel config
```

## Run locally

```sh
npm run dev        # serves site/ at http://localhost:3000
npm run preview    # builds dist/ and serves it
```

Or open `site/index.html` via any static server (`python3 -m http.server -d site`).

## Deploy

Push this folder to a GitHub/GitLab repo, then:

- **Netlify** — "Add new site → Import an existing project". Settings are read
  from `netlify.toml` (build `npm run build`, publish `dist`).
- **Vercel** — "Add New → Project", import the repo. Settings are read from
  `vercel.json` (framework: Other, output `dist`).

The build fills in absolute URLs for the social-share tags automatically
(Netlify's `URL`, Vercel's `VERCEL_PROJECT_PRODUCTION_URL`). **If you add a
custom domain, set an environment variable `SITE_URL=https://yourdomain.com`**
in the host's dashboard so link previews use it.

After deploying, check the share card with
[opengraph.xyz](https://www.opengraph.xyz/) or LinkedIn's Post Inspector.

## Editing content

Everything is in `site/index.html`. Work cards use these classes:

| Class | Meaning |
|---|---|
| `card--overlay` | photo with caption on a gradient |
| `card--feature` | text on top, photo below |
| `card--split`   | photo left, text right |
| `cs-1 / cs-2 / cs-4` | columns spanned (4-col grid on desktop, 2 on tablet, 1 on phones) |
| `rs-1 / rs-2`   | rows spanned |
| `img.is-contain` | show the whole image (certificates) instead of cropping |

Per-image cropping is set with `style="object-position: 50% 30%"`.

### Adding / replacing images

Keep images WebP, longest side ≤ 2000px:

```sh
cwebp -q 80 -m 6 -resize 0 2000 input.jpg -o site/assets/work/name.webp   # portrait
cwebp -q 80 -m 6 -resize 2000 0 input.jpg -o site/assets/work/name.webp   # landscape
```

Add `width`/`height` attributes and `loading="lazy"` on new `<img>` tags.
# Nethu-Portfolio
