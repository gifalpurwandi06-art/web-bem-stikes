"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { label: "Beranda", href: "/" },
  { label: "Kalender", href: "/kegiatan" },
  { label: "Karya", href: "/karya" },
  { label: "Struktur", href: "/struktur" },
  { label: "Dokumen", href: "/dokumen" },
  { label: "Galeri", href: "/galeri" },
  { label: "Aspirasi", href: "/aspirasi" },
  { label: "Konsultasi", href: "/konsultasi" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Beranda BEM KM STIKes Dharma Husada">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-blue-700 text-sm font-black text-white">B</span>
          <span className="text-sm font-bold leading-tight text-slate-900">BEM KM <span className="text-slate-500">LENTERA ASA</span></span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-4 xl:flex">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`border-b-2 py-2 text-xs font-semibold transition ${isActive ? "border-blue-700 text-blue-700" : "border-transparent text-slate-600 hover:text-blue-700"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/konsultasi" className="hidden shrink-0 items-center gap-2 bg-blue-100 px-4 py-2.5 text-xs font-bold text-blue-900 transition hover:bg-blue-200 sm:inline-flex">
          Portal Ormawa <span aria-hidden="true">↗</span>
        </Link>
      </div>

      <nav aria-label="Navigasi halaman" className="overflow-x-auto border-t border-slate-100 xl:hidden">
        <div className="mx-auto flex w-max min-w-full max-w-7xl gap-5 px-4 py-2.5 sm:px-6">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`shrink-0 border-b-2 pb-1 text-[11px] font-semibold ${isActive ? "border-blue-700 text-blue-700" : "border-transparent text-slate-600"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-5">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-[10px] text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© 2026 BEM KM STIKes Dharma Husada Bandung</p>
        <p>Kolaborasi mahasiswa untuk kampus dan masyarakat.</p>
      </div>
    </footer>
  );
}