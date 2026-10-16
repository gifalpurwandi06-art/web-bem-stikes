import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      {/* NAVBAR */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="font-bold text-xl text-blue-600">
            BEM KM STIKes DH - Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
              Mode Simulasi Admin
            </span>
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-red-600">
              Logout
            </Link>
          </div>
        </div>
      </header>

      {/* KONTEN UTAMA DASHBOARD */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Selamat Datang, Super Admin / Admin BEM! 👋</h1>
          <p className="text-slate-600 mt-1">
            Berikut adalah ringkasan sistem layanan digital BEM KM STIKes Dharma Husada hari ini.
          </p>
        </div>

        {/* Statistik Ringkas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Pengajuan Surat & Desain Masuk</p>
            <h3 className="text-3xl font-bold text-blue-600 mt-2">12 Berkas</h3>
            <span className="text-xs text-amber-600 font-medium mt-1 inline-block">⏳ 4 Berkas butuh review segera</span>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Aspirasi Mahasiswa Baru</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">8 Pesan</h3>
            <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">✅ Semua sudah diteruskan ke bidang terkait</span>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Total Akun Ormawa Aktif</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">14 Ormawa</h3>
            <span className="text-xs text-slate-500 font-medium mt-1 inline-block">🔒 Sistem akses terverifikasi</span>
          </div>
        </div>

        {/* Tabel Aktivitas / Pengajuan Terbaru */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800">Daftar Konsultasi Ormawa Terbaru</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-md font-medium">
              Update Real-time
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <th className="p-4 font-semibold">Ormawa Pengaju</th>
                  <th className="p-4 font-semibold">Perihal</th>
                  <th className="p-4 font-semibold">Jenis</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-center">Aksi / Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-4 font-medium text-slate-800">HIMA Keperawatan</td>
                  <td className="p-4 text-slate-600">Proposal Seminar Nasional Keperawatan</td>
                  <td className="p-4 text-slate-600">Konsultasi Surat</td>
                  <td className="p-4">
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                      Pending Review
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
                      Buka & Beri Catatan PDF
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-800">UKM Olahraga</td>
                  <td className="p-4 text-slate-600">Desain Poster Dies Natalis Cup</td>
                  <td className="p-4 text-slate-600">Konsultasi Desain</td>
                  <td className="p-4">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                      ACC / Selesai
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-slate-200 transition">
                      Lihat Hasil
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        <p>&copy; 2026 BEM KM STIKes Dharma Husada.</p>
      </footer>
    </div>
  );
}