// «Відчинено зараз»: the static schedule (SSR text) is replaced by the live status computed from the hours
// in src/data/clinic.ts at Europe/Kyiv time. Updates once a minute without animation.
import { addresses, byKind, SERVICE_LABEL, type Range, type ServiceKind } from "../data/clinic";

const DAY_FULL = ["неділя", "понеділок", "вівторок", "середа", "четвер", "п'ятниця", "субота"];
const DAY_ACC = ["у неділю", "у понеділок", "у вівторок", "у середу", "у четвер", "у п'ятницю", "у суботу"];
const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Now { day: number; min: number; hm: string }
const toMin = (s: string) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };

function kyivNow(): Now {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Kyiv", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const hh = get("hour"), mm = get("minute");
  return { day: WEEK.indexOf(get("weekday")), min: Number(hh) * 60 + Number(mm), hm: `${hh}:${mm}` };
}

interface Status { open: boolean; until?: string; next?: { offset: number; day: number; from: string } }

function statusOf(ranges: Range[], now: Now): Status {
  for (const r of ranges) {
    if (r.d.includes(now.day) && toMin(r.from) <= now.min && now.min < toMin(r.to)) return { open: true, until: r.to };
  }
  for (let offset = 0; offset < 8; offset++) {
    const day = (now.day + offset) % 7;
    const starts = ranges.filter((r) => r.d.includes(day) && (offset > 0 || toMin(r.from) > now.min)).map((r) => r.from).sort();
    if (starts.length) return { open: false, next: { offset, day, from: starts[0] } };
  }
  return { open: false };
}

function nextLabel(s: Status): string {
  if (!s.next) return "зачинено";
  const { offset, day, from } = s.next;
  if (offset === 0) return `відкриється о ${from}`;
  if (offset === 1) return `завтра з ${from}`;
  return `${DAY_ACC[day]} з ${from}`;
}

function earliest(list: Status[]): Status {
  return list.filter((s) => s.next).sort((a, b) => a.next!.offset - b.next!.offset || toMin(a.next!.from) - toMin(b.next!.from))[0] ?? { open: false };
}

function serviceStatuses(kind: ServiceKind, now: Now) {
  return byKind(kind).map((a) => statusOf(a.services.find((s) => s.kind === kind)!.ranges, now));
}

let first = true;

function live(el: Element, text: string, delay = 0) {
  if (el.textContent === text) return;
  el.textContent = text;
  if (first) {
    el.classList.add("is-live");
    (el as HTMLElement).style.setProperty("--row-delay", `${delay}ms`);
  }
}

function setRow(key: string, open: boolean, text: string, delay: number) {
  const row = document.querySelector(`[data-board="${key}"]`);
  if (!row) return;
  row.classList.toggle("is-open", open);
  row.classList.toggle("is-closed", !open);
  const t = row.querySelector("[data-board-text]");
  if (t) live(t, text, delay);
}

function update() {
  const now = kyivNow();
  if (now.day < 0) return;

  const title = document.querySelector("[data-board-title]");
  if (title) {
    const t = `Сьогодні, ${DAY_FULL[now.day]}, ${now.hm}`;
    title.textContent = t;
  }

  // hero board
  const mri = serviceStatuses("mri", now)[0];
  const ct = serviceStatuses("ct", now)[0];
  const doctors = serviceStatuses("doctors", now);
  const lab = serviceStatuses("lab", now);
  const openDoc = doctors.filter((s) => s.open).length;
  const openLab = lab.filter((s) => s.open).length;

  setRow("mri", mri.open, mri.open ? `відчинено до ${mri.until}` : nextLabel(mri), 0);
  setRow("doctors", openDoc > 0, openDoc > 0 ? `відчинено ${openDoc} з ${doctors.length}` : nextLabel(earliest(doctors)), 40);
  setRow("lab", openLab > 0, openLab > 0 ? `відчинено ${openLab} з ${lab.length}` : nextLabel(earliest(lab)), 80);
  setRow("ct", ct.open, ct.open ? `відчинено до ${ct.until}` : nextLabel(ct), 120);

  // phone strip
  const strip = document.querySelector("[data-strip-text]");
  if (strip) {
    const openNow: string[] = [];
    if (mri.open) openNow.push(`МРТ до ${mri.until}`);
    if (openDoc > 0) openNow.push("прийом лікарів");
    if (openLab > 0) openNow.push("аналізи");
    if (ct.open) openNow.push(`КТ до ${ct.until}`);
    live(strip, openNow.length ? `Зараз відчинено: ${openNow.join(", ")}` : `Зараз зачинено. МРТ ${nextLabel(mri)}`);
  }

  // locations board
  for (const a of addresses) {
    const el = document.querySelector(`[data-loc="${a.id}"] [data-loc-status]`);
    if (!el) continue;
    const st = a.services.map((s) => ({ kind: s.kind, s: statusOf(s.ranges, now) }));
    const open = st.filter((x) => x.s.open);
    let text: string;
    if (open.length) {
      text = "Відчинено: " + open.map((x) => `${x.kind === "mri" || x.kind === "ct" ? SERVICE_LABEL[x.kind] : SERVICE_LABEL[x.kind].toLowerCase()} до ${x.s.until}`).join(", ");
    } else {
      text = `Зачинено, ${nextLabel(earliest(st.map((x) => x.s)))}`;
    }
    el.classList.toggle("is-open", open.length > 0);
    el.classList.toggle("is-closed", open.length === 0);
    if (el.textContent !== text) el.textContent = text;
  }
  first = false;
}

update();
setInterval(update, 60_000);
