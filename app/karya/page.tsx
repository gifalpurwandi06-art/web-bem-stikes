"use client";

import { useEffect, useState } from "react";
import { SiteFooter, SiteHeader } from "../components/site-chrome";
import { useAdminSession } from "../lib/use-admin-session";

type StatusKarya = "pending" | "approved" | "rejected";

interface KaryaRecord {
  id: string;
  title: string;
  author_name: string;
  category: string;
  description: string;
  file_path: string | null;
  status: StatusKarya;
  created_at: string;
  fileUrl?: string;
}

const karyaColumns = "id,title,author_name,category,description,file_path,status,created_at";

export default function KaryaPage() {
  const { supabase, configured, isAdmin, accessToken, loading: authLoading, error: authError, signIn, signOut } = useAdminSession();
  const [karya, setKarya] = useState<KaryaRecord[]>([]);
  const [loadingWorks, setLoadingWorks] = useState(Boolean(supabase));
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [category, setCategory] = useState("Desain");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [adminNote, setAdminNote] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    const loadWorks = async () => {
      const { data, error } = await supabase
        .from("works")
        .select(karyaColumns)
        .order("created_at", { ascending: false });

      if (!active) return;
      if (error) {
        setErrorMessage("Karya belum dapat dimuat. Pastikan schema Supabase sudah dipasang.");
        setLoadingWorks(false);
        return;
      }

      const rows = (data || []) as KaryaRecord[];
      const withUrls = await Promise.all(rows.map(async (item) => {
        if (!item.file_path) return item;
        const { data: signedFile } = await supabase.storage.from("works-files").createSignedUrl(item.file_path, 3600);
        return { ...item, fileUrl: signedFile?.signedUrl };
      }));
      if (active) {
        setKarya(withUrls);
        setLoadingWorks(false);
      }
    };

    void loadWorks();
    return () => { active = false; };
  }, [supabase, isAdmin]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setErrorMessage("Backend belum dikonfigurasi. Hubungi pengelola BEM.");
      return;
    }
    if (!file) {
      setErrorMessage("Lampirkan file karya terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setMessage("");
    const filePath = `${crypto.randomUUID()}/${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: uploadError } = await supabase.storage.from("works-files").upload(filePath, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      setErrorMessage(`File gagal diunggah: ${uploadError.message}`);
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("works").insert({
      title: title.trim(),
      author_name: authorName.trim(),
      author_email: authorEmail.trim(),
      category,
      description: description.trim(),
      file_path: filePath,
    });

    if (error) {
      setErrorMessage(`Karya belum tersimpan: ${error.message}`);
      setSubmitting(false);
      return;
    }

    setTitle("");
    setAuthorName("");
    setAuthorEmail("");
    setDescription("");
    setFile(null);
    setMessage("Karya terkirim untuk kurasi BEM. Status akan dikirim ke email yang dicantumkan.");
    setSubmitting(false);
    const input = document.getElementById("work-file") as HTMLInputElement | null;
    if (input) input.value = "";
  };

  const handleAdminLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await signIn(email, password);
  };

  const handleReview = async (item: KaryaRecord, status: Exclude<StatusKarya, "pending">) => {
    setErrorMessage("");
    setMessage("");
    const response = await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ resource: "works", id: item.id, status, adminNote: adminNote[item.id] || "" }),
    });
    const result = await response.json();
    if (!response.ok) {
      setErrorMessage(result.error || "Status karya gagal diperbarui.");
      return;
    }

    setKarya((current) => current.map((work) => work.id === item.id ? { ...work, status } : work));
    setMessage(result.emailSent ? "Status tersimpan dan email notifikasi terkirim." : result.warning || "Status karya tersimpan.");
  };

  const visibleWorks = isAdmin ? karya : karya.filter((item) => item.status === "approved");

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 text-[10px] font-bold uppercase text-indigo-700">Ruang kreasi mahasiswa</p>
            <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">Karya Mahasiswa</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Kirim desain, tulisan, dan gagasan. Karya hanya tampil setelah dikurasi dan disetujui oleh BEM KM.</p>
          </div>
          {isAdmin ? (
            <button type="button" onClick={() => void signOut()} className="w-fit border border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-white">Keluar dari Admin</button>
          ) : (
            <button type="button" onClick={() => setAdminLoginOpen((open) => !open)} className="w-fit border border-slate-300 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700">
              {adminLoginOpen ? "Tutup login admin" : "Masuk sebagai Admin BEM"}
            </button>
          )}
        </div>

        {!configured && <p role="status" className="mb-6 border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">Supabase belum dikonfigurasi. Form dan kurasi lintas perangkat aktif setelah environment backend dipasang.</p>}

        {adminLoginOpen && !isAdmin && configured && (
          <form onSubmit={handleAdminLogin} className="mb-6 grid gap-3 border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div>
              <label htmlFor="works-admin-email" className="mb-1 block text-[10px] font-bold uppercase text-slate-600">Email admin</label>
              <input id="works-admin-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600" />
            </div>
            <div>
              <label htmlFor="works-admin-password" className="mb-1 block text-[10px] font-bold uppercase text-slate-600">Password</label>
              <input id="works-admin-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600" />
            </div>
            <button type="submit" disabled={authLoading} className="bg-blue-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50">Masuk</button>
            {authError && <p role="alert" className="text-xs font-semibold text-red-700 sm:col-span-3">{authError}</p>}
          </form>
        )}

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)]">
          <section className="border border-slate-200 bg-white p-5 sm:p-6">
            <p className="text-[10px] font-bold uppercase text-blue-700">Pengajuan karya</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">Kirim karya untuk dikurasi</h2>
            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <div>
                <label htmlFor="work-title" className="mb-1 block text-[10px] font-bold text-slate-700">Judul karya</label>
                <input id="work-title" required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} className="w-full border border-slate-300 px-3 py-2.5 text-xs outline-none focus:border-blue-600" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="work-author" className="mb-1 block text-[10px] font-bold text-slate-700">Nama pengirim</label>
                  <input id="work-author" required maxLength={100} value={authorName} onChange={(event) => setAuthorName(event.target.value)} className="w-full border border-slate-300 px-3 py-2.5 text-xs outline-none focus:border-blue-600" />
                </div>
                <div>
                  <label htmlFor="work-email" className="mb-1 block text-[10px] font-bold text-slate-700">Email status</label>
                  <input id="work-email" type="email" required value={authorEmail} onChange={(event) => setAuthorEmail(event.target.value)} className="w-full border border-slate-300 px-3 py-2.5 text-xs outline-none focus:border-blue-600" />
                </div>
              </div>
              <div>
                <label htmlFor="work-category" className="mb-1 block text-[10px] font-bold text-slate-700">Kategori</label>
                <select id="work-category" value={category} onChange={(event) => setCategory(event.target.value)} className="w-full border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600">
                  {["Desain", "Tulisan", "Fotografi", "Video", "Inovasi", "Lainnya"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="work-description" className="mb-1 block text-[10px] font-bold text-slate-700">Keterangan</label>
                <textarea id="work-description" required maxLength={1500} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="w-full resize-y border border-slate-300 px-3 py-2.5 text-xs outline-none focus:border-blue-600" />
              </div>
              <div>
                <label htmlFor="work-file" className="mb-1 block text-[10px] font-bold text-slate-700">File karya (PDF/gambar, maks. 5 MB)</label>
                <input id="work-file" type="file" accept=".pdf,image/jpeg,image/png,image/webp" required onChange={(event) => setFile(event.target.files?.[0] || null)} className="w-full border border-slate-300 bg-white p-2 text-xs file:mr-3 file:border-0 file:bg-blue-100 file:px-3 file:py-1.5 file:font-semibold file:text-blue-800" />
              </div>
              {errorMessage && <p role="alert" className="text-xs font-semibold text-red-700">{errorMessage}</p>}
              {message && <p role="status" className="text-xs font-semibold text-blue-800">{message}</p>}
              <button type="submit" disabled={submitting || !configured} className="w-full bg-blue-700 px-4 py-3 text-xs font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">
                {submitting ? "Mengirim…" : "Kirim untuk kurasi"}
              </button>
            </form>
          </section>

          <section aria-labelledby="works-list-title">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 id="works-list-title" className="text-sm font-bold text-slate-900">{isAdmin ? "Antrean kurasi BEM" : "Karya yang diterbitkan"}</h2>
              <span className="text-[10px] font-semibold text-slate-500">{loadingWorks ? "Memuat…" : `${visibleWorks.length} karya`}</span>
            </div>
            {visibleWorks.length ? (
              <div className="divide-y divide-slate-200">
                {visibleWorks.map((item) => (
                  <article key={item.id} className="py-5 first:pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-blue-700">{item.category}</span>
                      <span className="text-slate-300">·</span>
                      <span className={`text-[10px] font-semibold ${item.status === "approved" ? "text-blue-700" : item.status === "rejected" ? "text-red-700" : "text-amber-700"}`}>
                        {item.status === "approved" ? "Diterima" : item.status === "rejected" ? "Ditolak" : "Menunggu kurasi"}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{item.author_name} · {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                    {item.fileUrl && <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-xs font-semibold text-blue-700 hover:underline">Buka lampiran ↗</a>}
                    {isAdmin && item.status === "pending" && (
                      <div className="mt-4 space-y-2 border-l-2 border-blue-300 pl-4">
                        <label htmlFor={`note-${item.id}`} className="block text-[10px] font-bold text-slate-600">Catatan untuk pengirim (opsional)</label>
                        <textarea id={`note-${item.id}`} rows={2} value={adminNote[item.id] || ""} onChange={(event) => setAdminNote((current) => ({ ...current, [item.id]: event.target.value }))} className="w-full border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-600" />
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => void handleReview(item, "approved")} className="bg-blue-700 px-3 py-2 text-[10px] font-bold text-white hover:bg-blue-800">Terima & tampilkan</button>
                          <button type="button" onClick={() => void handleReview(item, "rejected")} className="border border-red-300 px-3 py-2 text-[10px] font-bold text-red-700 hover:bg-red-50">Tolak karya</button>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="border-y border-slate-200 py-12 text-center">
                <p className="text-sm font-semibold text-slate-700">{loadingWorks ? "Memuat karya…" : isAdmin ? "Antrean kurasi kosong" : "Belum ada karya yang diterbitkan"}</p>
                <p className="mt-2 text-xs text-slate-500">{isAdmin ? "Karya baru akan muncul di sini setelah dikirim mahasiswa." : "Karya akan tampil setelah lolos kurasi BEM KM."}</p>
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}