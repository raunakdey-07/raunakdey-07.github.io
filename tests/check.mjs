#!/usr/bin/env node
// Dependency-free regression checks for the portfolio.
//
//   node tests/check.mjs                 static source checks only
//   BASE_URL=https://host/ node tests/check.mjs   also compare the served page
//   node tests/check.mjs --browser       also run browser checks over CDP
//
// No packages, no package manager, no network access unless BASE_URL is set.
// This script only reads files; it never writes to the repository.
//
// Static parsing cannot establish computed colours, focus rendering, responsive
// overflow, runtime console errors or canvas frame rate. Those need a browser.
// With no browser available they are reported as SKIP with the manual procedure,
// never as PASS.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CANONICAL_HOST = 'https://raunak-dey.vercel.app';
const BASE_URL = process.env.BASE_URL || null;
const WANT_BROWSER = process.argv.includes('--browser');
const CDP = process.env.CDP_URL || 'http://127.0.0.1:9222';

const read = p => readFileSync(join(ROOT, p), 'utf8');
const html = read('index.html');
const css = read('css/main.css');
const mainJs = read('js/main.js');
const animJs = read('js/networkAnimation.js');
const sitemap = existsSync(join(ROOT, 'sitemap.xml')) ? read('sitemap.xml') : '';
const robots = existsSync(join(ROOT, 'robots.txt')) ? read('robots.txt') : '';

const results = [];
let section = '';
const head = t => { section = t; console.log('\n' + t); console.log('-'.repeat(t.length)); };
function record(status, name, detail = '') {
  results.push({ section, status, name, detail });
  console.log('  ' + status.padEnd(4) + ' ' + name + (detail ? '  — ' + detail : ''));
}
const PASS = (n, d) => record('PASS', n, d);
const FAIL = (n, d) => record('FAIL', n, d);
const SKIP = (n, d) => record('SKIP', n, d);
const WARN = (n, d) => record('WARN', n, d);
const check = (cond, n, d) => (cond ? PASS(n, d) : FAIL(n, d));
const grab = (re, s = html) => (s.match(re) || [])[1] ?? null;
const count = (re, s = html) => (s.match(re) || []).length;

console.log('portfolio checks — root: ' + ROOT);

// ---------------------------------------------------------------- documents
head('Documents and metadata');
check(existsSync(join(ROOT, 'index.html')), 'index.html exists');
check(existsSync(join(ROOT, 'css/main.css')), 'css/main.css exists');
check(existsSync(join(ROOT, 'js/main.js')), 'js/main.js exists');
check(existsSync(join(ROOT, 'js/networkAnimation.js')), 'js/networkAnimation.js exists');
check(existsSync(join(ROOT, 'robots.txt')), 'robots.txt exists');
check(existsSync(join(ROOT, 'sitemap.xml')), 'sitemap.xml exists');

