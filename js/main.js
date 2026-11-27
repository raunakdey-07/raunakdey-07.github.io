// Activity calendar and the copy-email button.
// The calendar reads assets/activity.json, which a nightly GitHub Action refreshes.
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const NS = "http://www.w3.org/2000/svg";
  const DAY = 864e5;
  const P = 15, C = 12, X0 = 26, Y0 = 14;
  const LEVEL_NAMES = ["none", "light", "medium", "high", "very high"];

  const iso = (d) => d.toISOString().slice(0, 10);
  const el = (tag, attrs) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };
  const fmt = (d, opts) => d.toLocaleDateString("en-GB", { timeZone: "UTC", ...opts });

  // Counts become 0-4 levels by quartile of the active days, the way GitHub shades its graph.
  function levels(counts) {
    const active = counts.filter((c) => c > 0).sort((a, b) => a - b);
    if (!active.length) return counts.map(() => 0);
    const q = (f) => active[Math.min(active.length - 1, Math.floor(f * active.length))];
    const cuts = [q(0.25), q(0.5), q(0.75)];
    return counts.map((c) => (c > 0 ? 1 + cuts.filter((t) => c > t).length : 0));
  }

  function drawCalendar(data) {
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const start = new Date(today.getTime() - (52 * 7 + today.getUTCDay()) * DAY);
    const n = Math.round((today - start) / DAY) + 1;
    const day = (i) => new Date(start.getTime() + i * DAY);
    const g = levels(Array.from({ length: n }, (_, i) => (data.github && data.github[iso(day(i))]) || 0));
    const k = levels(Array.from({ length: n }, (_, i) => (data.kaggle && data.kaggle[iso(day(i))]) || 0));

    const cal = $("#cal");
    const cells = [];
    const shade = (lv) => (lv ? `color-mix(in srgb, var(--gh) ${[0, 30, 52, 76, 100][lv]}%, var(--cell))` : "var(--cell)");

    ["Mon", "Wed", "Fri"].forEach((t, j) => {
      cal.appendChild(el("text", { x: 0, y: Y0 + (2 * j + 1) * P + 9 })).textContent = t;
    });
    let lastMonth = -1;
    for (let w = 0; w * 7 < n; w++) {
      const d = day(w * 7);
      if (d.getUTCMonth() !== lastMonth && d.getUTCDate() <= 7) {
        lastMonth = d.getUTCMonth();
        cal.appendChild(el("text", { x: X0 + w * P, y: Y0 - 6 })).textContent = d.toLocaleDateString("en-US", { timeZone: "UTC", month: "short" });
      }
    }
    for (let i = 0; i < n; i++) {
      const w = Math.floor(i / 7), x = X0 + w * P, y = Y0 + (i % 7) * P;
      const grp = el("g", { class: "cell", style: `animation-delay:${w * 12}ms` });
      grp.dataset.i = i;
      const sq = el("rect", { x, y, width: C, height: C, rx: 2, fill: shade(g[i]) });
      const dot = el("circle", { cx: x + C / 2, cy: y + C / 2, r: 0, fill: "var(--kg)", stroke: "var(--paper)", "stroke-width": 0.8 });
      grp.append(sq, dot);
      cal.appendChild(grp);
      cells.push({ sq, dot });
    }
    cal.setAttribute("viewBox", `0 0 ${X0 + Math.ceil(n / 7) * P} ${Y0 + 7 * P + 2}`);

    function stats(src) {
      const on = (i) => (src === "gh" ? g[i] > 0 : src === "kg" ? k[i] > 0 : g[i] > 0 || k[i] > 0);
      let days = 0, run = 0, best = 0, both = 0;
      for (let i = 0; i < n; i++) {
        if (on(i)) { days++; run++; best = Math.max(best, run); } else run = 0;
        if (g[i] && k[i]) both++;
      }
      return { days, best, both };
    }
    function paint(src) {
      cells.forEach((c, i) => {
        c.sq.setAttribute("fill", src === "kg" ? "var(--cell)" : shade(g[i]));
        c.dot.setAttribute("r", src === "gh" || !k[i] ? 0 : [0, 2.2, 3.1, 4, 4.6][k[i]]);
      });
      const s = stats(src);
      $("#f-days").textContent = s.days;
      $("#f-streak").textContent = s.best;
      $("#f-both").textContent = src === "both" ? s.both : "–";
    }
    paint("both");

    document.querySelectorAll("[data-src]").forEach((b) =>
      b.addEventListener("click", () => {
        document.querySelectorAll("[data-src]").forEach((x) => x.setAttribute("aria-pressed", x === b));
        paint(b.dataset.src);
      })
    );

    const updated = [data.updated && data.updated.github, data.updated && data.updated.kaggle].filter(Boolean).sort().pop();
    if (updated) $("#asof").textContent = "Updated " + fmt(new Date(updated + "T00:00:00Z"), { day: "numeric", month: "short", year: "numeric" });

    // Hover with a mouse to inspect; tap or click to pin a day.
    let active = null, pinned = false;
    const readout = $("#readout");
    const inspect = (e) => {
      const c = e.target.closest("g.cell");
      if (!c) return;
      const i = +c.dataset.i;
      pinned = e.type === "pointerdown";
      if (active) active.classList.remove("on");
      active = c;
      c.classList.add("on");
      readout.textContent = `${fmt(day(i), { day: "numeric", month: "short", year: "numeric" })} · GitHub ${LEVEL_NAMES[g[i]]} · Kaggle ${LEVEL_NAMES[k[i]]}`;
    };
    cal.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") inspect(e); });
    cal.addEventListener("pointerdown", inspect);
    cal.addEventListener("pointerleave", () => {
      if (pinned || !active) return;
      active.classList.remove("on");
      active = null;
      readout.textContent = "Hover or tap a day";
    });

    // Show the latest weeks first on narrow screens, and fade the left edge once scrolled.
    const sc = $("#cal-scroll");
    sc.scrollLeft = sc.scrollWidth;
    const fade = () => sc.classList.toggle("faded", sc.scrollLeft > 8);
    sc.addEventListener("scroll", fade, { passive: true });
    fade();
  }

  fetch("assets/activity.json", { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then(drawCalendar)
    .catch(() => { $("#readout").textContent = "Activity data is unavailable right now."; });

  $("#copy").addEventListener("click", () => {
    const label = $("#copy-l");
    const email = $("#email");
    const done = (t) => { label.textContent = t; setTimeout(() => { label.textContent = "Copy address"; }, 2000); };
    const select = () => {
      const r = document.createRange();
      r.selectNodeContents(email);
      const s = getSelection();
      s.removeAllRanges();
      s.addRange(r);
      done("Selected, press Ctrl+C");
    };
    try { navigator.clipboard.writeText(email.textContent).then(() => done("Copied"), select); }
    catch (_) { select(); }
  });

  // Back to top: shown once the Contact section is in view or scrolled past.
  const toTop = $("#totop");
  const contact = $("#contact");
  if (toTop && contact && "IntersectionObserver" in window) {
    toTop.hidden = false;
    new IntersectionObserver(([entry]) => {
      toTop.classList.toggle("show", entry.isIntersecting || entry.boundingClientRect.top < 0);
    }).observe(contact);
    toTop.addEventListener("click", () => {
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      const main = $("#content");
      main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: true });
    });
  }
})();
