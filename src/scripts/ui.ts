// Page behaviour: header line on scroll, phone menu, channel panel, directions index, locations filter, bottom bar.
// Every part degrades to plain anchors and visible content without scripts.
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wide = window.matchMedia("(min-width: 900px)");

/* header: hairline only while scrolled */
const header = document.querySelector<HTMLElement>("[data-header]");
const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* phone menu (<details>): close on a link and on Escape */
const menu = document.querySelector<HTMLDetailsElement>("[data-menu]");
menu?.addEventListener("click", (e) => {
  const link = (e.target as HTMLElement).closest<HTMLAnchorElement>("a");
  if (!link) return;
  const hash = link.getAttribute("href") || "";
  const target = hash.startsWith("#") ? document.getElementById(hash.slice(1)) : null;
  menu.open = false;
  if (target) {
    e.preventDefault();
    history.pushState(null, "", hash);
    requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu?.open) { menu.open = false; menu.querySelector("summary")?.focus(); }
});

/* channel panel for «Записатися» */
const dialog = document.querySelector<HTMLDialogElement>("#book");
let opener: HTMLElement | null = null;
if (dialog && typeof dialog.showModal === "function") {
  document.querySelectorAll<HTMLAnchorElement>("[data-book]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      opener = btn;
      if (menu) menu.open = false;
      if (wide.matches) {
        const r = btn.getBoundingClientRect();
        const w = 400;
        const left = r.left + w + 16 <= window.innerWidth ? r.left : Math.max(16, r.right - w);
        const below = r.bottom + 8;
        const fits = below + 360 < window.innerHeight;
        dialog.classList.toggle("is-centered", !fits);
        dialog.style.setProperty("--book-top", `${Math.round(below)}px`);
        dialog.style.setProperty("--book-left", `${Math.round(left)}px`);
      } else {
        dialog.classList.remove("is-centered");
      }
      dialog.showModal();
      dialog.querySelector<HTMLElement>(".book__ch")?.focus();
    });
  });
  dialog.querySelector("[data-book-close]")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => opener?.focus());
  window.addEventListener("resize", () => { if (dialog.open && wide.matches) dialog.close(); });
}

/* directions: «Дорослим / Дітям», photo frame follows the group (wide), accordion (phone) */
const dir = document.querySelector<HTMLElement>("[data-directions]");
const frame = document.querySelector<HTMLElement>("[data-frame]");
if (dir) {
  const groups = [...dir.querySelectorAll<HTMLElement>("[data-group]")];
  const setActive = (key: string) => {
    groups.forEach((g) => g.classList.toggle("is-active", g.dataset.group === key));
    frame?.querySelectorAll<HTMLElement>("[data-layer]").forEach((l) => l.classList.toggle("is-active", l.dataset.layer === key));
  };
  const firstVisible = () => groups.find((g) => !g.hidden);
  const setAccordion = () => {
    groups.forEach((g, i) => {
      const btn = g.querySelector<HTMLButtonElement>("[data-group-btn]")!;
      const body = g.querySelector<HTMLElement>(".group__body")!;
      if (wide.matches) { btn.setAttribute("aria-expanded", "true"); btn.removeAttribute("aria-controls"); body.hidden = false; }
      else { btn.setAttribute("aria-controls", body.id); const open = i === 0; btn.setAttribute("aria-expanded", String(open)); body.hidden = !open; }
    });
  };
  groups.forEach((g) => {
    const btn = g.querySelector<HTMLButtonElement>("[data-group-btn]")!;
    const body = g.querySelector<HTMLElement>(".group__body")!;
    const activate = () => { if (wide.matches) setActive(g.dataset.group!); };
    g.addEventListener("mouseenter", activate);
    g.addEventListener("focusin", activate);
    btn.addEventListener("click", () => {
      if (wide.matches) { setActive(g.dataset.group!); return; }
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      body.hidden = !open;
    });
  });
  dir.querySelectorAll<HTMLButtonElement>("[data-aud]").forEach((b) => {
    b.addEventListener("click", () => {
      const aud = b.dataset.aud!;
      dir.querySelectorAll<HTMLButtonElement>("[data-aud]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      groups.forEach((g) => { g.hidden = !(g.dataset.for === aud || g.dataset.for === "both"); });
      const f = firstVisible();
      if (f) setActive(f.dataset.group!);
    });
  });
  // start on «Дорослим»
  groups.forEach((g) => { g.hidden = !(g.dataset.for === "adult" || g.dataset.for === "both"); });
  setAccordion();
  setActive(firstVisible()?.dataset.group ?? "adult");
  wide.addEventListener("change", setAccordion);
}

/* locations: filter by service and city */
const filters = document.querySelector<HTMLElement>("[data-loc-filters]");
if (filters) {
  const rows = [...document.querySelectorAll<HTMLElement>("[data-loc]")];
  const empty = document.querySelector<HTMLElement>("[data-loc-empty]");
  const count = document.querySelector<HTMLElement>("[data-loc-count]");
  let kind = "all", city = "all";
  const plural = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? "адресу" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? "адреси" : "адрес");
  const apply = () => {
    let shown = 0;
    rows.forEach((r) => {
      const match = (kind === "all" || r.dataset.kinds!.split(" ").includes(kind)) && (city === "all" || r.dataset.city === city);
      if (match) {
        shown++;
        r.hidden = false;
        r.classList.remove("is-leaving");
      } else if (!r.hidden) {
        if (reduce) { r.hidden = true; return; }
        r.classList.add("is-leaving");
        window.setTimeout(() => { if (r.classList.contains("is-leaving")) { r.hidden = true; r.classList.remove("is-leaving"); } }, 160);
      }
    });
    if (empty) empty.hidden = shown > 0;
    if (count) count.textContent = `Показано ${shown} ${plural(shown)}`;
  };
  const press = (attr: "kind" | "city", value: string) => {
    filters.querySelectorAll<HTMLButtonElement>(`[data-${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x.dataset[attr] === value)));
    if (attr === "kind") kind = value; else city = value;
    apply();
  };
  filters.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
    if (!b) return;
    if (b.dataset.kind) press("kind", b.dataset.kind);
    if (b.dataset.city) press("city", b.dataset.city);
  });
  document.querySelectorAll<HTMLAnchorElement>("[data-set-filter]").forEach((a) => {
    a.addEventListener("click", () => { press("kind", a.dataset.setFilter!); press("city", "all"); });
  });
  apply();
}

/* bottom bar on phones: once the hero is off screen */
const bar = document.querySelector<HTMLElement>("[data-mbar]");
const hero = document.querySelector("#hero");
if (bar && hero && "IntersectionObserver" in window) {
  bar.inert = true;
  new IntersectionObserver(([e]) => { bar.classList.toggle("is-shown", !e.isIntersecting); bar.inert = e.isIntersecting; }, { threshold: 0 }).observe(hero);
} else bar?.classList.add("is-shown");

/* locations on phones: one row per address (street, status, call); schedule and route open on demand */
document.querySelectorAll<HTMLButtonElement>("[data-loc-toggle]").forEach((b) => {
  b.addEventListener("click", () => {
    const row = b.closest<HTMLElement>("[data-loc]");
    const open = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", String(open));
    row?.classList.toggle("is-open", open);
  });
});
