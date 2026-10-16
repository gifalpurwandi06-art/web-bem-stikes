"use client";

import { useEffect, useState } from "react";
import { SiteFooter, SiteHeader } from "../components/site-chrome";
import { useAdminSession } from "../lib/use-admin-session";

interface DokumenRecord {
  id: string;
  title: string;
  category: string;
  description: string;
  file_path: string;
  file_name: string;
  file_size: number;
  created_at: string;
}

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function DokumenPage() {
  const { supabase, configured, isAdmin, loading: authLoading, error: authError, signIn, signOut } = useAdminSession();
  const [documents, setDocuments] = useState<DokumenRecord[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(Boolean(supabase));
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Administrasi");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const loadDocuments = async () => {
      const { data, error } = await supabase.from("documents").select("id,title,category,description,file_path,file_name,file_size,created_at").order("created_at", { ascending: false });
      if (!active) return;
      if (error) setErrorMessage("Dokumen belum dapat dimuat. Pastikan schema Supabase sudah dipasang.");
      else setDocuments((data || []) as DokumenRecord[]);
      setLoadingDocuments(false);
    };
    void loadDocuments();
    return () => { active = false; };
  }, [supabase]);

  const handleAdminLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await signIn(email, password);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null;
    if (selected && selected.size > 10 * 1024 * 1024) {
      setErrorMessage("Ukuran dokumen maksimal 10 MB.");
      event.target.value = "";
      setFile(null);
      return;
    }
    setErrorMessage("");
    setFile(selected);
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !file) return;
    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const filePath = `${crypto.randomUUID()}/${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: uploadError } = await supabase.storage.from("bem-documents").upload(filePath, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      setErrorMessage(`File gagal diunggah: ${uploadError.message}`);
      setSubmitting(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("documents").insert({
      title: title.trim(),
      category,
      description: description.trim(),
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
      created_by: userData.user?.id,
    }).select("id,title,category,description,file_path,file_name,file_size,created_at").single();

    if (error) {
      await supabase.storage.from("bem-documents").remove([filePath]);
      setErrorMessage(`Dokumen belum tersimpan: ${error.message}`);
      setSubmitting(false);
      return;
    }

    setDocuments((current) => [data as DokumenRecord, ...current]);
    setTitle("");
    setDescription("");
    setFile(null);
    setSuccessMessage("Dokumen berhasil dipublikasikan.");
    const input = document.getElementById("document-file") as HTMLInputElement | null;
    if (input) input.value = "";
    setSubmitting(false);
  };

  const handleDelete = async (item: DokumenRecord) => {
    if (!supabase || !window.confirm(`Hapus dokumen “${item.title}”?`)) return;
    const { error: rowError } = await supabase.from("documents").delete().eq("id", item.id);
    if (rowError) {
      setErrorMessage(`Dokumen gagal dihapus: ${rowError.message}`);
      return;
    }
    await supabase.storage.from("bem-documents").remove([item.file_path]);
    setDocuments((current) => current.filter((document) => document.id !== item.id));
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 text-[10px] font-bold uppercase text-blue-700">Pusat administrasi & SOP</p>
            <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">Bank Dokumen & Template Resmi</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">Unduh dokumen resmi, template administrasi, dan panduan yang diterbitkan BEM KM.</p>
          </div>
          {isAdmin ? (
            <button type="button" onClick={() => void signOut()} className="w-fit border border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-white">Keluar dari Admin</button>
          ) : (
            <button type="button" onClick={() => setAdminLoginOpen((open) => !open)} className="w-fit border border-slate-300 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700">{adminLoginOpen ? "Tutup login admin" : "Masuk sebagai Admin BEM"}</button>
          )}
        </div>

        {!configured && <p role="status" className="mb-6 border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">Supabase belum dikonfigurasi. Pustaka dokumen akan aktif setelah environment backend dipasang.</p>}
        {adminLoginOpen && !isAdmin && configured && (
          <form onSubmit={handleAdminLogin} className="mb-6 grid gap-3 border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div><label htmlFor="docs-admin-email" className="mb-1 block text-[10px] font-bold uppercase text-slate-600">Email admin</label><input id="docs-admin-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full border border-slate-300 px-3 py-2.5 text-xs outline-none focus:border-blue-600" /></div>
            <div><label htmlFor="docs-admin-password" className="mb-1 block text-[10px] font-bold uppercase text-slate-600">Password</label><input id="docs-admin-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border border-slate-300 px-3 py-2.5 text-xs outline-none focus:border-blue-600" /></div>
            <button type="submit" disabled={authLoading} className="bg-blue-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50">Masuk</button>
            {authError && <p role="alert" className="text-xs font-semibold text-red-700 sm:col-span-3">{authError}</p>}
          </form>
        )}

        {isAdmin && (
          <section className="mb-8 border border-blue-200 bg-blue-50/70 p-5 sm:p-6">
            <h2 className="mb-4 text-base font-bold text-slate-900">Posting dokumen resmi</h2>
            <form onSubmit={handleUpload} className="grid gap-4 md:grid-cols-2">
              <div><label htmlFor="document-title" className="mb-1 block text-[10px] font-bold text-slate-700">Nama dokumen</label><input id="document-title" required value={title} onChange={(event) => setTitle(event.target.value)} className="w-full border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600" /></div>
              <div><label htmlFor="document-category" className="mb-1 block text-[10px] font-bold text-slate-700">Kategori</label><select id="document-category" value={category} onChange={(event) => setCategory(event.target.value)} className="w-full border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600">{["Administrasi", "Persuratan", "Format Proposal", "SOP Internal", "Media & Branding", "Lainnya"].map((item) => <option key={item}>{item}</option>)}</select></div>
              <div><label htmlFor="document-file" className="mb-1 block text-[10px] font-bold text-slate-700">File (maks. 10 MB)</label><input id="document-file" type="file" required onChange={handleFileChange} className="w-full border border-slate-300 bg-white p-2 text-xs file:mr-3 file:border-0 file:bg-blue-100 file:px-3 file:py-1.5 file:font-semibold file:text-blue-800" /></div>
              <div><label htmlFor="document-description" className="mb-1 block text-[10px] font-bold text-slate-700">Keterangan</label><textarea id="document-description" rows={2} value={description} onChange={(event) => setDescription(event.target.value)} className="w-full resize-y border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600" /></div>
              <div aria-live="polite" className="flex flex-col gap-2 md:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <div>{errorMessage && <p role="alert" className="text-xs font-semibold text-red-700">{errorMessage}</p>}{successMessage && <p role="status" className="text-xs font-semibold text-blue-800">{successMessage}</p>}</div>
                <button type="submit" disabled={submitting || !configured} className="bg-blue-700 px-5 py-3 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50">{submitting ? "Mengunggah…" : "Terbitkan dokumen"}</button>
              </div>
            </form>
          </section>
        )}

        {(errorMessage && !isAdmin) && <p role="alert" className="mb-4 text-xs font-semibold text-red-700">{errorMessage}</p>}
        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3"><h2 className="text-sm font-bold text-slate-900">Dokumen tersedia</h2><span className="text-[10px] text-slate-500">{loadingDocuments ? "Memuat…" : `${documents.length} file`}</span></div>
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {documents.map((doc) => {
            const fileUrl = supabase?.storage.from("bem-documents").getPublicUrl(doc.file_path).data.publicUrl;
            return (
              <article key={doc.id} className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px]"><span className="font-bold uppercase text-blue-700">{doc.category}</span><span className="text-slate-400">{formatSize(doc.file_size)}</span></div>
                  <h3 className="mt-1 text-base font-bold text-slate-900">{doc.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{doc.description || doc.file_name}</p>
                </div>
                <div className="flex items-center gap-3">
                  {fileUrl && <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-blue-200 px-4 py-2.5 text-xs font-bold text-blue-800 hover:bg-blue-50">Unduh file ↗</a>}
                  {isAdmin && <button type="button" onClick={() => void handleDelete(doc)} className="border border-red-200 px-3 py-2.5 text-[10px] font-bold text-red-700 hover:bg-red-50">Hapus</button>}
                </div>
              </article>
            );
          })}
          {!loadingDocuments && documents.length === 0 && <p className="py-12 text-center text-xs text-slate-500">Belum ada dokumen yang dipublikasikan.</p>}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}