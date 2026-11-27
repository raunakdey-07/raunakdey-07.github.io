#!/usr/bin/env node
// Dependency-free checks for the portfolio. Run: node tests/check.mjs
// Reads files only; exits 1 if any check fails.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import vm from "node:vm";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

let failed = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${!ok && detail ? `  (${detail})` : ""}`);
  if (!ok) failed++;
}

const html = read("index.html");
const css = read("css/main.css");
const js = read("js/main.js");
const headEnd = html.indexOf("</head>");
const head = html.slice(0, headEnd);

// Document structure and metadata
check("doctype and lang", /^<!DOCTYPE html>\s*<html lang="en">/i.test(html));
check("head closes before body opens", headEnd > 0 && headEnd < html.indexOf("<body"));
for (const [label, re] of [
  ["title", /<title>[^<]+<\/title>/],
  ["meta description", /<meta name="description" content="[^"]{50,}"/],
  ["canonical link", /<link rel="canonical" href="https:\/\/raunak-dey\.vercel\.app\/"/],
  ["og:title", /<meta property="og:title"/],
  ["og:description", /<meta property="og:description"/],
  ["viewport", /<meta name="viewport"/],
]) check(`${label} is in <head>`, re.test(head));
check("JSON-LD parses", (() => {
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  try { return m && JSON.parse(m[1])["@type"] === "Person"; } catch { return false; }
})());

// Ids and in-page references
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
check("ids are unique", dupes.length === 0, dupes.join(", "));
const refs = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
const missingRefs = [...new Set(refs.filter((r) => !ids.includes(r)))];
check("every #reference has a target", missingRefs.length === 0, missingRefs.join(", "));
for (const id of ["cal", "cal-scroll", "readout", "asof", "f-days", "f-streak", "f-both", "copy", "copy-l", "email"])
  check(`script target #${id} exists`, ids.includes(id));

// Local files
const local = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1])
  .filter((u) => !/^(https?:|mailto:|#|data:)/.test(u));
const missingFiles = [...new Set(local.filter((u) => !existsSync(join(ROOT, decodeURIComponent(u.split(/[?#]/)[0])))))];
check("every local link and asset exists", missingFiles.length === 0, missingFiles.join(", "));

// External links and hosts
const blank = [...html.matchAll(/<a [^>]*target="_blank"[^>]*>/g)].map((m) => m[0]);
check("new-tab links carry rel=noopener noreferrer", blank.every((a) => /rel="noopener noreferrer"/.test(a)));
const external = [...html.matchAll(/<(?:script|link)[^>]+(?:src|href)="(https?:\/\/[^"/]+)/g)].map((m) => m[1]);
const allowed = ["https://fonts.googleapis.com", "https://fonts.gstatic.com", "https://raunak-dey.vercel.app"];
const strays = [...new Set(external.filter((h) => !allowed.includes(h)))];
check("no third-party scripts or stylesheets beyond Google Fonts", strays.length === 0, strays.join(", "));

// CSS
const depth = [...css].reduce((d, ch) => (d < 0 ? d : d + (ch === "{") - (ch === "}")), 0);
check("CSS braces balance", depth === 0);
const defined = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
const used = [...new Set([...css.matchAll(/var\((--[\w-]+)/g), ...html.matchAll(/var\((--[\w-]+)/g), ...js.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]))];
const inline = new Set([...html.matchAll(/style="[^"]*?(--[\w-]+)\s*:/g)].map((m) => m[1]));
const undefinedVars = used.filter((v) => !defined.has(v) && !inline.has(v));
check("every CSS variable used is defined", undefinedVars.length === 0, undefinedVars.join(", "));

// JavaScript
check("js/main.js parses", (() => { try { new vm.Script(js, { filename: "js/main.js" }); return true; } catch (e) { console.log(e.message); return false; } })());

// Activity data
let data = null;
try { data = JSON.parse(read("assets/activity.json")); } catch { /* reported below */ }
check("assets/activity.json is valid JSON", data !== null);
if (data) {
  for (const src of ["github", "kaggle"]) {
    const entries = Object.entries(data[src] || {});
    check(`activity.${src} has entries`, entries.length > 0);
    const bad = entries.filter(([d, c]) => !/^\d{4}-\d{2}-\d{2}$/.test(d) || !Number.isInteger(c) || c < 1);
    check(`activity.${src} uses YYYY-MM-DD keys and positive integer counts`, bad.length === 0, bad.slice(0, 3).join("; "));
    check(`activity.updated.${src} is a date`, /^\d{4}-\d{2}-\d{2}$/.test((data.updated || {})[src] || ""));
  }
}

console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
