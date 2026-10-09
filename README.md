# Raunak Dey's Portfolio

A modern, responsive portfolio website showcasing skills, projects, and achievements in data science and quantitative research. Built with cutting-edge web technologies and optimized for performance and user experience.

## Live Demo

**[Deployment →](https://raunak-dey.vercel.app/)**

## Features

### Design & Animation

- **Modern Dark Theme** with red accent colors
- **Network Particle Background** animating on the hero canvas, paused when the tab is hidden or the canvas scrolls out of view
- **Smooth Scroll Animations** with ScrollReveal.js
- **Section Headers** marked by a short red hairline rule; there are no glows or text shadows
- **Interactive Hover Effects** on cards and buttons
- **Responsive Design** that reflows from 320px upwards without horizontal scrolling

### User Experience

- **Scroll Reveal** at 420ms, scaled down on Android phones and skipped entirely under `prefers-reduced-motion`
- **Centered Navigation Elements** for better visual balance
- **Swiper.js Integration** for the project, achievement and skills carousels, with autoplay that pauses on hover, on keyboard focus, when less than 45% of the carousel is visible, and under reduced motion
- **Back-to-Top Button** for easy navigation
- **Custom Scrollbar** styling that only appears while scrolling
- **Mobile-Optimized** navigation and layouts

### Technical Features

- **SEO Optimized** with a canonical URL, Open Graph and Twitter cards, JSON-LD `Person` and `WebSite` entities, `robots.txt` and a sitemap
- **Performance Optimized**: the animated canvas drops to a single static frame on mobile viewports, under reduced motion and on low-power devices, and its backing store is capped at 2x `devicePixelRatio`
- **Accessibility Focused**: a skip link, labelled controls, list semantics for the skills, a visible `:focus-visible` ring, text that meets WCAG AA contrast, and full content under `prefers-reduced-motion`, with JavaScript disabled, and with every CDN blocked
- **Chromium-tested**: verified in Chrome 155 at 320, 375, 768, 1024 and 1440px. Firefox, Safari and mobile browsers are untested here, so no cross-browser claim is made
- **GitHub Pages Ready** for seamless deployment

## Technologies Used

### Frontend

- **HTML5** - Semantic markup with structured data
- **CSS3** - Advanced animations, gradients, and responsive design
- **Vanilla JavaScript** - Performance-optimized interactions
- **Font Awesome** - Professional iconography
- **Google Fonts** - Typography (Fraunces, IBM Plex Sans)

### Libraries & Frameworks

- **ScrollReveal.js** - Scroll-triggered animations
- **Swiper.js** - Touch-enabled carousels
- **Typed.js** - Dynamic text animations

### SEO & Analytics

- **JSON-LD Structured Data** for rich search results
- **Open Graph Meta Tags** for social media sharing
- **Sitemap** with lastmod, changefreq and priority
- **Robots.txt** for search engine optimization

## Project Structure

```text
raunakdey-07.github.io/
├── index.html              # Main portfolio page
├── README.md               # Project documentation
├── robots.txt              # Search engine directives
├── sitemap.xml             # SEO sitemap
├── assets/                 # Static assets
│   ├── portfolio.jpg       # Profile image
│   ├── og-image.png        # 1200x630 social preview image
│   ├── Raunak Dey - 22F3002175 - IITM.pdf  # Resume download
│   ├── favicon files       # Site icons (also the Apple touch icon)
│   ├── projects/           # Project screenshots
│   └── achievements/       # Achievement images
├── css/                    # Stylesheets
│   └── main.css            # Core styling + responsive breakpoints
├── tests/                  # Checks
│   └── check.mjs           # Dependency-free regression checks
└── js/                     # JavaScript files
    ├── main.js             # Core functionality (loaded directly, served gzipped)
    └── networkAnimation.js # Background effects (loaded directly, served gzipped)
```

## Sections

1. **Hero** - Dynamic introduction with typed animations
2. **About** - Professional background and expertise
3. **Projects** - Portfolio of data science and development work
4. **Achievements** - Certifications and recognitions
5. **Skills** - Technical competencies and tools
6. **Contact** - Professional contact information

## Recent Updates

Newest first.

### 9 October 2026 — readability, semantics and regression checks

- Hero text contrast: the accent red used for the name and the typed role was
  3.44:1 on the page background, below the 4.5:1 required below 24px. Added a
  text-safe accent for red text and applied it to the hero, the header links and
  the achievement headings. The red stays as the button and border accent.
- Keyboard focus now has a deliberate `:focus-visible` outline, because the
  indicator otherwise depended on the user agent and measured 1.02:1 against the
  dark background in Chromium.
- The skip link got its own background, padding and accessible treatment, and
  the logo link is named rather than announced as "RD".
- The three project cards now describe the projects they link to. The Finalysis
  card pointed at a repository that calls itself redundant while its screenshot
  and demo show a different one; it now points at `finalysis_2.0`, the
  repository that declares that deployment.
- Skills are a list rather than a table with a hidden empty second column.
- Open Graph and Twitter cards use a 1200x630 image instead of a portrait
  photograph, the meta description was shortened from 195 to 138 characters, an
  Apple touch icon was declared, and the sitemap and JSON-LD dates were brought
  up to date.
- The animated canvas now renders at up to 2x `devicePixelRatio` on screens that
  animate it, and stays at 1x where only a static frame is drawn.
- `node tests/check.mjs` was added: a dependency-free suite covering metadata,
  JSON-LD, fragments, asset references, third-party origins, DOM sinks, focus
  suppression and the accessibility invariants, with an optional `--browser`
  mode for computed contrast, overflow and console errors.

### 9 October 2026 — focus ring on the project screenshots

- The keyboard focus ring on the three project screenshot links was never
  visible, and computed style said otherwise the whole time. Two causes, both
  found by sampling screenshots rather than by reading CSS:
  the anchor was an inline box, and Chrome paints no outline on one; and even
  once painted, the card and the carousel both clip an outset ring. The earlier
  `overflow-clip-margin` on the card did not help — Chrome does not apply it to
  outlines, so it was removed rather than left in place doing nothing. The ring
  is now drawn inside the link, with a light and a dark line together so it
  stays visible on the light and the dark screenshots alike.
- The response-header check verified the header values but never the rule's
  scope, so a configuration matching only `/assets/(.*)` passed while leaving
  the page unprotected.
- The served-asset check skipped any relative URL, so the apple touch icon was
  never actually requested.
- The empty-table-cell pattern paired `(td|th)` with a hardcoded `</td>`, so an
  empty header cell passed.
- `--browser` now measures 320px, the SC 1.4.10 reflow width, and re-measures
  320px and 1440px at 200% text for SC 1.4.4.

### 9 October 2026 — measuring what the tests could not see

- Focus rings are now checked by pixels rather than by computed style. Every tab
  stop is screenshotted blurred and focused and the two are differenced, because
  a computed `2px solid` is not evidence a ring exists — the project screenshot
  links claimed one while Chrome painted nothing.
- Horizontal overflow is detected by measuring the rightmost pixel each element
  paints, instead of comparing `scrollWidth` with `clientWidth`, which
  `overflow-x: hidden` on `body` pins together regardless of content. The
  detector is self-tested against `tests/fixtures/overflow-cases.html`.
- Long single words were being clipped rather than wrapped at enlarged text.
  "Achievements" lost 29–170px at 320–430px with the root font at 150–200%, and
  the missing glyphs were unreachable rather than merely off screen. Fixed with
  `overflow-wrap: break-word`, which does nothing at 100%.
- The canvas had a complete pointer-interaction system — glow, connection
  lines, orbital motion, velocity field — that could never run. `#network-bg`
  sets `pointer-events: none` and `z-index: -1` and no rule overrides either, so
  zero pointer events reached it at any width. Removed, along with the four
  particle fields left write-only afterwards.
- `assets/projects/mind-palace.webp` is 1053×714 but was declared as 720×720.
- Three test defects: the response-header check verified header values but not
  the rule's scope, so a policy matching only `/assets/(.*)` passed; the
  served-asset check skipped every relative URL, so the apple touch icon was
  never actually requested; and the empty-cell pattern paired `(td|th)` with a
  hardcoded `</td>`, so an empty header cell passed.
- The Content-Security-Policy was left alone, deliberately. Four candidate
  policies were served through a local harness and measured; the trade-offs are
  set out under Response headers.

### Earlier work

- Sitemap consolidated to the single canonical URL; fragments are not separate
  crawlable resources
- Carousel pagination spacing widened so the dots satisfy the WCAG 2.2 target
  size spacing exception
- Section transitions and ScrollReveal delays retuned
- Custom scrollbar that appears only while scrolling

## Setup & Development

### Prerequisites

- Web browser (Chrome, Firefox, Safari, Edge)
- Text editor (VS Code recommended)
- Git for version control

### Local Development

```bash
# Clone the repository
git clone https://github.com/raunakdey-07/raunakdey-07.github.io.git

# Navigate to project directory
cd raunakdey-07.github.io

# Open in browser (or use a local server)
# For Python users:
python -m http.server 8000

# For Node.js users:
npx serve .
```

### Deployment

Production is served from **https://raunak-dey.vercel.app/** (Vercel). This repository
is the source for that deployment. The canonical URL, Open Graph URL, `robots.txt`
sitemap reference and JSON-LD all identify the Vercel host.

GitHub Pages also serves this repository at `https://raunakdey-07.github.io/`. It
serves identical markup, so its `<link rel="canonical">` points crawlers to the
Vercel host rather than competing with it.

### Response headers

`vercel.json` sets these on every path of the Vercel deployment:

| Header | Value | Why |
| --- | --- | --- |
| `X-Content-Type-Options` | `nosniff` | stops a browser re-interpreting a served file as another type |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | keeps the full URL out of cross-origin requests while still referring to this origin internally |
| `X-Frame-Options` | `DENY` | clickjacking protection for older user agents |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), usb=()` | the page uses none of these |
| `Content-Security-Policy` | `frame-ancestors 'none'; base-uri 'self'; object-src 'none'` | framing, `<base>` injection and plugin content, none of which the page needs |

**These apply to Vercel only.** GitHub Pages does not let a repository set
custom response headers, so `raunakdey-07.github.io` serves none of them. That
copy remains fully functional; it simply is not hardened at the header level.
Do not assume the Vercel configuration covers it.

The Content-Security-Policy is deliberately narrow. It sets only directives
that cannot conflict with anything on the page, because a wrong guess here
breaks the site silently. Four candidate policies were served through a local
harness that applies the real `vercel.json` headers, and each was measured in
Chromium rather than reasoned about:

| Policy | Violations | Result |
| --- | --- | --- |
| Shipped: `frame-ancestors`, `base-uri`, `object-src` | 0 | baseline |
| Full `default-src 'self'` plus `'unsafe-inline'` script, complete `font-src` | 0 | identical rendering, 3 cards, Swiper initialised, all fonts loaded |
| Full policy with **no** `'unsafe-inline'` in `script-src` | 3 | all three `onload` handlers blocked, so **none** of the three CDN stylesheets applied: icons and both web fonts disappeared |
| Full policy with `font-src 'self'` only | 40 | 9 Font Awesome fonts from `cdnjs.cloudflare.com`, 30 from `fonts.gstatic.com`, 1 `data:` font |

So a strict policy is achievable, but it has two real costs and one blocker:

- `script-src` must keep `'unsafe-inline'` for the three non-blocking stylesheet
  preloads (`onload="this.onload=null;this.rel='stylesheet'"`). That is where most
  of a CSP's value against injected script lies, so keeping it buys less than it
  appears to. Removing the handlers removes the need, at the cost of the three
  third-party stylesheets becoming render-blocking.
- `style-src` still needs `'unsafe-inline'` for ten inline `style=` attributes and
  the `<noscript>` style blocks.
- `font-src` must name `cdnjs.cloudflare.com`, `fonts.gstatic.com` and `data:`.

One fact worth recording because it changes the first trade-off: the inline
handlers are **not** what makes the page work without JavaScript. Each preload
already has a `<noscript>` sibling carrying a plain `rel="stylesheet"`, verified
by loading the page with scripting disabled: Font Awesome, Fraunces, IBM Plex
and Swiper all apply either way. The handlers are purely a non-render-blocking
optimisation for JavaScript-enabled visitors.

It is left as a follow-up rather than shipped. The site has no user input, no
server-rendered content and no DOM sinks, so the realistic attack it would
address — injected content — has no demonstrated entry point, and the
third-party scripts it would protect are already pinned with Subresource
Integrity. Paying `'unsafe-inline'` in two directives for that is a poor trade.

Until a deployment happens, none of this is visible in production: the live
response still returns only `strict-transport-security` and Vercel's defaults.
Verify with `curl -I https://raunak-dey.vercel.app/` after deploying.