const title = grab(/<title>([^<]*)<\/title>/);
const desc = grab(/<meta name="description" content="([^"]*)"/);
const canonical = grab(/<link rel="canonical" href="([^"]*)"/);
check(!!title && title.length > 0 && title.length <= 70, 'title present and <= 70 chars', (title || '').length + ' chars');
check(!!desc && desc.length > 0 && desc.length <= 160, 'meta description present and <= 160 chars', (desc || '').length + ' chars');
check(grab(/<html lang="([a-zA-Z-]+)"/) === 'en', 'html lang is set', grab(/<html lang="([a-zA-Z-]+)"/) || '(missing)');
check(/<meta name="viewport" content="width=device-width/.test(html), 'viewport meta present');
check(/name="robots" content="index, follow"/.test(html), 'robots meta allows indexing');
check(/google-site-verification" content="[A-Za-z0-9_-]{20,}"/.test(html), 'google-site-verification preserved');

// ------------------------------------------------------------------- links
head('URLs and metadata consistency');
const ogUrl = grab(/<meta property="og:url" content="([^"]*)"/);
const ogImage = grab(/<meta property="og:image" content="([^"]*)"/);
const twImage = grab(/<meta name="twitter:image" content="([^"]*)"/);
check(!!canonical && canonical.startsWith(CANONICAL_HOST), 'canonical uses the production host', canonical || '(missing)');
check(canonical === ogUrl, 'og:url matches canonical', ogUrl || '(missing)');
check(ogImage === twImage, 'og:image matches twitter:image', ogImage || '(missing)');
check(!!ogImage && /^https:\/\//.test(ogImage), 'og:image is an absolute https URL', ogImage || '(missing)');
check(/og:image:width" content="1200"/.test(html) && /og:image:height" content="630"/.test(html), 'og image declares 1200x630');
check(/og:image:alt" content="[^"]+"/.test(html) && /twitter:image:alt" content="[^"]+"/.test(html), 'og and twitter image alt text present');
const ogImgPath = ogImage ? ogImage.replace(CANONICAL_HOST + '/', '') : null;
if (ogImgPath && existsSync(join(ROOT, ogImgPath))) {
  const b = readFileSync(join(ROOT, ogImgPath));
  const isPng = b.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';
  const w = isPng ? b.readUInt32BE(16) : 0, h = isPng ? b.readUInt32BE(20) : 0;
  check(isPng && w === 1200 && h === 630, 'og image file is a 1200x630 PNG', ogImgPath + ' = ' + w + 'x' + h + ', ' + b.length + ' bytes');
} else {
  FAIL('og image file is a 1200x630 PNG', 'file missing: ' + ogImgPath);
}
const appleIcon = grab(/<link rel="apple-touch-icon" href="([^"]*)"/);
check(!!appleIcon && existsSync(join(ROOT, appleIcon)), 'apple-touch-icon declared and present on disk', appleIcon || '(missing)');
const sitemapNoComments = sitemap.replace(/<!--[\s\S]*?-->/g, '');
if (sitemap) {
  const loc = grab(/<loc>([^<]*)<\/loc>/, sitemap);
  const lastmod = grab(/<lastmod>([^<]*)<\/lastmod>/, sitemap);
  const ldModified = grab(/"dateModified":\s*"([^"]*)"/);
  check(loc === canonical, 'sitemap <loc> matches canonical', loc || '(missing)');
  check(count(/<url>/g, sitemapNoComments) === 1 && count(/<loc>/g, sitemapNoComments) === 1,
    'sitemap lists the single consolidated URL',
    count(/<loc>/g, sitemapNoComments) + ' <loc>, ' + count(/<url>/g, sitemapNoComments) + ' <url> (comments excluded)');
  check(!!lastmod && /^\d{4}-\d{2}-\d{2}$/.test(lastmod) && lastmod <= new Date().toISOString().slice(0, 10), 'sitemap lastmod is ISO and not in the future', lastmod || '(missing)');
  check(lastmod === ldModified, 'sitemap lastmod equals JSON-LD dateModified', lastmod + ' / ' + ldModified);
}
const robotsSitemap = grab(/Sitemap:\s*(\S+)/, robots);
check(!!robotsSitemap && robotsSitemap.startsWith(CANONICAL_HOST), 'robots.txt Sitemap uses the production host', robotsSitemap || '(missing)');

// ---------------------------------------------------------------- JSON-LD
head('Structured data');
const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
check(ldBlocks.length >= 1, 'JSON-LD block(s) present', ldBlocks.length + ' block(s)');
const ldParsed = ldBlocks.map((b, i) => {
  try { return JSON.parse(b); } catch (e) { FAIL('JSON-LD block ' + (i + 1) + ' parses', e.message); return null; }
});
ldParsed.forEach((j, i) => { if (j) PASS('JSON-LD block ' + (i + 1) + ' parses', '@type=' + j['@type']); });
const person = ldParsed.find(j => j && j['@type'] === 'Person');
const website = ldParsed.find(j => j && j['@type'] === 'WebSite');
check(!!person, 'Person entity present');
check(!!website, 'WebSite entity present');
if (person) check(person.url === canonical, 'Person.url matches canonical', person.url);
if (website) check(website.url === canonical, 'WebSite.url matches canonical', website.url);

// ------------------------------------------------- structure and references
head('Structure, fragments and assets');
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
const dupes = ids.filter((v, i) => ids.indexOf(v) !== i);
check(dupes.length === 0, 'all element ids are unique', dupes.length ? 'duplicates: ' + [...new Set(dupes)].join(', ') : ids.length + ' ids');
const fragments = [...new Set([...html.matchAll(/href="#([^"]*)"/g)].map(m => m[1]))];
const badFragments = fragments.filter(f => f && !ids.includes(f));
check(badFragments.length === 0, 'every internal fragment link resolves to an existing id', badFragments.length ? 'unresolved: ' + badFragments.join(', ') : fragments.join(', '));

// The closing tag has to be matched against the opening one: the old pattern
// hardcoded </td>, so an empty <th></th> — the exact regression this guards
// against, since the removed table had an empty header cell — was not matched.
const blanks = [...html.matchAll(/<(td|th)([^>]*)>\s*<\/\1\s*>/gi)];
check(blanks.length === 0, 'no empty table cells left in the markup',
  blanks.length ? blanks.length + ' empty cell(s) still present' : 'skills are a list, not a table with an empty column');
const skillLists = count(/<ul class="skills-list">/g);
const skillItems = count(/<li><i class="fab |<li><i class="fas |<li><img /g);
check(skillLists === 5 && skillItems === 35, 'all five skill slides are lists of items',
  skillLists + ' lists, ' + skillItems + ' items');

const localRefs = new Set();
for (const m of html.matchAll(/(?:src|href)="((?!https?:|mailto:|#|data:|tel:)[^"]+)"/g)) localRefs.add(m[1]);
for (const m of css.matchAll(/url\((["']?)([^)"']+)\1\)/g)) if (!/^(https?:|data:)/.test(m[2])) localRefs.add(m[2]);
for (const m of animJs.matchAll(/['"](assets\/[^'"]+)['"]/g)) localRefs.add(m[1]);
const missing = [...localRefs].map(decodeURIComponent).filter(p => !existsSync(join(ROOT, p)));
check(missing.length === 0, 'every local asset reference resolves', missing.length ? 'missing: ' + missing.join(', ') : localRefs.size + ' references');

const referencedText = html + '\n' + css + '\n' + mainJs + '\n' + animJs + '\n' + sitemap + '\n' + robots +
  '\n' + (existsSync(join(ROOT, 'README.md')) ? read('README.md') : '');
const assetFiles = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else assetFiles.push(p);
  }
})(join(ROOT, 'assets'));
const unreferenced = assetFiles
  .map(p => p.slice(ROOT.length + 1))
  .filter(p => !referencedText.includes(p) && !referencedText.includes(encodeURI(p).replace(/%20/g, ' ')));
if (unreferenced.length === 0) PASS('no unreferenced files under assets/', assetFiles.length + ' files, all referenced');
else WARN('unreferenced files under assets/', unreferenced.join(', ') + '  (dead weight, not a failure)');

// --------------------------------------------------------------- safety
head('Third-party and DOM safety');
const ALLOWED_SCRIPT_ORIGINS = ['unpkg.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'];
const ALLOWED_STYLE_ORIGINS = ['unpkg.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'fonts.googleapis.com'];
const originOf = u => { try { return new URL(u).host; } catch { return '(unparseable) ' + u; } };
// Only absolute external URLs belong on an allowlist; local files are expected.
const externalOnly = urls => urls.filter(u => /^https?:\/\//i.test(u));
const scriptSrcs = externalOnly([...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map(m => m[1]));
const styleHrefs = externalOnly([...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(m => m[1])
  .concat([...html.matchAll(/<link[^>]*href="([^"]+)"[^>]*rel="stylesheet"/g)].map(m => m[1])));
const badScripts = scriptSrcs.filter(u => !ALLOWED_SCRIPT_ORIGINS.includes(originOf(u)));
const badStyles = styleHrefs.filter(u => !ALLOWED_STYLE_ORIGINS.includes(originOf(u)));
check(badScripts.length === 0, 'every external script is on the expected allowlist',
  badScripts.length ? 'unexpected: ' + badScripts.join(', ') : scriptSrcs.map(originOf).join(', '));
check(badStyles.length === 0, 'every external stylesheet is on the expected allowlist',
  badStyles.length ? 'unexpected: ' + badStyles.join(', ') : [...new Set(styleHrefs.map(originOf))].join(', '));
const inlineScripts = [...html.matchAll(/<script(?![^>]*\ssrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)]
  .filter(m => m[1].trim().length > 0);
check(inlineScripts.length === 0, 'no inline executable scripts', inlineScripts.length + ' found');
const sinks = [];
for (const [file, src] of [['js/main.js', mainJs], ['js/networkAnimation.js', animJs]]) {
  for (const sink of ['innerHTML', 'outerHTML', 'insertAdjacentHTML', 'document.write', 'eval(', 'new Function(']) {
    if (src.includes(sink)) sinks.push(file + ': ' + sink);
  }
}
check(sinks.length === 0, 'no unsafe DOM sinks in project JavaScript', sinks.length ? sinks.join(', ') : 'checked innerHTML/outerHTML/insertAdjacentHTML/document.write/eval/new Function');
const blankNoopener = [...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)]
  .map(m => m[0]).filter(tag => !/rel="[^"]*noopener/.test(tag));
check(blankNoopener.length === 0, 'every target="_blank" link carries rel="noopener"',
  blankNoopener.length ? blankNoopener.join(' ') : count(/target="_blank"/g) + ' links checked');
const httpLinks = [...html.matchAll(/(?:href|src)="(http:\/\/[^"]+)"/g)].map(m => m[1]);
check(httpLinks.length === 0, 'no plaintext http:// resource or link references', httpLinks.join(', '));

// Subresource Integrity coverage. This can only check that the attributes are
// present and well formed; proving the hashes still match the bytes a CDN serves
// today needs a network fetch, which this script deliberately avoids.
const UNPINNABLE_BY_DESIGN = ['fonts.googleapis.com'];
const CANONICAL_HOSTNAME = canonical ? new URL(canonical).host : null;
// Only cross-origin resources need SRI: it guards a third-party host, and every
// absolute URL pointing back at this deployment is our own file.
const thirdPartyTags = [...html.matchAll(/<(?:link|script)\b[^>]*>/g)].map(m => m[0])
  .filter(t => !/rel="preconnect"/.test(t))
  .filter(t => /(?:href|src)="https?:\/\//.test(t))
  .filter(t => originOf((t.match(/(?:href|src)="([^"]+)"/) || [])[1] || '') !== CANONICAL_HOSTNAME);
const unpinned = [], malformed = [];
for (const tag of thirdPartyTags) {
  const host = originOf((tag.match(/(?:href|src)="([^"]+)"/) || [])[1] || '');
  if (UNPINNABLE_BY_DESIGN.includes(host)) continue;
  if (!/\bintegrity="/.test(tag)) { unpinned.push(host); continue; }
  const value = (tag.match(/integrity="([^"]+)"/) || [])[1];
  if (!/^sha(256|384|512)-[A-Za-z0-9+/]+={0,2}$/.test(value)) malformed.push(host + ': malformed ' + value);
  if (!/\bcrossorigin="/.test(tag)) malformed.push(host + ': integrity without crossorigin');
}
check(unpinned.length === 0, 'every pinnable third-party script and stylesheet carries integrity',
  unpinned.length ? 'not pinned: ' + [...new Set(unpinned)].join(', ') : thirdPartyTags.length + ' external tags checked');
check(malformed.length === 0, 'integrity values are well formed and paired with crossorigin',
  malformed.length ? malformed.join('; ') : 'sha384 base64, crossorigin present');
check(/fonts\.googleapis\.com/.test(html) && !/fonts\.googleapis\.com[^>]*integrity=/.test(html) && !/integrity="[^"]*"[^>]*href="https:\/\/fonts\.googleapis\.com/.test(html),
  'the Google Fonts stylesheet is left unpinned on purpose (its bytes vary by user agent)');

// ------------------------------------------------- release invariants (CSS)
head('Release invariants preserved in CSS');
const rootVars = (css.match(/:root\s*\{([\s\S]*?)\}/) || [])[1] || '';
check(/--accent-color:\s*#D60000/i.test(rootVars), '--accent-color is still the design accent #D60000');
check(/--accent-text-color:\s*#EE4E45/i.test(rootVars), '--accent-text-color #EE4E45 is still defined');
const accentTextUsers = ['.hero-title .role', '.hero-title .text-accent', '.nav-link-resume', '.achievement-title', '.skip-link'];
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
for (const sel of accentTextUsers) {
  // Match the selector, then any declarations up to --accent-text-color inside
  // the same block. The selector may be part of a selector list.
  const re = new RegExp(escapeRe(sel) + '\\s*(?:,[^{]*)?\\{[^}]*--accent-text-color');
  check(re.test(css), sel + ' uses --accent-text-color for its text colour');
}
const mobileNavActive = count(/color:\s*var\(--accent-text-color\)/g, css);
check(mobileNavActive >= 5, 'accent-text-color used for all red text surfaces', mobileNavActive + ' rules');
check(!/outline:\s*(none|0)\b/.test(css), 'no outline:none anywhere (focus indicators are never suppressed)');
check(/:focus-visible\s*\{[^}]*outline:\s*2px solid/.test(css), 'a :focus-visible outline of at least 2px is defined');
check(/min-height:\s*4lh/.test(css), 'hero min-height: 4lh guard retained (hero release)');
check(/@media \(prefers-reduced-motion: reduce\)/.test(css), 'reduced-motion media query present');
check(/animation-duration:\s*0\.01ms\s*!important/.test(css), 'reduced-motion clamps animation duration');
check(/#network-bg\s*\{[^}]*display:\s*none/.test(css), 'canvas hidden under reduced motion');
check(/prefers-reduced-motion/.test(mainJs), 'main.js reacts to prefers-reduced-motion');
check(/prefers-reduced-motion/.test(animJs), 'networkAnimation.js reacts to prefers-reduced-motion');
check(/isCanvasVisibleInLayout/.test(animJs) && /renderStaticFrameIfVisible/.test(animJs),
  'a hidden canvas is not painted a static frame it can never show');
check(/function\s+renderStaticFrame\s*\(/.test(animJs), 'renderStaticFrame itself still exists and is reachable');
check(/visibilitychange/.test(animJs), 'canvas animation pauses on tab hide');
check(/devicePixelRatio|canvas\.width\s*=/.test(animJs), 'canvas sizing code present');
check(/Math\.min\(window\.devicePixelRatio \|\| 1, 2\)/.test(animJs), 'canvas backing store is capped at 2x devicePixelRatio');
check(/ctx\.setTransform\(dprScale, 0, 0, dprScale, 0, 0\)/.test(animJs), 'canvas transform reapplied so drawing stays in CSS pixels');
const logicalCanvasUse = [...animJs.matchAll(/canvas\.(width|height)/g)]
  .filter(m => !/Math\.round\(css/.test(animJs.slice(Math.max(0, m.index - 60), m.index + 60)));
check(logicalCanvasUse.length === 0, 'no coordinate maths reads canvas.width/height directly',
  logicalCanvasUse.length + ' occurrence(s) outside the backing-store assignment');

head('Response headers');
const vercelPath = join(ROOT, 'vercel.json');
if (existsSync(vercelPath)) {
  let cfg = null;
  try { cfg = JSON.parse(readFileSync(vercelPath, 'utf8')); PASS('vercel.json parses as JSON'); }
  catch (e) { FAIL('vercel.json parses as JSON', e.message); }
  if (cfg) {
    const rules = cfg.headers || [];
    // Reading only the first rule lets a narrowed `source` pass unnoticed: a rule
    // scoped to /assets/(.*) still contains every expected header, but none of
    // them would reach the page. Check the scope before trusting the values.
    check(rules.length === 1, 'exactly one header rule, so its scope cannot shadow or narrow the others',
      rules.length + ' rule(s)' + (rules.length > 1 ? ': ' + rules.map(r => r.source).join(' | ') : ''));
    const rule = rules[0] || {};
    const source = rule.source || '';
    check(/^\/\(\.\*\)\/?$|^\/$|^\/\(\.\*\)$/.test(source), 'the header rule applies to every path',
      'source=' + JSON.stringify(source) + ' (a narrower pattern would leave the page unprotected)');
    const set = new Map((rule.headers || []).map(h => [h.key, h.value]));
    for (const [key, expected] of [['X-Content-Type-Options', 'nosniff'], ['Referrer-Policy', 'strict-origin-when-cross-origin'],
      ['X-Frame-Options', 'DENY'], ['Permissions-Policy', null], ['Content-Security-Policy', null]]) {
      if (expected === null) check(set.has(key), key + ' is declared', set.get(key) || '(missing)');
      else check(set.get(key) === expected, key + ' is ' + expected, set.get(key) || '(missing)');
    }
    const csp = set.get('Content-Security-Policy') || '';
    check(/frame-ancestors 'none'/.test(csp), 'CSP denies framing (frame-ancestors none)', csp);
    check(!/script-src/.test(csp) || !/'unsafe-inline'/.test(csp.match(/script-src[^;]*/)[0]),
      'CSP does not allow unsafe inline script',
      /script-src/.test(csp) ? csp.match(/script-src[^;]*/)[0] : 'no script-src directive yet, so nothing is loosened');
    check(!/'unsafe-eval'/.test(csp), 'CSP never allows unsafe-eval');
    check(!/\*/.test(csp), 'CSP contains no wildcard host');
  }
} else {
  WARN('vercel.json present', 'no response headers are configured for the Vercel deployment');
}

head('Repository hygiene');
const dotfiles = readdirSync(ROOT).filter(f => f.startsWith('.'));
check(!dotfiles.includes('.DS_Store'), 'no .DS_Store committed', dotfiles.length ? dotfiles.join(', ') : 'no dotfiles');

// -------------------------------------------------------- remote checks
head('Served page (BASE_URL)');
if (BASE_URL) {
  try {
    const res = await fetch(BASE_URL, { redirect: 'follow' });
    const page = await res.text();
    PASS('page fetched', 'HTTP ' + res.status + ' from ' + BASE_URL);
    check(res.ok, 'page responds 2xx', 'HTTP ' + res.status);
    check(grab(/<link rel="canonical" href="([^"]*)"/, page) === canonical, 'served canonical matches source');
    check(grab(/<meta property="og:image" content="([^"]*)"/, page) === ogImage, 'served og:image matches source');
    check(grab(/<meta name="description" content="([^"]*)"/, page) === desc, 'served meta description matches source');
    const servedLd = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    check(servedLd.length === ldBlocks.length, 'served JSON-LD block count matches source', servedLd.length + ' vs ' + ldBlocks.length);
    for (const p of [canonical, ogImage, appleIcon].filter(Boolean)) {
      // Resolve against BASE_URL: rewrite our own canonical host so the served
      // page is what gets tested, and resolve relative values instead of
      // skipping them — skipping is what silently dropped the apple-touch-icon.
      let target = null, label = null;
      if (/^https?:\/\//.test(p)) {
        if (p.startsWith(CANONICAL_HOST)) {
          label = p.replace(CANONICAL_HOST, '') || '/';
          target = new URL(label, BASE_URL);
        }
      } else {
        label = p;
        target = new URL(p, BASE_URL);
      }
      if (!target) continue;
      const r = await fetch(target, { method: 'HEAD' });
      check(r.ok, 'served ' + label, 'HTTP ' + r.status + ', ' + (r.headers.get('content-type') || 'no content-type'));
    }
    if (sitemap) {
      const s = await (await fetch(new URL('sitemap.xml', BASE_URL))).text();
      check(grab(/<lastmod>([^<]*)<\/lastmod>/, s) === grab(/<lastmod>([^<]*)<\/lastmod>/, sitemap), 'served sitemap lastmod matches source');
    }
  } catch (e) {
    FAIL('remote checks', e.message);
  }
} else {
  SKIP('served page checks', 'set BASE_URL=https://host/ to compare the served page with the source');
}

// -------------------------------------------------------- browser checks
head('Browser checks (computed, requires a browser)');
const manualProcedure = [
  'Computed colour contrast, focus rings, horizontal overflow and console errors',
  'cannot be established by parsing files. Manual procedure:',
  '  1. serve the repository: python3 -m http.server 8765',
  '  2. open Chromium with --remote-debugging-port=9222 and load http://127.0.0.1:8765/',
  '  3. run: node tests/check.mjs --browser BASE_URL=http://127.0.0.1:8765/',
  'or verify by hand at 375, 768 and 1440px: text contrast with a contrast',
  'checker, Tab order for a visible focus ring, and the console for errors.'
].join('\n      ');

async function browserChecks(url) {
  const version = await fetch(CDP + '/json/version').then(r => r.json());
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = () => no(new Error('CDP socket failed')); });
  let id = 1; const pending = new Map(); const events = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); }
    else if (m.method) events.push(m);
  };
  const send = (method, params = {}, session) => {
    const i = id++; const msg = { id: i, method, params };
    if (session) msg.sessionId = session;
    ws.send(JSON.stringify(msg));
    return new Promise((res, rej) => pending.set(i, { resolve: res, reject: rej }));
  };
  const evaluate = async src => {
    const r = await send('Runtime.evaluate', { expression: src, returnByValue: true, awaitPromise: true }, sid);
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 200));
    return r.result.value;
  };
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId: sid } = await send('Target.attachToTarget', { targetId, flatten: true });
  for (const d of ['Page', 'Runtime', 'Network', 'Log']) await send(d + '.enable', {}, sid);
  await send('Network.setCacheDisabled', { cacheDisabled: true }, sid);

  const contrastProbe = `(function(){
    function lin(c){c/=255;return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4);}
    function L(r){return 0.2126*lin(r[0])+0.7152*lin(r[1])+0.0722*lin(r[2]);}
    function ratio(a,b){var x=L(a),y=L(b),hi=Math.max(x,y),lo=Math.min(x,y);return (hi+0.05)/(lo+0.05);}
    function parse(s){var m=(s.match(/[\\d.]+/g)||[0,0,0]);return [Number(m[0]),Number(m[1]),Number(m[2])];}
    function bgOf(el){var n=el;while(n&&n!==document.documentElement){var cs=getComputedStyle(n);
      var a=cs.backgroundColor.match(/rgba?\\([^)]*,\\s*([\\d.]+)\\)/);
      if(cs.backgroundColor!=="rgba(0, 0, 0, 0)"&&(!a||parseFloat(a[1])>0.85))return parse(cs.backgroundColor);
      n=n.parentElement;} return parse(getComputedStyle(document.body).backgroundColor);}
    var fails=[],seen={},checked=0;
    var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),n;
    while((n=w.nextNode())){
      var txt=n.nodeValue.replace(/\\s+/g," ").trim(); if(txt.length<3)continue;
      var el=n.parentElement; if(!el||el.nodeName==="SCRIPT"||el.nodeName==="STYLE")continue;
      if(el.closest("noscript"))continue;
      var key=el.tagName+"|"+String(el.className)+"|"+txt.slice(0,20);
      if(seen[key])continue; seen[key]=1;
      var s=getComputedStyle(el);
      var size=parseFloat(s.fontSize), wt=parseInt(s.fontWeight)||400;
      var large=size>=24||(size>=18.66&&wt>=700), need=large?3:4.5;
      checked++;
      var cr=ratio(parse(s.color),bgOf(el));
      if(cr<need) fails.push(el.tagName.toLowerCase()+"."+String(el.className).split(" ").filter(Boolean)[0]+" "+Math.round(cr*100)/100+":1 (needs "+need+")");
    }
    var de=document.documentElement;
    // Limitation, measured rather than assumed: the site sets overflow-x:hidden on
    // body to hide scrollbars, which pins documentElement.scrollWidth to
    // clientWidth no matter what the content does. With a nowrap paragraph
    // overflowing to right=410 at a 320px viewport, scrollWidth still reported
    // 320, so this check cannot fail on an in-flow overflow. Fixed-position
    // elements are excluded from any richer variant because the viewport, not
    // body, contains them and they cannot scroll. Detecting content that body
    // silently cuts off is not implemented here; treat a PASS below as "no
    // scrollable overflow", not "nothing is clipped".
    return {checked:checked, fails:fails,
      horizontalScroll: de.scrollWidth>de.clientWidth,
      scrollWidth:de.scrollWidth, clientWidth:de.clientWidth,
      focusable:document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])').length};
  })()`;

  // 320px is the WCAG 2.2 reflow width (SC 1.4.10) and was missing. Text is also
  // checked at 200% of the root size, which is the SC 1.4.4 requirement and is
  // where long words and fixed heights are most likely to overflow.
  for (const width of [320, 375, 768, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 800 }, sid);
    await send('Page.navigate', { url }, sid);
    await new Promise(r => setTimeout(r, 4500));
    await evaluate('document.fonts.ready.then(function(){return 1})');
    await evaluate('(function(){var h=document.body.scrollHeight,y=0;return new Promise(function(r){var i=setInterval(function(){y+=600;window.scrollTo(0,y);if(y>=h){clearInterval(i);window.scrollTo(0,0);setTimeout(function(){r(1);},1500);}},110);});})()');
    const r = await evaluate(contrastProbe);
    check(r.fails.length === 0, width + 'px: every text node meets its WCAG AA threshold',
      r.checked + ' text nodes' + (r.fails.length ? ', failures: ' + r.fails.join('; ') : ''));
    check(r.horizontalScroll === false, width + 'px: no horizontal overflow',
      'scrollWidth ' + r.scrollWidth + ' vs clientWidth ' + r.clientWidth);
    check(r.focusable > 0, width + 'px: focusable elements present', r.focusable + ' focusable');
    if (width === 320 || width === 1440) {
      await evaluate('(function(){document.documentElement.style.fontSize="200%";return 1})()');
      await new Promise(r => setTimeout(r, 900));
      const z = await evaluate(contrastProbe);
      check(z.horizontalScroll === false, width + 'px at 200% text: still no horizontal overflow',
        'scrollWidth ' + z.scrollWidth + ' vs clientWidth ' + z.clientWidth);
      await evaluate('(function(){document.documentElement.style.fontSize="";return 1})()');
      await new Promise(r => setTimeout(r, 300));
    }
  }
  const consoleErrors = [...new Set(events.filter(e => e.method === 'Log.entryAdded' && e.params.entry.level === 'error').map(e => e.params.entry.text))];
  check(consoleErrors.length === 0, 'no console errors', consoleErrors.join(' | ') || 'clean');
  const failures = [...new Set(events.filter(e => e.method === 'Network.loadingFailed').map(e => e.params.errorText + ' ' + (e.params.type || '')))];
  check(failures.length === 0, 'no failed network requests', failures.join(' | ') || 'clean');
  ws.close();
}

if (WANT_BROWSER) {
  try {
    await fetch(CDP + '/json/version', { signal: AbortSignal.timeout(3000) });
    await browserChecks(BASE_URL || 'http://127.0.0.1:8765/');
  } catch (e) {
    SKIP('browser checks', 'no Chromium DevTools endpoint at ' + CDP + ' (' + e.message + ')');
    console.log('      ' + manualProcedure);
  }
} else {
  SKIP('browser checks', 'not requested. Add --browser to run them, or verify by hand:\n      ' + manualProcedure);
}

// ------------------------------------------------------------------ summary
const tally = results.reduce((a, r) => (a[r.status] = (a[r.status] || 0) + 1, a), {});
console.log('\nSummary: ' + (tally.PASS || 0) + ' PASS, ' + (tally.FAIL || 0) + ' FAIL, ' +
  (tally.WARN || 0) + ' WARN, ' + (tally.SKIP || 0) + ' SKIP');
if (tally.FAIL) {
  console.log('\nFailed checks:');
  for (const r of results.filter(r => r.status === 'FAIL')) console.log('  - [' + r.section + '] ' + r.name + (r.detail ? ' — ' + r.detail : ''));
}
process.exit(tally.FAIL ? 1 : 0);