"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { SiteFooter, SiteHeader } from "../components/site-chrome";

interface DokumentasiItem {
  id: string;
  judul: string;
  tanggal: string;
  kategori: string;
  deskripsi: string;
  emojiBanner: string;
  fotoDataUrl?: string;
}

const galleryStorageKey = "bem_galeri_dokumentasi_v1";
const adminEmail = "admin@bemdhb.test";
const adminPassword = "bemdhb2026";

const dokumentasiAwal: DokumentasiItem[] = [
  {
    id: "galeri-2026-00-00",
    judul: "Tambahkan Judul",
    tanggal: "Tambahkan Tanggal",
    kategori: "Tambahkan Kategori",
    deskripsi: "Tambahkan Deskripsi.",
    emojiBanner: "+",
  },
  {
    id: "galeri-2026-10-01",
    judul: "EUFORIA, Ormawa EXPO 2026",
    tanggal: "2026-10-01",
    kategori: "Internal",
    deskripsi: "Momen kebersamaan bagi seluruh mahasiswa STIKes DHB dengan terlaksana Ormawa EXPO, Empowering, Unity, Participation, and Harmony in Organizational Realtions & Interaction.",
    emojiBanner: "12",
  },
  {
    id: "galeri-2026-09-30",
    judul: "Training ESQ",
    tanggal: "2026-09-30",
    kategori: "Akademik",
    deskripsi: "Telah terlaksana kegiatan Training ESQ sebagai ruang untuk belajar, berbagi, dan mempererat silaturahmi dalam semangat berorganisasi, kegiatan ini menjadi bagian dari kolaborasi BEM KM STIKes DHB bersama STIKes PPNI.",
    emojiBanner: "E",
  },
  {
    id: "galeri-2026-09-25",
    judul: "Pelantikan dan Angkat Sumpah",
    tanggal: "2026-09-25",
    kategori: "Non-Akademik",
    deskripsi: "Awal perjalanan baru bagi seluruh Himpunan dan Ormawa STIKes Dharma Husada.",
    emojiBanner: "P",
  },
];

function formatDokumentasiDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function GaleriPage() {
  const [dokumentasi, setDokumentasi] = useState(dokumentasiAwal);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [judul, setJudul] = useState("");
  const [tanggal, setTanggal] = useState("2026-10-04");
  const [kategori, setKategori] = useState("Kemahasiswaan");
  const [deskripsi, setDeskripsi] = useState("");
  const [fotoDataUrl, setFotoDataUrl] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(galleryStorageKey);
    if (!saved) return;

    queueMicrotask(() => {
      try {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) setDokumentasi(parsed as DokumentasiItem[]);
      } catch {
        setDokumentasi(dokumentasiAwal);
      }
    });
  }, []);

  const handleAdminLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (emailInput.trim().toLowerCase() === adminEmail && passwordInput === adminPassword) {
      setIsAdmin(true);
      setAdminLoginOpen(false);
      setLoginError("");
      return;
    }
    setLoginError("Email atau password admin tidak sesuai.");
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Pilih file gambar untuk dokumentasi.");
      event.target.value = "";
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setFormError("Ukuran foto maksimal 1,5 MB.");
      event.target.value = "";
      return;
    }

    setFormError("");
    const reader = new FileReader();
    reader.onload = () => setFotoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePostDocumentation = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!judul.trim() || !tanggal || !deskripsi.trim()) return;

    const newItem: DokumentasiItem = {
      id: `galeri-${Date.now()}`,
      judul: judul.trim(),
      tanggal,
      kategori,
      deskripsi: deskripsi.trim(),
      emojiBanner: kategori.slice(0, 1).toUpperCase(),
      fotoDataUrl: fotoDataUrl || undefined,
    };
    const nextItems = [newItem, ...dokumentasi];

    try {
      window.localStorage.setItem(galleryStorageKey, JSON.stringify(nextItems));
      setDokumentasi(nextItems);
      setJudul("");
      setKategori("Kemahasiswaan");
      setDeskripsi("");
      setFotoDataUrl("");
      setFormError("");
      setSuccessMessage("Dokumentasi berhasil dipublikasikan.");
    } catch {
      setFormError("Penyimpanan browser penuh. Coba foto yang lebih kecil.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 text-[10px] font-bold uppercase text-indigo-700">Dokumentasi & cerita</p>
            <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">Galeri Kegiatan</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">Rekam jejak program dan momen kolaborasi BEM KM bersama Ormawa.</p>
          </div>
          {isAdmin ? (
            <button type="button" onClick={() => setIsAdmin(false)} className="w-fit border border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-white">Keluar dari Admin</button>
          ) : (
            <button type="button" onClick={() => setAdminLoginOpen((open) => !open)} className="w-fit border border-slate-300 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700">
              {adminLoginOpen ? "Tutup login admin" : "Masuk sebagai Admin BEM"}
            </button>
          )}
        </div>

        {adminLoginOpen && !isAdmin && (
          <form onSubmit={handleAdminLogin} className="mb-6 grid gap-3 border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div>
              <label htmlFor="gallery-admin-email" className="mb-1 block text-[10px] font-bold uppercase text-slate-600">Email admin</label>
              <input id="gallery-admin-email" type="email" required value={emailInput} onChange={(event) => setEmailInput(event.target.value)} placeholder="admin@bemdhb.test" className="w-full border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600" />
            </div>
            <div>
              <label htmlFor="gallery-admin-password" className="mb-1 block text-[10px] font-bold uppercase text-slate-600">Password</label>
              <input id="gallery-admin-password" type="password" required value={passwordInput} onChange={(event) => setPasswordInput(event.target.value)} className="w-full border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600" />
            </div>
            <button type="submit" className="bg-blue-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-800">Masuk</button>
            {loginError && <p role="alert" className="text-xs font-semibold text-red-700 sm:col-span-3">{loginError}</p>}
          </form>
        )}

        {isAdmin && (
          <section className="mb-8 border border-blue-200 bg-blue-50/70 p-5 sm:p-6">
            <div className="mb-4 border-b border-blue-200 pb-3">
              <p className="text-[10px] font-bold uppercase text-blue-700">Admin BEM</p>
              <h2 className="mt-1 text-base font-bold text-slate-900">Posting dokumentasi</h2>
            </div>
            <form onSubmit={handlePostDocumentation} className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="gallery-title" className="mb-1 block text-[10px] font-bold text-slate-700">Judul kegiatan</label>
                <input id="gallery-title" required value={judul} onChange={(event) => setJudul(event.target.value)} className="w-full border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600" />
              </div>
              <div>
                <label htmlFor="gallery-date" className="mb-1 block text-[10px] font-bold text-slate-700">Tanggal kegiatan</label>
                <input id="gallery-date" type="date" required value={tanggal} onChange={(event) => setTanggal(event.target.value)} className="w-full border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600" />
              </div>
              <div>
                <label htmlFor="gallery-category" className="mb-1 block text-[10px] font-bold text-slate-700">Kategori</label>
                <select id="gallery-category" value={kategori} onChange={(event) => setKategori(event.target.value)} className="w-full border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600">
                  {["Kemahasiswaan", "Baksos", "Akademik", "Internal", "Non-Akademik", "Lainnya"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="gallery-photo" className="mb-1 block text-[10px] font-bold text-slate-700">Foto dokumentasi (opsional, maks. 1,5 MB)</label>
                <input id="gallery-photo" type="file" accept="image/*" onChange={handlePhotoChange} className="w-full border border-slate-300 bg-white p-2 text-xs file:mr-3 file:border-0 file:bg-blue-100 file:px-3 file:py-1.5 file:font-semibold file:text-blue-800" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="gallery-description" className="mb-1 block text-[10px] font-bold text-slate-700">Keterangan kegiatan</label>
                <textarea id="gallery-description" required rows={3} value={deskripsi} onChange={(event) => setDeskripsi(event.target.value)} className="w-full resize-y border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600" />
              </div>
              <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <div aria-live="polite">
                  {formError && <p role="alert" className="text-xs font-semibold text-red-700">{formError}</p>}
                  {successMessage && <p role="status" className="text-xs font-semibold text-blue-800">{successMessage}</p>}
                </div>
                <button type="submit" className="bg-blue-700 px-5 py-3 text-xs font-bold text-white hover:bg-blue-800">Terbitkan dokumentasi</button>
              </div>
            </form>
          </section>
        )}

        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-sm font-bold text-slate-900">Dokumentasi terbit</h2>
          <span className="text-[10px] font-semibold text-slate-500">{dokumentasi.length} kegiatan</span>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...dokumentasi].sort((first, second) => second.tanggal.localeCompare(first.tanggal)).map((item) => (
            <article key={item.id} className="overflow-hidden border border-slate-200 bg-white">
              <div className="relative aspect-[1.55/1] overflow-hidden bg-blue-800">
                {item.fotoDataUrl ? (
                  <Image src={item.fotoDataUrl} alt={`Dokumentasi ${item.judul}`} fill unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                ) : (
                  <div aria-hidden="true" className="flex h-full items-center justify-center text-7xl font-black text-blue-100">{item.emojiBanner}</div>
                )}
                <span className="absolute left-3 top-3 bg-blue-100 px-2.5 py-1.5 text-[10px] font-bold uppercase text-blue-900">{item.kategori}</span>
              </div>
              <div className="p-4 sm:p-5">
                <time dateTime={item.tanggal} className="text-[10px] font-bold capitalize text-blue-700">{formatDokumentasiDate(item.tanggal)}</time>
                <h3 className="mt-2 text-base font-bold leading-snug text-slate-900">{item.judul}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">{item.deskripsi}</p>
              </div>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}