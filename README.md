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
  dark background in Chromium. The project card clipping was relaxed so the ring
  is not cut off.
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
breaks the site silently. The fuller policy is not shipped yet, and the reason
is specific:

- The three non-blocking stylesheet preloads use inline
  `onload="this.onload=null;this.rel='stylesheet'"` handlers, so a
  `script-src` would have to allow `'unsafe-inline'`, which removes most of the
  protection. Moving the swap into `js/main.js` would remove the need, at the
  cost of the third-party stylesheets then depending on that file loading.
- `font-src` must include `https://cdnjs.cloudflare.com` and `data:`, or the
  Font Awesome webfonts are blocked. This was verified by serving a draft policy
  without them: Chromium blocked ten font files and the icons disappeared.
- `style-src` needs the Google Fonts and the two CDN stylesheet origins, and
  `'unsafe-inline'` for the two `<noscript>` style blocks that apply when
  JavaScript is off.

A policy including all of that was tested and loads with a clean console, so the
work is understood and bounded. It is left as a follow-up rather than shipped
with the headers, because it needs the inline-handler decision first.

Until a deployment happens, none of this is visible in production: the live
response still returns only `strict-transport-security` and Vercel's defaults.
Verify with `curl -I https://raunak-dey.vercel.app/` after deploying.

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
every local asset reference exists; unreferenced files under `assets/` are
reported as a warning; external scripts and stylesheets are limited to a known
allowlist; there are no inline executable scripts, no `innerHTML`/`eval`/
`document.write`-class sinks, no `target="_blank"` without `rel="noopener"` and
no plaintext `http://` references; and the invariants from the accessibility
releases are still in place (the `--accent-text-color` token on every red text
surface, no `outline: none` anywhere, a `:focus-visible` outline, the hero
`min-height: 4lh` guard, and the reduced-motion rules).

**Not covered, because static parsing cannot prove it:** computed colour
contrast, focus-ring rendering, responsive overflow, runtime console errors and
canvas frame rate. `--browser` adds those when a Chromium DevTools endpoint is
reachable; otherwise the script prints `SKIP` with the manual procedure instead
of claiming a pass.

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
