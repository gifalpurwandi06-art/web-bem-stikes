"use client";

import Link from "next/link";
import { SiteFooter, SiteHeader } from "./components/site-chrome";
import { useCalendarEvents } from "./lib/use-calendar-events";

const completedActivities = [
  {
    title: "EUFORIA, Ormawa EXPO 2026",
    category: "Internal",
    date: "01 Oktober 2026",
    mark: "03 ",
    cover: "bg-[#d9ecff] text-[#17344f]",
  },
  {
    title: "Training ESQ",
    category: "Non-Akademik",
    date: "30 September 2026",
    mark: "02",
    cover: "bg-[#205f97] text-white",
  },
  {
    title: "Pelantikan dan Angkat Sumpah",
    category: "Non-Akademik",
    date: "25 Septermber 2026",
    mark: "01",
    cover: "bg-[#3d679b] text-white",
  },
];

const healthStories = [
  {
    number: "01",
    topic: "Keamanan pangan",
    title: "Program MBG dan perlindungan siswa",
    summary: "Laporan dugaan keracunan di Karo kembali menyorot pentingnya pengawasan pangan dan keselamatan peserta didik.",
    source: "Pantau liputan BBC dan media nasional",
    href: "https://news.google.com/search?q=keracunan+MBG+Karo+BBC&hl=id&gl=ID&ceid=ID%3Aid",
  },
  {
    number: "02",
    topic: "Cek fakta kesehatan",
    title: "Campak, vaksin, dan narasi antivaksin",
    summary: "Kasus campak dan informasi keliru tentang vaksin membuat rujukan ke sumber kesehatan tepercaya semakin penting.",
    source: "Pantau liputan Kompas dan The Conversation",
    href: "https://news.google.com/search?q=campak+Indonesia+narasi+antivaksin&hl=id&gl=ID&ceid=ID%3Aid",
  },
  {
    number: "03",
    topic: "Kesehatan mental",
    title: "Skrining awal bukan diagnosis",
    summary: "Kemenkes menyediakan skrining kesehatan jiwa gratis melalui SATUSEHAT Mobile untuk membantu deteksi dini.",
    source: "Kementerian Kesehatan RI",
    href: "https://kemkes.go.id/id/skrining-kesehatan-jiwa-gratis-lewat-satusehat-mobile",
  },
];

