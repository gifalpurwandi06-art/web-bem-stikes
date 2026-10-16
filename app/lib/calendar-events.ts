export interface KalenderEvent {
  id: string;
  date: string;
  title: string;
  kategori: string;
  waktu: string;
  deskripsi: string;
}

export const calendarEventsStorageKey = "bem_kegiatan_v1";
export const calendarEventsUpdatedEvent = "bem-kegiatan-updated";

export const defaultCalendarEvents: KalenderEvent[] = [
  {
    id: "agenda-2026-10-04",
    date: "2026-10-04",
    title: "Baksos & Pemeriksaan Mata Gratis",
    kategori: "Pengabdian",
    waktu: "08:00 - Selesai",
    deskripsi: "Pemeriksaan kesehatan dan edukasi bersama warga.",
  },
  {
    id: "agenda-2026-10-12",
    date: "2026-10-12",
    title: "Workshop Penulisan Proposal & PKM",
    kategori: "Akademik",
    waktu: "13:30 WIB",
    deskripsi: "Lokakarya penulisan proposal untuk mahasiswa dan ormawa.",
  },
  {
    id: "agenda-2026-10-20",
    date: "2026-10-20",
    title: "Pelantikan Pengurus 12 Ormawa",
    kategori: "Organisasi",
    waktu: "09:00 WIB",
    deskripsi: "Pelantikan pengurus organisasi mahasiswa periode 2026.",
  },
  {
    id: "agenda-2026-10-28",
    date: "2026-10-28",
    title: "Rapat Koordinasi BEM & Prodi",
    kategori: "Internal",
    waktu: "15:00 WIB",
    deskripsi: "Koordinasi agenda BEM bersama program studi.",
  },
];

let cachedRaw: string | null | undefined;
let cachedEvents: KalenderEvent[] = defaultCalendarEvents;

export function getCalendarEventsSnapshot(): KalenderEvent[] {
  if (typeof window === "undefined") return defaultCalendarEvents;

  const raw = window.localStorage.getItem(calendarEventsStorageKey);
  if (raw === cachedRaw) return cachedEvents;

  cachedRaw = raw;
  if (!raw) {
    cachedEvents = defaultCalendarEvents;
    return cachedEvents;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    cachedEvents = Array.isArray(parsed) ? parsed as KalenderEvent[] : defaultCalendarEvents;
  } catch {
    cachedEvents = defaultCalendarEvents;
  }

  return cachedEvents;
}

export function subscribeToCalendarEvents(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(calendarEventsUpdatedEvent, onStoreChange);
  queueMicrotask(onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(calendarEventsUpdatedEvent, onStoreChange);
  };
}

export function saveCalendarEvents(events: KalenderEvent[]): void {
  if (typeof window === "undefined") return;

  const raw = JSON.stringify(events);
  window.localStorage.setItem(calendarEventsStorageKey, raw);
  cachedRaw = raw;
  cachedEvents = events;
  window.dispatchEvent(new Event(calendarEventsUpdatedEvent));
}