### After deploying

Local checks cannot prove a deployment. Run these against the live URLs.

```bash
# 1. the intended HTML and CSS are being served
for f in index.html css/main.css js/networkAnimation.js sitemap.xml; do
  printf '%-24s %s\n' "$f" \
    "$(diff <(curl -sS https://raunak-dey.vercel.app/$f) <(cat $f) >/dev/null && echo MATCH || echo DIFF)"
done

# 2. the social image and favicon resolve
curl -sS -o /dev/null -w 'og-image: HTTP %{http_code} %{content_type}\n' \
  https://raunak-dey.vercel.app/assets/og-image.png          # expect 200 image/png
curl -sS -o /dev/null -w 'favicon:  HTTP %{http_code} %{content_type}\n' \
  https://raunak-dey.vercel.app/assets/favicon.png           # expect 200 image/png

# 3. all five headers are present on / and on a deep route
curl -sSI https://raunak-dey.vercel.app/ | tr -d '\r' \
  | grep -iE 'content-security-policy|x-frame-options|referrer-policy|permissions-policy|x-content-type-options'

# 4. the secondary publication is consistent
diff <(curl -sS https://raunakdey-07.github.io/index.html) <(cat index.html) >/dev/null \
  && echo 'GitHub Pages matches' || echo 'GitHub Pages DIFFERS (expected until the branch deploys)'
```

