"use client";

import { useEffect, useState } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useAdminSession } from "@/src/hooks/use-admin-session";

type StatusAspirasi = "pending" | "approved" | "rejected";

interface AspirasiRecord {
  id: string;
  author_name: string | null;
  anonymous: boolean;
  category: string;
  target_unit: string;
  message: string;
  status: StatusAspirasi;
  created_at: string;
}

const aspirasiColumns =
  "id,author_name,anonymous,category,target_unit,message,status,created_at";
const targetUnits = [
  "BEM KM",
  "Akademik / Program Studi",
  "Sarana & Prasarana",
  "Kementerian Advokasi & Kesma",
  "HIMA / UKM",
  "Lainnya",
];

export default function AspirasiPage() {
  const {
    supabase,
    configured,
    isAdmin,
    accessToken,
    loading: authLoading,
    error: authError,
    signIn,
    signOut,
  } = useAdminSession();
  const [aspirasi, setAspirasi] = useState<AspirasiRecord[]>([]);
  const [loadingAspirasi, setLoadingAspirasi] = useState(Boolean(supabase));
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [category, setCategory] = useState("Fasilitas Kampus");
  const [targetUnit, setTargetUnit] = useState(targetUnits[0]);
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    const loadAspirations = async () => {
      const { data, error } = await supabase
        .from("aspirations")
        .select(aspirasiColumns)
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) {
        setErrorMessage(
          "Aspirasi belum dapat dimuat. Pastikan schema Supabase sudah dipasang.",
        );
      } else {
        setAspirasi((data || []) as AspirasiRecord[]);
      }
      setLoadingAspirasi(false);
    };

    void loadAspirations();
    return () => {
      active = false;
    };
  }, [supabase, isAdmin]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setErrorMessage("Backend belum dikonfigurasi. Hubungi pengelola BEM.");
      return;
    }
    setSubmitting(true);
    setErrorMessage("");
    setStatusMessage("");
    const { error } = await supabase.from("aspirations").insert({
      author_name: anonymous ? null : authorName.trim() || null,
      anonymous,
      category,
      target_unit: targetUnit,
      message: message.trim(),
    });
    if (error) {
      setErrorMessage(`Aspirasi belum tersimpan: ${error.message}`);
    } else {
      setMessage("");
      setAuthorName("");
      setStatusMessage(
        "Aspirasi terkirim ke BEM untuk disaring. Aspirasi baru akan tampil setelah disetujui.",
      );
    }
    setSubmitting(false);
  };

  const handleAdminLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await signIn(email, password);
  };

  const handleReview = async (
    item: AspirasiRecord,
    status: Exclude<StatusAspirasi, "pending">,
  ) => {
    setErrorMessage("");
    setStatusMessage("");
    const response = await fetch("/api/admin/moderate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        resource: "aspirations",
        id: item.id,
        status,
        adminNote: adminNotes[item.id] || "",
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setErrorMessage(result.error || "Status aspirasi gagal diperbarui.");
      return;
    }
    setAspirasi((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, status } : entry,
      ),
    );
    setStatusMessage(
      status === "approved"
        ? "Aspirasi disetujui dan diteruskan ke pihak tujuan."
        : "Aspirasi ditolak dan tidak ditampilkan ke publik.",
    );
  };

  const visibleAspirations = isAdmin
    ? aspirasi
    : aspirasi.filter((item) => item.status === "approved");

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 text-[10px] font-bold uppercase text-blue-700">
              Suara mahasiswa
            </p>
            <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              Aspirasi & Advokasi
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Aspirasi ditinjau BEM terlebih dahulu. Hanya masukan yang
              disetujui yang tampil di ruang publik.
            </p>
          </div>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => void signOut()}
              className="w-fit border border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-white"
            >
              Keluar dari Admin
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAdminLoginOpen((open) => !open)}
              className="w-fit border border-slate-300 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700"
            >
              {adminLoginOpen ? "Tutup login admin" : "Masuk sebagai Admin BEM"}
            </button>
          )}
        </div>

        {!configured && (
          <p
            role="status"
            className="mb-6 border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900"
          >
            Supabase belum dikonfigurasi. Moderasi bersama aktif setelah
            environment backend dipasang.
          </p>
        )}
        {adminLoginOpen && !isAdmin && configured && (
          <form
            onSubmit={handleAdminLogin}
            className="mb-6 grid gap-3 border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <div>
              <label
                htmlFor="aspirasi-admin-email"
                className="mb-1 block text-[10px] font-bold uppercase text-slate-600"
              >
                Email admin
              </label>
              <input
                id="aspirasi-admin-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label
                htmlFor="aspirasi-admin-password"
                className="mb-1 block text-[10px] font-bold uppercase text-slate-600"
              >
                Password
              </label>
              <input
                id="aspirasi-admin-password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600"
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="bg-blue-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              Masuk
            </button>
            {authError && (
              <p
                role="alert"
                className="text-xs font-semibold text-red-700 sm:col-span-3"
              >
                {authError}
              </p>
            )}
          </form>
        )}

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)]">
          <section className="border border-slate-200 bg-white p-5 sm:p-6">
            <p className="text-[10px] font-bold uppercase text-blue-700">
              Kirim masukan
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Tulis aspirasi
            </h2>
            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(event) => setAnonymous(event.target.checked)}
                  className="h-4 w-4 accent-blue-700"
                />
                Kirim secara anonim
              </label>
              {!anonymous && (
                <div>
                  <label
                    htmlFor="aspirasi-author"
                    className="mb-1 block text-[10px] font-bold text-slate-700"
                  >
                    Nama (opsional)
                  </label>
                  <input
                    id="aspirasi-author"
                    value={authorName}
                    onChange={(event) => setAuthorName(event.target.value)}
                    className="w-full border border-slate-300 px-3 py-2.5 text-xs outline-none focus:border-blue-600"
                  />
                </div>
              )}
              <div>
                <label
                  htmlFor="aspirasi-category"
                  className="mb-1 block text-[10px] font-bold text-slate-700"
                >
                  Kategori
                </label>
                <select
                  id="aspirasi-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600"
                >
                  {[
                    "Fasilitas Kampus",
                    "Akademik & Layanan",
                    "Kegiatan / Kemahasiswaan",
                    "Keuangan & UKT",
                    "Lainnya",
                  ].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="aspirasi-target"
                  className="mb-1 block text-[10px] font-bold text-slate-700"
                >
                  Pihak tujuan
                </label>
                <select
                  id="aspirasi-target"
                  value={targetUnit}
                  onChange={(event) => setTargetUnit(event.target.value)}
                  className="w-full border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600"
                >
                  {targetUnits.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="aspirasi-message"
                  className="mb-1 block text-[10px] font-bold text-slate-700"
                >
                  Isi aspirasi
                </label>
                <textarea
                  id="aspirasi-message"
                  required
                  maxLength={2000}
                  rows={5}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="w-full resize-y border border-slate-300 px-3 py-2.5 text-xs outline-none focus:border-blue-600"
                />
              </div>
              {errorMessage && (
                <p role="alert" className="text-xs font-semibold text-red-700">
                  {errorMessage}
                </p>
              )}
              {statusMessage && (
                <p
                  role="status"
                  className="text-xs font-semibold text-blue-800"
                >
                  {statusMessage}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting || !configured}
                className="w-full bg-blue-700 px-4 py-3 text-xs font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Mengirim…" : "Kirim untuk ditinjau"}
              </button>
            </form>
          </section>

          <section aria-labelledby="aspiration-list-title">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
              <h2
                id="aspiration-list-title"
                className="text-sm font-bold text-slate-900"
              >
                {isAdmin ? "Antrean moderasi" : "Aspirasi yang disetujui"}
              </h2>
              <span className="text-[10px] font-semibold text-slate-500">
                {loadingAspirasi
                  ? "Memuat…"
                  : `${visibleAspirations.length} masukan`}
              </span>
            </div>
            {visibleAspirations.length ? (
              <div className="divide-y divide-slate-200">
                {visibleAspirations.map((item) => (
                  <article key={item.id} className="py-5 first:pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-blue-700">
                        {item.category}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[10px] text-slate-500">
                        Tujuan: {item.target_unit}
                      </span>
                      {isAdmin && (
                        <span
                          className={`text-[10px] font-semibold ${item.status === "approved" ? "text-blue-700" : item.status === "rejected" ? "text-red-700" : "text-amber-700"}`}
                        >
                          {item.status}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-xs font-bold text-slate-800">
                      {item.anonymous
                        ? "Mahasiswa anonim"
                        : item.author_name || "Mahasiswa"}
                    </h3>
                    <time
                      dateTime={item.created_at}
                      className="mt-1 block text-[10px] text-slate-500"
                    >
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                    <p className="mt-3 border-l-2 border-blue-300 pl-4 text-sm leading-6 text-slate-700">
                      {item.message}
                    </p>
                    {isAdmin && item.status === "pending" && (
                      <div className="mt-4 space-y-2 border-l-2 border-blue-300 pl-4">
                        <label
                          htmlFor={`aspiration-note-${item.id}`}
                          className="block text-[10px] font-bold text-slate-600"
                        >
                          Catatan admin (opsional)
                        </label>
                        <textarea
                          id={`aspiration-note-${item.id}`}
                          rows={2}
                          value={adminNotes[item.id] || ""}
                          onChange={(event) =>
                            setAdminNotes((current) => ({
                              ...current,
                              [item.id]: event.target.value,
                            }))
                          }
                          className="w-full border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-600"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void handleReview(item, "approved")}
                            className="bg-blue-700 px-3 py-2 text-[10px] font-bold text-white hover:bg-blue-800"
                          >
                            Setujui & teruskan
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleReview(item, "rejected")}
                            className="border border-red-300 px-3 py-2 text-[10px] font-bold text-red-700 hover:bg-red-50"
                          >
                            Tolak aspirasi
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="border-y border-slate-200 py-12 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  {loadingAspirasi
                    ? "Memuat aspirasi…"
                    : isAdmin
                      ? "Antrean moderasi kosong"
                      : "Belum ada aspirasi yang dipublikasikan"}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Masukan baru ditinjau admin sebelum ditampilkan atau
                  diteruskan.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
