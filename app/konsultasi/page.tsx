"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

const FileReviewViewer = dynamic(
  () => import("@/components/konsultasi/FileReviewViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-slate-300 bg-slate-100 text-xs text-slate-500">
        Membuka penampil berkas…
      </div>
    ),
  },
);

interface RiwayatPengajuan {
  id: string;
  perihal: string;
  jenis: string;
  namaOrmawa: string;
  tanggal: string;
  statusIndex: number; // 0: Diajukan, 1: Direvisi, 2: ACC
  catatanAdmin: string;
  namaFilePdf?: string;
  pdfDataUrl?: string;
  fileMimeType?: string;
  canvasDataUrl?: string;
  pageAnnotations?: Record<number, string>;
  googleDriveUrl?: string;
}

export default function KonsultasiPage() {
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [sudahLogin, setSudahLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [ormawaAktif, setOrmawaAktif] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const listAkunOrmawa: {
    [key: string]: { nama: string; pass: string; admin: boolean };
  } = {
    "admin@bemdhb.test": {
      nama: "Admin / Pengurus BEM KM",
      pass: "bemdhb2026",
      admin: true,
    },
    "hmps-s1keperawatan@bemdhb.test": {
      nama: "HMPS S1 KEPERAWATAN",
      pass: "bemdhb2026",
      admin: false,
    },
    "hmps-d3keperawatan@bemdhb.test": {
      nama: "HMPS D3 KEPERAWATAN",
      pass: "bemdhb2026",
      admin: false,
    },
    "hima-keperawatan@bemdhb.test": {
      nama: "HIMA KEPERAWATAN",
      pass: "bemdhb2026",
      admin: false,
    },
    "hmps-d3optometri@bemdhb.test": {
      nama: "HMPS D3 OPTOMETRI",
      pass: "bemdhb2026",
      admin: false,
    },
    "hmps-s1kebidanan@bemdhb.test": {
      nama: "HMPS S1 KEBIDANAN",
      pass: "bemdhb2026",
      admin: false,
    },
    "hmps-s1kesmas@bemdhb.test": {
      nama: "HMPS S1 KESEHATAN MASYARAKAT",
      pass: "bemdhb2026",
      admin: false,
    },
    "lsm-pikmaproksima@bemdhb.test": {
      nama: "LSM PIKMA PROKSIMA",
      pass: "bemdhb2026",
      admin: false,
    },
    "ukm-dhbventure@bemdhb.test": {
      nama: "UKM DHB VENTURE",
      pass: "bemdhb2026",
      admin: false,
    },
    "ukm-ldkigi@bemdhb.test": {
      nama: "UKM LDK IKATAN GENERASI ISLAM",
      pass: "bemdhb2026",
      admin: false,
    },
    "ukm-arteripers@bemdhb.test": {
      nama: "UKM ARTERI PERS KAMPUS",
      pass: "bemdhb2026",
      admin: false,
    },
    "ukm-timkesehatan@bemdhb.test": {
      nama: "UKM TIM KESEHATAN",
      pass: "bemdhb2026",
      admin: false,
    },
    "lsm-satgasantinarkoba@bemdhb.test": {
      nama: "LSM SATGAS ANTI NARKOBA",
      pass: "bemdhb2026",
      admin: false,
    },
    "ukk-resimenmahasiswa@bemdhb.test": {
      nama: "UKK RESIMEN MAHASISWA",
      pass: "bemdhb2026",
      admin: false,
    },
  };

  const [daftarPengajuan, setDaftarPengajuan] = useState<RiwayatPengajuan[]>(
    () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("bem_pengajuan_surat_v3");
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch {
            /* ignore */
          }
        }
      }
      return [
        {
          id: "TRK-2026-001",
          perihal: "Proposal Makrab & Pelantikan Pengurus Baru",
          jenis: "Konsultasi Proposal",
          namaOrmawa: "HMPS D3 OPTOMETRI",
          tanggal: "02 Oktober 2026",
          statusIndex: 1,
          catatanAdmin:
            "Format penulisan latar belakang mohon disesuaikan dengan pedoman BEM.",
          namaFilePdf: "Proposal_Makrab_2026.pdf",
        },
      ];
    },
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "bem_pengajuan_surat_v3",
        JSON.stringify(daftarPengajuan),
      );
    }
  }, [daftarPengajuan]);

  const [judulBaru, setJudulBaru] = useState("");
  const [jenisBaru, setJenisBaru] = useState("Konsultasi Proposal");
  const [filePdfBase64, setFilePdfBase64] = useState<string>("");
  const [namaFilePdf, setNamaFilePdf] = useState<string>("");
  const [fileMimeType, setFileMimeType] = useState<string>("");
  const [berkasDipilihId, setBerkasDipilihId] = useState<string>(
    daftarPengajuan[0]?.id || "",
  );

  const berkasDipilih =
    daftarPengajuan.find((item) => item.id === berkasDipilihId) ||
    daftarPengajuan[0];

  const [brushColor, setBrushColor] = useState("#ef4444");
  const [brushSize, setBrushSize] = useState(3);
  const [catatanRevisiInput, setCatatanRevisiInput] = useState(
    daftarPengajuan[0]?.catatanAdmin || "",
  );
  const [fileRevisiBase64, setFileRevisiBase64] = useState<string>("");
  const [namaFileRevisi, setNamaFileRevisi] = useState<string>("");
  const [fileRevisiMimeType, setFileRevisiMimeType] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
        alert("Pilih file PDF atau gambar.");
        e.target.value = "";
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file terlalu besar! Maksimal 2MB.");
        e.target.value = "";
        return;
      }
      setNamaFilePdf(file.name);
      setFileMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => setFilePdfBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFileRevisiChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
        alert("Pilih file PDF atau gambar.");
        e.target.value = "";
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file terlalu besar! Maksimal 2MB.");
        e.target.value = "";
        return;
      }
      setNamaFileRevisi(file.name);
      setFileRevisiMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => setFileRevisiBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearCanvas = () => {
    if (!berkasDipilih) return;
    setDaftarPengajuan((prev: RiwayatPengajuan[]) =>
      prev.map((item: RiwayatPengajuan) =>
        item.id === berkasDipilih.id
          ? { ...item, canvasDataUrl: undefined, pageAnnotations: undefined }
          : item,
      ),
    );
  };

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailClean = emailInput.trim().toLowerCase();
    if (
      listAkunOrmawa[emailClean] &&
      listAkunOrmawa[emailClean].pass === passwordInput
    ) {
      setSudahLogin(true);
      setOrmawaAktif(listAkunOrmawa[emailClean].nama);
      setIsAdmin(listAkunOrmawa[emailClean].admin);
      setErrorMessage("");
    } else {
      setErrorMessage("Email atau password salah!");
    }
  };

  const handleKirimBerkas = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!judulBaru.trim()) return;

    const idBaru = `TRK-2026-00${daftarPengajuan.length + 1}`;
    const pengajuanBaru: RiwayatPengajuan = {
      id: idBaru,
      perihal: judulBaru,
      jenis: jenisBaru,
      namaOrmawa: ormawaAktif,
      tanggal: "Hari ini",
      statusIndex: 0,
      catatanAdmin: "Menunggu pemeriksaan berkas PDF oleh Tim BEM.",
      namaFilePdf: namaFilePdf || "Dokumen_Lampiran.pdf",
      pdfDataUrl: filePdfBase64 || undefined,
      fileMimeType: fileMimeType || undefined,
    };

    setDaftarPengajuan([pengajuanBaru, ...daftarPengajuan]);
    setBerkasDipilihId(idBaru);
    setJudulBaru("");
    setNamaFilePdf("");
    setFilePdfBase64("");
    setFileMimeType("");
    alert("Berhasil! Berkas PDF Anda telah dikirim.");
  };

  const handleKirimRevisi = () => {
    if (!berkasDipilih) return;
    setDaftarPengajuan((prev: RiwayatPengajuan[]) =>
      prev.map((item: RiwayatPengajuan) =>
        item.id === berkasDipilih.id
          ? {
              ...item,
              statusIndex: 1,
              catatanAdmin:
                catatanRevisiInput ||
                "Ada catatan coretan revisi pada dokumen.",
            }
          : item,
      ),
    );
    alert("Koreksi & catatan revisi dikirim kembali ke Ormawa!");
  };

  const handleKirimUlangRevisiOrmawa = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fileRevisiBase64) {
      alert("Pilih file PDF revisi terlebih dahulu!");
      return;
    }
    setDaftarPengajuan((prev: RiwayatPengajuan[]) =>
      prev.map((item: RiwayatPengajuan) =>
        item.id === berkasDipilih.id
          ? {
              ...item,
              statusIndex: 0, // Kembalikan ke status diajukan untuk dicek ulang admin
              namaFilePdf: namaFileRevisi,
              pdfDataUrl: fileRevisiBase64,
              fileMimeType: fileRevisiMimeType,
              canvasDataUrl: undefined, // Reset coretan lama
              pageAnnotations: undefined,
              catatanAdmin:
                "File revisi telah diunggah oleh Ormawa. Menunggu verifikasi ulang BEM.",
            }
          : item,
      ),
    );
    setFileRevisiBase64("");
    setNamaFileRevisi("");
    setFileRevisiMimeType("");
    alert("File revisi berhasil dikirim ulang ke BEM!");
  };

  const handleAccBerkas = () => {
    if (!berkasDipilih) return;
    const fakeDriveLink = `https://drive.google.com/file/d/bem-stikes-dh-${berkasDipilih.id.toLowerCase()}/view`;

    setDaftarPengajuan((prev: RiwayatPengajuan[]) =>
      prev.map((item: RiwayatPengajuan) =>
        item.id === berkasDipilih.id
          ? {
              ...item,
              statusIndex: 2,
              catatanAdmin:
                "Dokumen telah disetujui (ACC). Sah untuk diarsipkan.",
              googleDriveUrl: fakeDriveLink,
            }
          : item,
      ),
    );
    alert("Berhasil ACC! Dokumen disetujui dan disinkronkan ke Google Drive.");
  };

  const filteredList: RiwayatPengajuan[] = isAdmin
    ? daftarPengajuan
    : daftarPengajuan.filter(
        (item: RiwayatPengajuan) => item.namaOrmawa === ormawaAktif,
      );

  const tahapanStatus = [
    { label: "Berkas PDF Diterima", desc: "Masuk antrean sistem BEM." },
    {
      label: "Revisi / Koreksi Coretan",
      desc: "Admin BEM memberikan catatan perbaikan.",
    },
    {
      label: "Disetujui (ACC)",
      desc: "Dokumen sah & tersinkron Google Drive.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      <SiteHeader />

      <main className="max-w-6xl mx-auto px-4 py-12 w-full space-y-8">
        {!sudahLogin ? (
          <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200 max-w-lg mx-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-blue-100">
                🔐
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                Login Konsultasi Berkas
              </h1>
              <p className="text-slate-500 text-xs mt-2">
                Gunakan email ormawa atau admin (
                <code className="text-blue-600 font-bold">
                  admin@bemdhb.test
                </code>
                ).
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Akun
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@bemdhb.test..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              {errorMessage && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 font-medium text-center">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-xs shadow transition mt-2"
              >
                Masuk Sistem &rarr;
              </button>
            </form>
            <div className="mt-4 text-[11px] text-slate-400 text-center">
              Password universal:{" "}
              <span className="font-bold text-slate-600">bemdhb2026</span>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between bg-blue-50 border border-blue-200 px-6 py-4 rounded-3xl gap-4">
              <div>
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                  {isAdmin ? "🛡️ Admin BEM" : "🏛️ Perwakilan Ormawa"}
                </span>
                <h2 className="text-sm font-extrabold text-blue-900 mt-0.5">
                  {ormawaAktif}
                </h2>
              </div>
              <button
                onClick={() => setSudahLogin(false)}
                className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-semibold text-xs px-4 py-2 rounded-xl transition"
              >
                Logout
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* KIRI */}
              <div className="lg:col-span-5 space-y-6">
                {!isAdmin && (
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b">
                      📤 Kirim Pengajuan Baru
                    </h3>
                    <form onSubmit={handleKirimBerkas} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Jenis Berkas
                        </label>
                        <select
                          value={jenisBaru}
                          onChange={(e) => setJenisBaru(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                        >
                          <option>Konsultasi Proposal</option>
                          <option>Konsultasi Desain & Publikasi</option>
                          <option>Pengajuan Surat Peminjaman</option>
                          <option>Laporan Pertanggungjawaban (LPJ)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Perihal / Judul Kegiatan
                        </label>
                        <input
                          type="text"
                          value={judulBaru}
                          onChange={(e) => setJudulBaru(e.target.value)}
                          placeholder="Contoh: Proposal Makrab..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          File PDF atau Desain
                        </label>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={handleFileChange}
                          className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer border border-slate-300 rounded-xl p-1.5"
                          required
                        />
                        {namaFilePdf && (
                          <span className="text-[10px] text-emerald-600 mt-1 block">
                            📄 {namaFilePdf}
                          </span>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-xs shadow transition"
                      >
                        Kirim Berkas &rarr;
                      </button>
                    </form>
                  </div>
                )}

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b">
                    {isAdmin
                      ? "📁 Semua Berkas Masuk"
                      : "📂 Riwayat Pengajuan Anda"}{" "}
                    ({filteredList.length})
                  </h3>
                  <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {filteredList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setBerkasDipilihId(item.id);
                          setCatatanRevisiInput(item.catatanAdmin || "");
                        }}
                        className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition ${berkasDipilihId === item.id ? "bg-blue-50 border-blue-300 font-semibold" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-blue-600 font-mono font-bold">
                            {item.id}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              item.statusIndex === 2
                                ? "bg-emerald-100 text-emerald-700"
                                : item.statusIndex === 1
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {item.statusIndex === 2
                              ? "ACC"
                              : item.statusIndex === 1
                                ? "Direvisi"
                                : "Diajukan"}
                          </span>
                        </div>
                        <p className="text-slate-800 line-clamp-1">
                          {item.perihal}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          🏛️ {item.namaOrmawa}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* KANAN */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
                {berkasDipilih ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md">
                            {berkasDipilih.id}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                            {berkasDipilih.namaOrmawa}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-slate-900 mt-2">
                          {berkasDipilih.perihal}
                        </h3>
                      </div>
                      <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-3 py-1 rounded-full border border-amber-200">
                        {berkasDipilih.jenis}
                      </span>
                    </div>

                    {/* TIMELINE */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">
                        Status Alur Birokrasi
                      </h4>
                      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {tahapanStatus.map((tahap, idx) => {
                          const isDone = idx <= berkasDipilih.statusIndex;
                          const isCurrent = idx === berkasDipilih.statusIndex;
                          return (
                            <div
                              key={idx}
                              className="relative flex items-start gap-3"
                            >
                              <div
                                className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isDone ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400"}`}
                              >
                                {isDone ? "✓" : idx + 1}
                              </div>
                              <div
                                className={
                                  isDone ? "opacity-100" : "opacity-40"
                                }
                              >
                                <h5
                                  className={`text-xs font-bold ${isCurrent ? "text-blue-600 text-sm" : "text-slate-800"}`}
                                >
                                  {tahap.label}
                                </h5>
                                <p className="text-[11px] text-slate-500">
                                  {tahap.desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {berkasDipilih.statusIndex === 2 &&
                      berkasDipilih.googleDriveUrl && (
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between gap-4">
                          <span className="text-xs text-emerald-900 font-medium">
                            Dokumen sudah di-ACC & tersinkronisasi ke Google
                            Drive.
                          </span>
                          <a
                            href={berkasDipilih.googleDriveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow whitespace-nowrap"
                          >
                            Buka di Drive &rarr;
                          </a>
                        </div>
                      )}

                    {/* PREVIEW & CANVAS */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-900">
                          {isAdmin
                            ? "🖌️ Tandai bagian PDF atau desain yang perlu dikoreksi"
                            : "📄 Pratinjau file & coretan koreksi dari BEM"}
                        </h4>
                        {isAdmin && (
                          <span className="text-[10px] font-semibold text-slate-500">
                            Gunakan mode Lihat untuk scroll/zoom, mode Kuas
                            untuk memberi tanda.
                          </span>
                        )}
                      </div>

                      {berkasDipilih.pdfDataUrl && (
                        <a
                          href={berkasDipilih.pdfDataUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex text-xs font-semibold text-blue-700 hover:text-blue-900"
                        >
                          Buka {berkasDipilih.namaFilePdf || "file kiriman"} di
                          tab baru ↗
                        </a>
                      )}
                      {berkasDipilih.pdfDataUrl ? (
                        <FileReviewViewer
                          key={`${berkasDipilih.id}-${berkasDipilih.namaFilePdf}-${berkasDipilih.statusIndex}`}
                          fileDataUrl={berkasDipilih.pdfDataUrl}
                          fileName={berkasDipilih.namaFilePdf || "Dokumen"}
                          isImage={(
                            berkasDipilih.fileMimeType ||
                            berkasDipilih.pdfDataUrl.slice(
                              5,
                              berkasDipilih.pdfDataUrl.indexOf(";"),
                            )
                          ).startsWith("image/")}
                          isAdmin={isAdmin}
                          annotations={
                            berkasDipilih.pageAnnotations ||
                            (berkasDipilih.canvasDataUrl
                              ? { 1: berkasDipilih.canvasDataUrl }
                              : {})
                          }
                          brushColor={brushColor}
                          brushSize={brushSize}
                          onAnnotationChange={(
                            pageNumber: number,
                            dataUrl: string,
                          ) =>
                            setDaftarPengajuan((prev: RiwayatPengajuan[]) =>
                              prev.map((item: RiwayatPengajuan) =>
                                item.id === berkasDipilih.id
                                  ? {
                                      ...item,
                                      canvasDataUrl: undefined,
                                      pageAnnotations: {
                                        ...item.pageAnnotations,
                                        [pageNumber]: dataUrl,
                                      },
                                    }
                                  : item,
                              ),
                            )
                          }
                          onBrushColorChange={setBrushColor}
                          onBrushSizeChange={setBrushSize}
                          onClear={clearCanvas}
                        />
                      ) : (
                        <div className="relative flex h-[360px] w-full flex-col items-center justify-center rounded-2xl border-2 border-slate-300 bg-slate-100 px-6 text-center">
                          <div className="max-w-sm px-6 text-center">
                            <p className="text-sm font-semibold text-slate-700">
                              Pratinjau file tidak tersedia
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {berkasDipilih.namaFilePdf ||
                                "Belum ada file yang dilampirkan pada pengajuan ini."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* FORM KEPUTUSAN ADMIN */}
                    {isAdmin && (
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                        <h4 className="text-xs font-bold text-slate-900">
                          Catatan & Keputusan Admin BEM
                        </h4>
                        <textarea
                          value={catatanRevisiInput}
                          onChange={(e) =>
                            setCatatanRevisiInput(e.target.value)
                          }
                          placeholder="Tuliskan catatan revisi..."
                          className="w-full p-3 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                          rows={2}
                        />
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={handleKirimRevisi}
                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl text-xs transition"
                          >
                            ⚠️ Minta Revisi
                          </button>
                          <button
                            type="button"
                            onClick={handleAccBerkas}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-xs transition"
                          >
                            ✅ ACC (Setujui)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* PESAN & TOMBOL UPLOAD ULANG REVISI UNTUK ORMAWA */}
                    {!isAdmin && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-xs text-slate-700 space-y-1">
                          <p className="font-bold text-blue-900">
                            💬 Pesan & Catatan dari BEM:
                          </p>
                          <p>{berkasDipilih.catatanAdmin}</p>
                        </div>

                        {/* Jika status sedang direvisi, tampilkan form upload ulang revisi di sini */}
                        {berkasDipilih.statusIndex === 1 && (
                          <form
                            onSubmit={handleKirimUlangRevisiOrmawa}
                            className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-3"
                          >
                            <h4 className="text-xs font-bold text-amber-900">
                              🔄 Upload File Revisi Terbaru
                            </h4>
                            <p className="text-[11px] text-amber-800">
                              Silakan perbaiki file Anda sesuai catatan BEM,
                              lalu unggah kembali PDF atau gambar revisinya
                              tanpa membuat form baru.
                            </p>

                            <input
                              type="file"
                              accept=".pdf,image/*"
                              onChange={handleFileRevisiChange}
                              className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-amber-600 file:text-white cursor-pointer border border-amber-300 rounded-xl p-1 bg-white"
                              required
                            />
                            {namaFileRevisi && (
                              <span className="text-[10px] text-emerald-700 font-bold block">
                                📄 Terpilih: {namaFileRevisi}
                              </span>
                            )}

                            <button
                              type="submit"
                              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-xl text-xs shadow transition"
                            >
                              Kirim File Revisi ke BEM &rarr;
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-20 text-center text-slate-400 text-xs">
                    Pilih berkas di sebelah kiri.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