Then, in a browser on the live URL: Tab through every control at 1440px and at
375px and confirm a visible ring on each, including the three project
screenshots; confirm the mobile menu opens and closes; and confirm the
background animation is still under `prefers-reduced-motion`.

Note that `raunakdey-07.github.io` will not serve the security headers at all —
GitHub Pages does not allow repositories to set them.

## Checks

A dependency-free regression script covers the invariants that are cheap to
assert statically. No packages, no package manager, no network access by
default. It only reads files; it never writes to the repository.

```bash
node tests/check.mjs                                # static source checks
BASE_URL=https://raunak-dey.vercel.app/ node tests/check.mjs   # also compare the served page
node tests/check.mjs --browser                      # also run browser checks over CDP
```

It exits non-zero on any failure and prints `PASS`, `FAIL`, `WARN` and `SKIP`
per check, so failures name the exact file, selector or invariant.

Covered statically: required documents exist; title and description length;
canonical, `og:url`, `og:image` and `twitter:image` agreement; the referenced
Open Graph image is really a 1200×630 PNG on disk; the apple touch icon
resolves; both JSON-LD blocks parse and their `url` values match the canonical
while other entities' URLs are left alone; sitemap and JSON-LD dates agree and
are not in the future; element ids are unique; internal fragment links resolve;
every local asset reference exists and every declared image `width`/`height` and
`srcset` width matches the file's real header dimensions; unreferenced files
under `assets/` are
reported as a warning; external scripts and stylesheets are limited to a known
allowlist; there are no inline executable scripts, no `innerHTML`/`eval`/
`document.write`-class sinks, no `target="_blank"` without `rel="noopener"` and
no plaintext `http://` references; and the invariants from the accessibility
releases are still in place (the `--accent-text-color` token on every red text
surface, no `outline: none` anywhere, a `:focus-visible` outline, the hero
`min-height: 4lh` guard, and the reduced-motion rules).

