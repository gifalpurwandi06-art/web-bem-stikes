"use client";

import { useState } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import type { KalenderEvent } from "@/lib/calendar-events";
import { useCalendarEvents } from "@/src/hooks/use-calendar-events";

const adminEmail = "admin@bemdhb.test";
const adminPassword = "bemdhb2026";

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(
  dateKey: string,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  },
) {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString("id-ID", options);
}

export default function CalendarPage() {
  const {
    events,
    saveEvent,
    deleteEvent,
    error: calendarError,
  } = useCalendarEvents();
  const [selectedDate, setSelectedDate] = useState("2026-10-04");
  const [visibleMonth, setVisibleMonth] = useState(new Date(2026, 9, 1));
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("2026-10-04");
  const [eventCategory, setEventCategory] = useState("Kemahasiswaan");
  const [eventTime, setEventTime] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  const selectedEvents = events.filter((event) => event.date === selectedDate);
  const today = toDateKey(new Date());

  const changeMonth = (amount: number) => {
    setVisibleMonth(new Date(year, month + amount, 1));
  };

  const handleAdminLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      emailInput.trim().toLowerCase() === adminEmail &&
      passwordInput === adminPassword
    ) {
      setIsAdmin(true);
      setAdminLoginOpen(false);
      setLoginError("");
      setEventDate(selectedDate);
      return;
    }
    setLoginError("Email atau password admin tidak sesuai.");
  };

  const handleSaveEvent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!eventTitle.trim() || !eventDate) return;

    const savedEvent: KalenderEvent = {
      id: editingEventId || `agenda-${Date.now()}`,
      date: eventDate,
      title: eventTitle.trim(),
      kategori: eventCategory,
      waktu: eventTime.trim() || "Waktu menyusul",
      deskripsi:
        eventDescription.trim() || "Informasi kegiatan dari BEM KM dan Ormawa.",
    };
    const result = await saveEvent(savedEvent);
    if (result.error) {
      setSaveMessage(result.error);
      return;
    }
    setSelectedDate(eventDate);
    const parsedDate = new Date(`${eventDate}T12:00:00`);
    setVisibleMonth(
      new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1),
    );
    setEditingEventId(null);
    setEventTitle("");
    setEventTime("");
    setEventDescription("");
    setSaveMessage(
      editingEventId
        ? "Perubahan agenda berhasil disimpan."
        : "Agenda berhasil ditambahkan dan tampil di beranda.",
    );
  };

  const beginEditEvent = (event: KalenderEvent) => {
    setEditingEventId(event.id);
    setEventTitle(event.title);
    setEventDate(event.date);
    setEventCategory(event.kategori);
    setEventTime(event.waktu);
    setEventDescription(event.deskripsi);
    setSaveMessage("");
  };

  const cancelEditEvent = () => {
    setEditingEventId(null);
    setEventTitle("");
    setEventDate(selectedDate);
    setEventTime("");
    setEventDescription("");
  };

  const handleDeleteEvent = async (event: KalenderEvent) => {
    if (!window.confirm(`Hapus agenda "${event.title}"?`)) return;
    const result = await deleteEvent(event.id);
    if (result.error) {
      setSaveMessage(result.error);
      return;
    }
    if (editingEventId === event.id) cancelEditEvent();
    setSaveMessage("Agenda berhasil dihapus.");
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-[10px] font-bold uppercase text-indigo-700">
              Jadwal & agenda
            </p>
            <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              Kalender Kegiatan
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Pilih tanggal untuk melihat agenda BEM KM dan Ormawa.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin ? (
              <>
                <span className="border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-800">
                  Admin BEM aktif
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdmin(false)}
                  className="border border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-white"
                >
                  Keluar
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setAdminLoginOpen((open) => !open)}
                className="border border-slate-300 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700"
              >
                {adminLoginOpen
                  ? "Tutup login admin"
                  : "Masuk sebagai Admin BEM"}
              </button>
            )}
          </div>
        </div>

        {calendarError && (
          <p
            role="alert"
            className="mb-6 border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900"
          >
            {calendarError}
          </p>
        )}

        {adminLoginOpen && !isAdmin && (
          <form
            onSubmit={handleAdminLogin}
            className="mb-6 grid gap-3 border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <div>
              <label
                htmlFor="admin-email"
                className="mb-1 block text-[10px] font-bold uppercase text-slate-600"
              >
                Email admin
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={emailInput}
                onChange={(event) => setEmailInput(event.target.value)}
                placeholder="admin@bemdhb.test"
                className="w-full border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label
                htmlFor="admin-password"
                className="mb-1 block text-[10px] font-bold uppercase text-slate-600"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={passwordInput}
                onChange={(event) => setPasswordInput(event.target.value)}
                className="w-full border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-800"
            >
              Masuk
            </button>
            {loginError && (
              <p
                role="alert"
                className="text-xs font-semibold text-red-700 sm:col-span-3"
              >
                {loginError}
              </p>
            )}
          </form>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)]">
          <section
            aria-label="Pilih tanggal kegiatan"
            className="border border-slate-200 bg-white p-4 sm:p-7"
          >
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold capitalize text-slate-900">
                {visibleMonth.toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  aria-label="Bulan sebelumnya"
                  className="h-9 w-9 border border-slate-300 text-lg text-slate-700 hover:bg-slate-100"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  aria-label="Bulan berikutnya"
                  className="h-9 w-9 border border-slate-300 text-lg text-slate-700 hover:bg-slate-100"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="mb-2 grid grid-cols-7 text-center text-[10px] font-bold uppercase text-slate-500 sm:text-xs">
              {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
                <span key={day} className="py-2">
                  {day}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {days.map((day, index) => {
                if (!day)
                  return (
                    <div key={`blank-${index}`} className="aspect-square" />
                  );
                const dateKey = toDateKey(new Date(year, month, day));
                const hasEvent = events.some((event) => event.date === dateKey);
                const isSelected = selectedDate === dateKey;
                return (
                  <button
                    key={dateKey}
                    type="button"
                    aria-label={`${day} ${visibleMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}${hasEvent ? ", ada agenda" : ""}`}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedDate(dateKey);
                      setEventDate(dateKey);
                    }}
                    className={`relative flex aspect-square min-h-10 flex-col items-center justify-center gap-1 border text-xs font-semibold transition sm:min-h-12 ${isSelected ? "border-blue-700 bg-blue-700 text-white" : dateKey === today ? "border-blue-500 bg-blue-50 text-blue-800" : "border-transparent bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"}`}
                  >
                    <span>{day}</span>
                    {hasEvent && (
                      <span
                        aria-hidden="true"
                        className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-blue-100" : "bg-indigo-600"}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-[10px] text-slate-500">
              <span className="h-2 w-2 rounded-full bg-indigo-600" /> Ada
              kegiatan
              <span className="ml-3 h-2 w-2 rounded-full bg-blue-500" /> Hari
              ini
            </div>
          </section>

          <aside className="space-y-5">
            <section className="border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <h2 className="text-sm font-bold text-slate-900">
                  Agenda tertera pada tanggal tersebut
                </h2>
                <time
                  dateTime={selectedDate}
                  className="text-[10px] font-bold text-blue-700"
                >
                  {formatDate(selectedDate, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </div>
              {selectedEvents.length ? (
                <div className="divide-y divide-slate-100">
                  {selectedEvents.map((event) => (
                    <article key={event.id} className="py-4 last:pb-0">
                      <p className="text-[10px] font-bold uppercase text-indigo-700">
                        {event.kategori}
                      </p>
                      <h3 className="mt-1 text-base font-bold leading-snug text-slate-900">
                        {event.title}
                      </h3>
                      <p className="mt-2 text-xs font-semibold text-slate-600">
                        {event.waktu}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-slate-600">
                        {event.deskripsi}
                      </p>
                      {isAdmin && (
                        <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                          <button
                            type="button"
                            onClick={() => beginEditEvent(event)}
                            className="border border-blue-200 px-3 py-2 text-[10px] font-bold text-blue-800 hover:bg-blue-50"
                          >
                            Edit agenda
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(event)}
                            className="border border-red-200 px-3 py-2 text-[10px] font-bold text-red-700 hover:bg-red-50"
                          >
                            Hapus agenda
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-xs leading-5 text-slate-500">
                  Belum ada agenda pada tanggal ini.
                </p>
              )}
            </section>

            {isAdmin && (
              <section className="border border-blue-200 bg-blue-50/70 p-5 sm:p-6">
                <div className="mb-4 border-b border-blue-200 pb-3">
                  <p className="text-[10px] font-bold uppercase text-blue-700">
                    Kelola agenda
                  </p>
                  <h2 className="mt-1 text-sm font-bold text-slate-900">
                    {editingEventId ? "Edit kegiatan" : "Tambah kegiatan"}
                  </h2>
                </div>
                <form onSubmit={handleSaveEvent} className="space-y-3">
                  <div>
                    <label
                      htmlFor="event-title"
                      className="mb-1 block text-[10px] font-bold text-slate-700"
                    >
                      Nama kegiatan
                    </label>
                    <input
                      id="event-title"
                      required
                      value={eventTitle}
                      onChange={(event) => setEventTitle(event.target.value)}
                      className="w-full border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="event-date"
                        className="mb-1 block text-[10px] font-bold text-slate-700"
                      >
                        Tanggal
                      </label>
                      <input
                        id="event-date"
                        type="date"
                        required
                        value={eventDate}
                        onChange={(event) => setEventDate(event.target.value)}
                        className="w-full min-w-0 border border-slate-300 bg-white px-2 py-2.5 text-xs outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="event-time"
                        className="mb-1 block text-[10px] font-bold text-slate-700"
                      >
                        Waktu
                      </label>
                      <input
                        id="event-time"
                        value={eventTime}
                        onChange={(event) => setEventTime(event.target.value)}
                        placeholder="09:00 WIB"
                        className="w-full border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="event-category"
                      className="mb-1 block text-[10px] font-bold text-slate-700"
                    >
                      Kategori
                    </label>
                    <select
                      id="event-category"
                      value={eventCategory}
                      onChange={(event) => setEventCategory(event.target.value)}
                      className="w-full border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600"
                    >
                      {[
                        "Kemahasiswaan",
                        "Pengabdian",
                        "Akademik",
                        "Organisasi",
                        "Internal",
                        "Lainnya",
                      ].map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="event-description"
                      className="mb-1 block text-[10px] font-bold text-slate-700"
                    >
                      Keterangan
                    </label>
                    <textarea
                      id="event-description"
                      rows={3}
                      value={eventDescription}
                      onChange={(event) =>
                        setEventDescription(event.target.value)
                      }
                      className="w-full resize-y border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-700 px-4 py-3 text-xs font-bold text-white hover:bg-blue-800"
                  >
                    {editingEventId ? "Simpan perubahan" : "Simpan agenda"}
                  </button>
                  {editingEventId && (
                    <button
                      type="button"
                      onClick={cancelEditEvent}
                      className="w-full border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-white"
                    >
                      Batal edit
                    </button>
                  )}
                  {saveMessage && (
                    <p
                      role="status"
                      className="text-xs font-semibold text-blue-800"
                    >
                      {saveMessage}
                    </p>
                  )}
                </form>
              </section>
            )}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