export default function Home() {
  const { events: agenda } = useCalendarEvents();
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const upcomingEvents = agenda.filter((event) => event.date >= todayKey).sort((first, second) => first.date.localeCompare(second.date));

  return (
    <div className="min-h-screen bg-[#f3f7fb] font-sans text-[#17344f]">
      <SiteHeader />

      <main>
        <section aria-labelledby="home-title" className="relative overflow-hidden bg-[#173f68]">
          <div className="mx-auto grid min-h-[470px] max-w-7xl items-center gap-10 px-5 py-12 sm:min-h-[500px] sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-12">
            <div className="max-w-2xl text-white">
              <p className="mb-5 flex items-center gap-3 text-[11px] font-bold uppercase text-[#b8dbff]">
                <span className="h-px w-8 bg-[#b8dbff]" /> Kabinet Lentera ASA · 2026
              </p>
              <h1 id="home-title" className="max-w-xl text-4xl font-bold leading-[1.08] sm:text-5xl">
                BEM KM STIKes Dharma Husada Bandung
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
                Ruang kolaborasi mahasiswa untuk bergerak, menyuarakan aspirasi, dan menghadirkan dampak bagi kampus serta masyarakat.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/kegiatan" className="inline-flex items-center gap-3 bg-[#b8dbff] px-5 py-3 text-xs font-bold text-[#17344f] transition hover:bg-[#d9ecff]">
                  Jelajahi kegiatan <span aria-hidden="true">→</span>
                </Link>
                <Link href="/aspirasi" className="inline-flex items-center gap-3 border border-white/60 px-5 py-3 text-xs font-semibold text-white transition hover:bg-white/10">
                  Sampaikan aspirasi <span aria-hidden="true">↗</span>
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-2 border-t border-white/25 pt-4 text-[10px] font-semibold uppercase text-white/75">
                <span>12 organisasi mahasiswa</span>
                <span>Head · Hand · Heart</span>
              </div>
            </div>
            <div aria-hidden="true" className="relative hidden min-h-[330px] items-center justify-center border-l border-white/20 lg:flex">
              <span className="absolute right-8 top-4 text-[10px] font-bold uppercase text-[#b8dbff]">Lentera ASA 2026</span>
              <span className="font-black leading-none text-[#b8dbff]" style={{ fontSize: "clamp(12rem, 22vw, 20rem)" }}>12</span>
              <span className="absolute bottom-8 left-10 max-w-[13rem] border-t border-white/50 pt-3 text-xs font-semibold leading-5 text-white/80">Organisasi mahasiswa.<br />Satu ruang kolaborasi.</span>
              <span className="absolute right-10 top-24 h-12 w-12 border border-[#b8dbff]/80" />
              <span className="absolute bottom-20 right-16 h-5 w-5 bg-[#91c1ea]" />
            </div>
          </div>
        </section>

        <section aria-label="Agenda mendatang" className="agenda-marquee overflow-hidden border-b border-[#d6e2f0] bg-[#d9ecff] py-3">
          <div className="flex items-center gap-5">
            <span className="relative z-10 shrink-0 bg-[#d9ecff] pl-4 text-[10px] font-extrabold uppercase text-[#17344f] sm:pl-8">Agenda Mendatang</span>
            {upcomingEvents.length > 0 ? (
              <div className="agenda-marquee-track flex min-w-max items-center gap-8 pr-8">
                {[...upcomingEvents, ...upcomingEvents].map((event, index) => (
                  <span key={`${event.id}-${index}`} aria-hidden={index >= upcomingEvents.length} className="inline-flex items-center gap-3 text-xs font-semibold text-[#17344f]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#3d679b]" />
                    {new Date(`${event.date}T12:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} · {event.title}
                  </span>
                ))}
              </div>
            ) : (
              <Link href="/kegiatan" className="text-xs font-semibold text-[#17344f]">Belum ada agenda mendatang · Buka kalender →</Link>
            )}
          </div>
        </section>

        <section aria-labelledby="activities-title" className="py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 border-b border-[#d6e2f0] pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase text-[#315584]">Jejak kolaborasi</p>
                <h2 id="activities-title" className="text-2xl font-bold leading-tight text-[#17344f] sm:text-3xl">Kegiatan yang telah terlaksana</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#64736b]">Program dan momen mahasiswa yang tercatat di galeri BEM KM STIKes - Lentera ASA</p>
              </div>
              <Link href="/galeri" className="inline-flex w-fit items-center gap-2 border-b border-[#205f97] pb-1 text-xs font-bold text-[#205f97] hover:text-[#315584]">
                Buka galeri lengkap <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {completedActivities.map((activity) => (
                <article key={activity.title} className="group overflow-hidden border border-[#dce5db] bg-white">
                  <div className={`relative flex aspect-[1.55/1] items-end overflow-hidden p-4 ${activity.cover}`}>
                    <span aria-hidden="true" className="absolute right-4 top-1 text-[6rem] font-black leading-none opacity-15">{activity.mark}</span>
                    <span className="relative max-w-[12rem] border-t border-current/40 pt-2 text-[10px] font-bold uppercase">Arsip kegiatan · BEM KM</span>
                    <span className="absolute left-3 top-3 bg-[#b8dbff] px-2.5 py-1.5 text-[10px] font-bold uppercase text-[#17344f]">{activity.date}</span>
                  </div>
                  <div className="p-4 sm:p-5">
                    <p className="text-[10px] font-bold uppercase text-[#315584]">{activity.category} · Terlaksana</p>
                    <h3 className="mt-2 text-base font-bold leading-snug text-[#17344f]">{activity.title}</h3>
                    <Link href="/galeri" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#205f97] hover:text-[#315584]">
                      Lihat dokumentasi <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="stories-title" className="bg-[#173f68] py-14 text-white sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 border-b border-white/20 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase text-[#b8dbff]">Sorotan media · 4 Oktober 2026</p>
                <h2 id="stories-title" className="text-2xl font-bold leading-tight sm:text-3xl">Isu kesehatan yang ramai dibahas</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Kurasi isu untuk dibaca kritis. Telusuri sumber sebelum meneruskan informasi.</p>
              </div>
              <span className="w-fit border border-white/30 px-3 py-2 text-[10px] font-semibold uppercase text-white/75">Baca · Cek · Bagikan bijak</span>
            </div>

            <ol className="divide-y divide-white/20">
              {healthStories.map((story) => (
                <li key={story.number} className="grid gap-3 py-5 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:py-6">
                  <span className="text-sm font-semibold text-[#b8dbff]">{story.number}</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-[#91c1ea]">{story.topic}</p>
                    <h3 className="mt-1 text-base font-bold text-white sm:text-lg">{story.title}</h3>
                    <p className="mt-1 max-w-3xl text-xs leading-5 text-white/70 sm:text-sm">{story.summary}</p>
                    <p className="mt-2 text-[10px] font-medium text-white/50">{story.source}</p>
                  </div>
                  <a href={story.href} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-2 border-b border-[#b8dbff]/70 pb-1 text-xs font-semibold text-[#b8dbff] hover:text-white">
                    Baca sumber <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-[#e3effa] py-10 sm:py-12">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div>
              <p className="text-[10px] font-bold uppercase text-[#315584]">Ruang untuk bergerak</p>
              <h2 className="mt-1 text-xl font-bold text-[#17344f]">Punya gagasan untuk kampus?</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/aspirasi" className="bg-[#205f97] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#194d7c]">Kirim aspirasi <span aria-hidden="true">→</span></Link>
              <Link href="/konsultasi" className="border border-[#205f97] px-4 py-3 text-xs font-bold text-[#205f97] transition hover:bg-white/60">Konsultasi berkas <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}