`--browser` measures 320, 360, 375, 430, 768 and 1440px, and re-measures 320px
and 1440px at 150% and 200% of the root size, covering the SC 1.4.10 reflow
width and the SC 1.4.4 resize-text requirement.

Two browser checks go beyond computed style:

- **Clipped content.** `scrollWidth` cannot detect it, because `overflow-x: hidden`
  on `body` pins `scrollWidth` to `clientWidth` whatever the content does. The
  check instead measures the rightmost pixel each element actually paints, using
  a `Range` rather than `scrollWidth` so that invisible boxes are not counted,
  and separately reports boxes that sit outside the viewport where nothing above
  them clips on purpose. Fixed boxes are compared against `window.innerWidth`,
  so the full-bleed canvas is not mistaken for overflow. The detector is
  validated against `tests/fixtures/overflow-cases.html`, which seeds an
  overflowing paragraph, an overflowing control, a fixed canvas, a clipped
  carousel and a valid block, and asserts the first two are reported and the
  rest are not.
- **Painted focus indicators.** Every tab stop is screenshotted blurred and
  focused and the two are differenced along the outline path, which is what
  separates a focus ring from a border that was already there. A computed
  `2px solid` is not evidence: the project screenshot links reported one while
  Chrome painted nothing. Screenshots are decoded for both PNG colour types
  Chrome emits (RGB and RGBA); assuming one misaligns every pixel and makes a
  real ring look absent.

Known limits, stated rather than hidden:

- A focus stop whose position changes when focused — the skip link moves from
  off-screen to the corner — has no comparable baseline. Those are counted and
  reported, not silently passed.
- The page must reach the state a reader sees first. ScrollReveal sections start
  at `opacity: 0`, so the run steps down the page before measuring; a single fast
  scroll leaves the last section hidden and every ring inside it reads as absent.
- Controls with `transition: all` animate their outline in, so sampling waits for
  the computed outline to stop changing.
- Ring **colour** is not classified. The test proves pixels changed on the
  outline path; it does not prove they are the intended colour.
- Chromium only. Firefox, Safari and real devices are untested here.

**Not covered, because static parsing cannot prove it:** computed colour
contrast, canvas frame rate, and anything about a deployment. `--browser` adds
the computed and pixel checks when a Chromium DevTools endpoint is reachable;
otherwise the script prints `SKIP` with the manual procedure instead of claiming
a pass.

## Contributing

While this is a personal portfolio, suggestions and feedback are welcome! Feel free to:

- Open an issue for bug reports
- Submit feature suggestions
- Provide feedback on design and UX

## Contact

- **LinkedIn**: [Raunak Dey](https://www.linkedin.com/in/raunak-dey-3b413a256/)
- **GitHub**: [raunakdey-07](https://github.com/raunakdey-07)
- **Twitter**: [@the_stoic_coder](https://x.com/the_stoic_coder)

---

**Star this repository if you found it helpful!**
