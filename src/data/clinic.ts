// Facts of Медичний центр «Асклепій» — only from veon/client.json (company.contacts, facts C-001…C-011).
// One source of hours for the hero board, the locations board and JSON-LD.

export type ServiceKind = "doctors" | "lab" | "mri" | "ct";
/** Days use JS numbering: 0 = неділя … 6 = субота. */
export interface Range { d: number[]; from: string; to: string }
export interface Service { kind: ServiceKind; ranges: Range[]; note?: string }
export interface Address {
  id: string;
  city: "Житомир" | "Бердичів";
  street: string;
  extra?: string;
  services: Service[];
  labNote?: string;
}

const WD = [1, 2, 3, 4, 5];
const WD_SAT = [1, 2, 3, 4, 5, 6];
const SAT = [6];
const ALL = [0, 1, 2, 3, 4, 5, 6];
const r = (d: number[], from: string, to: string): Range => ({ d, from, to });

export const SERVICE_LABEL: Record<ServiceKind, string> = {
  doctors: "Прийом лікарів",
  lab: "Аналізи",
  mri: "МРТ",
  ct: "КТ",
};

export const addresses: Address[] = [
  {
    id: "pokrovska-31", city: "Житомир", street: "вул. Покровська, 31",
    services: [
      { kind: "doctors", ranges: [r(WD, "08:00", "20:00"), r(SAT, "08:00", "14:00")] },
      { kind: "mri", ranges: [r(ALL, "06:00", "23:30")] },
      { kind: "lab", note: "дорослі", ranges: [r(WD, "07:00", "14:00"), r(SAT, "08:00", "12:00")] },
    ],
  },
  {
    id: "liubarska-4", city: "Житомир", street: "вул. Любарська, 4",
    services: [{ kind: "lab", ranges: [r(WD, "08:00", "14:00"), r(SAT, "08:00", "12:00")] }],
  },
  {
    id: "shevchenka-14", city: "Житомир", street: "вул. Шевченка, 14",
    services: [
      { kind: "doctors", ranges: [r(WD, "08:00", "20:00")] },
      { kind: "lab", ranges: [r(WD, "07:00", "14:00"), r(SAT, "08:00", "12:00")] },
    ],
  },
  {
    id: "rykhlika-11a", city: "Житомир", street: "вул. Рихліка, 11а", extra: "ЖК «Домашній»",
    services: [
      { kind: "doctors", ranges: [r(WD, "08:00", "20:00"), r(SAT, "08:00", "14:00")] },
      { kind: "lab", ranges: [r(WD_SAT, "08:00", "12:00")] },
    ],
  },
  {
    id: "vitruka-2a", city: "Житомир", street: "вул. Вітрука, 2а",
    services: [
      { kind: "doctors", ranges: [r(WD, "08:00", "20:00"), r(SAT, "08:00", "14:00")] },
      { kind: "lab", ranges: [r(WD, "08:00", "12:00"), r(SAT, "08:00", "11:30")] },
    ],
  },
  {
    id: "feshchenka-24-4", city: "Житомир", street: "вул. Фещенка-Чопівського, 24/4",
    services: [
      { kind: "ct", ranges: [r(WD, "08:00", "20:00")] },
      { kind: "lab", ranges: [r(WD, "09:00", "11:00")] },
    ],
  },
  {
    id: "myru-5b", city: "Житомир", street: "пр-т Миру, 5б",
    services: [{ kind: "lab", ranges: [r(WD, "08:00", "16:00")] }],
  },
  {
    id: "myru-21", city: "Житомир", street: "пр-т Миру, 21",
    services: [
      { kind: "doctors", ranges: [r(WD, "08:00", "20:00"), r(SAT, "08:00", "14:00")] },
      { kind: "lab", ranges: [r(WD, "08:00", "11:30"), r(SAT, "08:00", "10:30")] },
    ],
  },
  {
    id: "chornovola-8a", city: "Житомир", street: "вул. Чорновола, 8а",
    services: [{ kind: "doctors", ranges: [r(WD_SAT, "08:00", "23:00")] }],
    labNote: "забір аналізів не проводиться",
  },
  {
    id: "shpakovskyi-18", city: "Житомир", street: "пр-д Шпаковський, 18",
    services: [
      { kind: "doctors", ranges: [r(WD, "08:00", "20:00")] },
      { kind: "lab", ranges: [r(WD, "07:00", "14:00"), r(SAT, "08:00", "12:00")] },
    ],
  },
  {
    id: "berdychiv-zhytomyrska-46-1", city: "Бердичів", street: "вул. Житомирська, 46/1",
    services: [
      { kind: "doctors", ranges: [r(WD, "07:30", "18:00"), r(SAT, "08:00", "13:00")] },
      { kind: "lab", ranges: [r(WD, "07:30", "12:30"), r(SAT, "08:00", "10:30")] },
    ],
  },
];

export const phones = [
  { href: "tel:+380980463303", label: "+380 98 046 33 03" },
  { href: "tel:+380950103103", label: "+380 95 010 31 03" },
  { href: "tel:+380931700103", label: "+380 93 170 01 03" },
];
export const mainPhone = phones[0];
export const email = "info@asklepiy.com";
export const telegram = "https://t.me/Asklepiy_Clinika_Bot";
export const viber = "viber://pa?chatURI=asklepiy";
export const socials = [
  { name: "Instagram", href: "https://www.instagram.com/asklepiyua/" },
  { name: "YouTube", href: "https://www.youtube.com/@asklepiy_zt" },
  { name: "TikTok", href: "https://www.tiktok.com/@asklepiyua" },
];
export const legal = {
  name: "ТОВ «Медичний центр Асклепій Плюс»",
  edrpou: "36004607",
  licence: "Ліцензія МОЗ серія АЕ №460148 від 30.04.2014",
  founded: "1999-05-12",
};

export const mapHref = (a: Address) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a.street}, ${a.city}`)}`;

export const fullAddress = (a: Address) => `м. ${a.city}, ${a.street}`;

const DAY_SHORT = ["нд", "пн", "вт", "ср", "чт", "пт", "сб"];

export function daysLabel(d: number[]): string {
  const key = d.join(",");
  if (key === ALL.join(",")) return "щодня";
  if (key === WD.join(",")) return "пн–пт";
  if (key === WD_SAT.join(",")) return "пн–сб";
  return d.map((x) => DAY_SHORT[x]).join(", ");
}

export const rangesLabel = (ranges: Range[]) =>
  ranges.map((x) => `${daysLabel(x.d)} ${x.from}–${x.to}`).join(", ");

export const byKind = (kind: ServiceKind) =>
  addresses.filter((a) => a.services.some((s) => s.kind === kind));
