"use client";

import { useEffect, useState } from "react";
import { SiteFooter, SiteHeader } from "../components/site-chrome";
import { useAdminSession } from "../lib/use-admin-session";

interface ProfileCard {
  jabatan: string;
  nama: string;
  prodi: string;
  inisial: string;
  bio: string;
}

interface Ministry {
  nama: string;
  fokus: string;
  koordinator: string;
  icon: string;
}

interface DepartmentPerson {
  id: string;
  full_name: string;
  department: string;
  role_name: string;
  study_program: string;
  bio: string;
}

const pimpinanInti: ProfileCard[] = [
  { jabatan: "Presiden Mahasiswa", nama: "Rafli Maulana", prodi: "S1 Keperawatan", inisial: "RR", bio: "Memimpin BEM KM dan mengoordinasikan arah kerja kabinet bersama seluruh kementerian." },
  { jabatan: "Wakil Presiden Mahasiswa", nama: "Muhammad Gifal", prodi: "D3 Optometri", inisial: "GG", bio: "Mendampingi Presiden Mahasiswa dan membantu koordinasi pelaksanaan program kabinet." },
  { jabatan: "Sekretaris Umum", nama: "Nijma Nurlaila Syahriani", prodi: "S1 Kesehatan Masyarakat", inisial: "NN", bio: "Mengelola administrasi, persuratan, dokumentasi rapat, dan arsip organisasi." },
  { jabatan: "Sekretaris 1", nama: "Lutfi Putri Deanita", prodi: "S1 Keperawatan", inisial: "LP", bio: "Mendukung administrasi kabinet dan koordinasi dokumen kegiatan BEM KM." },
  { jabatan: "Bendahara Umum", nama: "Anita Sari", prodi: "D3 Keperawatan", inisial: "AS", bio: "Mengoordinasikan perencanaan, pencatatan, dan pelaporan keuangan organisasi." },
  { jabatan: "Bendahara 1", nama: "Nur Alisa Usanniah", prodi: "S1 Keperawatan", inisial: "AU", bio: "Mendukung pencatatan transaksi dan administrasi keuangan kegiatan kabinet." },
];

const kementerianList: Ministry[] = [
  { nama: "Kementerian Dalam Negeri", fokus: "Koordinasi strategis antar Hima & UKM serta pengawasan internal ormawa.", koordinator: "Neng Siti Aisah", icon: "DN" },
  { nama: "Kementerian Luar Negeri", fokus: "Hubungan eksternal, kolaborasi antar kampus, dan aksi pengabdian masyarakat.", koordinator: "Albatsani Aruna", icon: "LN" },
  { nama: "Kementerian Komunikasi & Informasi", fokus: "Manajemen media sosial, publikasi kegiatan, dan pengelolaan portal web BEM KM.", koordinator: "Shakyla Naura", icon: "KI" },
  { nama: "Kementerian Advokasi & Kesejahteraan Mahasiswa", fokus: "Pengawalan aspirasi mahasiswa, advokasi fasilitas, dan layanan kesejahteraan.", koordinator: "Syaidatun Nisa", icon: "AK" },
  { nama: "Kementerian Minat dan Bakat", fokus: "Porseni, apresiasi bakat minat, serta pengembangan kreativitas mahasiswa.", koordinator: "Asep Rohmat", icon: "SO" },
];

function ProfileButton({ profile, onSelect }: { profile: ProfileCard; onSelect: (profile: ProfileCard) => void }) {
  return (
    <button type="button" onClick={() => onSelect(profile)} className="group flex w-full items-center gap-4 border border-slate-200 bg-white p-4 text-left transition hover:border-blue-400 hover:bg-blue-50/50 sm:p-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-blue-100 text-sm font-extrabold text-blue-800">{profile.inisial}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase text-blue-700">{profile.jabatan}</span>
        <span className="mt-1 block truncate text-sm font-bold text-slate-900">{profile.nama}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{profile.prodi}</span>
      </span>
      <span aria-hidden="true" className="text-sm font-bold text-blue-700">↗</span>
    </button>
  );
}

export default function StrukturPage() {
  const { supabase, configured, isAdmin, loading: authLoading, error: authError, signIn, signOut } = useAdminSession();
  const [selectedProfile, setSelectedProfile] = useState<ProfileCard | null>(null);
  const [selectedMinistryName, setSelectedMinistryName] = useState("");
  const [departmentPeople, setDepartmentPeople] = useState<DepartmentPerson[]>([]);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [personName, setPersonName] = useState("");
  const [personRole, setPersonRole] = useState("");
  const [personStudy, setPersonStudy] = useState("");
  const [personBio, setPersonBio] = useState("");
  const [feedback, setFeedback] = useState("");

  const selectedMinistry = kementerianList.find((ministry) => ministry.nama === selectedMinistryName);
  const visibleDepartmentPeople = selectedMinistryName
    ? departmentPeople.filter((person) => person.department === selectedMinistryName)
    : [];

  useEffect(() => {
    if (!supabase || !selectedMinistryName) return;
    let active = true;
    const loadPeople = async () => {
      const { data } = await supabase
        .from("organization_people")
        .select("id,full_name,department,role_name,study_program,bio")
        .eq("department", selectedMinistryName)
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (active) setDepartmentPeople((data || []) as DepartmentPerson[]);
    };
    void loadPeople();
    return () => { active = false; };
  }, [supabase, selectedMinistryName]);

  const handleAdminLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await signIn(email, password);
  };

  const handleAddPerson = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !selectedMinistry) return;
    setFeedback("");
    const { data, error } = await supabase.from("organization_people").insert({
      full_name: personName.trim(),
      department: selectedMinistry.nama,
      role_name: personRole.trim(),
      study_program: personStudy.trim(),
      bio: personBio.trim(),
      sort_order: departmentPeople.length,
      published: true,
    }).select("id,full_name,department,role_name,study_program,bio").single();

    if (error) {
      setFeedback(`Anggota belum tersimpan: ${error.message}`);
      return;
    }
    setDepartmentPeople((current) => [...current, data as DepartmentPerson]);
    setPersonName("");
    setPersonRole("");
    setPersonStudy("");
    setPersonBio("");
    setFeedback("Anggota dan bio berhasil ditambahkan.");
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-10 flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 text-[10px] font-bold uppercase text-blue-700">Kabinet Lentera ASA · 2026</p>
            <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">Struktur Kepengurusan BEM KM</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">Kenali pimpinan, sekretariat, bendahara, dan kementerian BEM KM.</p>
          </div>
          {isAdmin ? (
            <button type="button" onClick={() => void signOut()} className="w-fit border border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-white">Keluar dari Admin</button>
          ) : (
            <button type="button" onClick={() => setAdminLoginOpen((open) => !open)} className="w-fit border border-slate-300 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700">{adminLoginOpen ? "Tutup login admin" : "Masuk sebagai Admin BEM"}</button>
          )}
        </div>

        {adminLoginOpen && !isAdmin && configured && (
          <form onSubmit={handleAdminLogin} className="mb-8 grid gap-3 border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div><label htmlFor="structure-admin-email" className="mb-1 block text-[10px] font-bold uppercase text-slate-600">Email admin</label><input id="structure-admin-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full border border-slate-300 px-3 py-2.5 text-xs outline-none focus:border-blue-600" /></div>
            <div><label htmlFor="structure-admin-password" className="mb-1 block text-[10px] font-bold uppercase text-slate-600">Password</label><input id="structure-admin-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border border-slate-300 px-3 py-2.5 text-xs outline-none focus:border-blue-600" /></div>
            <button type="submit" disabled={authLoading} className="bg-blue-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50">Masuk</button>
            {authError && <p role="alert" className="text-xs font-semibold text-red-700 sm:col-span-3">{authError}</p>}
          </form>
        )}
        {!configured && <p role="status" className="mb-8 border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900">Supabase belum dikonfigurasi; daftar anggota kementerian akan tersedia setelah backend diaktifkan.</p>}

        <section aria-labelledby="leadership-title" className="mb-12 space-y-5">
          <div className="flex items-center gap-4"><h2 id="leadership-title" className="text-lg font-bold text-slate-900">Pimpinan inti</h2><span className="h-px flex-1 bg-slate-200" /></div>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
            {pimpinanInti.slice(0, 2).map((profile) => <ProfileButton key={profile.jabatan} profile={profile} onSelect={setSelectedProfile} />)}
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-blue-700">Kesekretariatan</h3>
              <div className="grid gap-3 sm:grid-cols-2">{pimpinanInti.slice(2, 4).map((profile) => <ProfileButton key={profile.jabatan} profile={profile} onSelect={setSelectedProfile} />)}</div>
            </section>
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-blue-700">Keuangan</h3>
              <div className="grid gap-3 sm:grid-cols-2">{pimpinanInti.slice(4, 6).map((profile) => <ProfileButton key={profile.jabatan} profile={profile} onSelect={setSelectedProfile} />)}</div>
            </section>
          </div>
        </section>

        {selectedProfile && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedProfile(null); }}>
            <section role="dialog" aria-modal="true" aria-labelledby="profile-dialog-title" className="w-full max-w-lg border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-[10px] font-bold uppercase text-blue-700">Profil pengurus</p><h2 id="profile-dialog-title" className="mt-1 text-xl font-bold text-slate-900">{selectedProfile.nama}</h2></div>
                <button type="button" onClick={() => setSelectedProfile(null)} aria-label="Tutup profil" className="h-9 w-9 border border-slate-300 text-lg text-slate-600 hover:bg-slate-100">×</button>
              </div>
              <p className="mt-4 text-xs font-bold text-slate-700">{selectedProfile.jabatan} · {selectedProfile.prodi}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{selectedProfile.bio}</p>
            </section>
          </div>
        )}

        <section aria-labelledby="ministries-title" className="space-y-5">
          <div className="flex items-center gap-4"><h2 id="ministries-title" className="text-lg font-bold text-slate-900">Kementerian</h2><span className="h-px flex-1 bg-slate-200" /></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kementerianList.map((ministry) => (
              <button key={ministry.nama} type="button" onClick={() => { setSelectedMinistryName(ministry.nama); setDepartmentPeople([]); setExpandedMember(null); }} aria-expanded={selectedMinistryName === ministry.nama} className={`border bg-white p-5 text-left transition hover:border-blue-400 hover:bg-blue-50/40 ${selectedMinistryName === ministry.nama ? "border-blue-600" : "border-slate-200"}`}>
                <span className="flex h-10 w-10 items-center justify-center bg-blue-100 text-xs font-extrabold text-blue-800">{ministry.icon}</span>
                <span className="mt-4 block text-base font-bold text-slate-900">{ministry.nama}</span>
                <span className="mt-2 block text-xs leading-5 text-slate-600">{ministry.fokus}</span>
                <span className="mt-4 block border-t border-slate-100 pt-3 text-[10px] font-semibold text-blue-800">Menteri / Koord: {ministry.koordinator} · Lihat detail →</span>
              </button>
            ))}
          </div>
        </section>

        {selectedMinistry && (
          <section aria-labelledby="ministry-detail-title" className="mt-8 border border-blue-200 bg-white p-5 sm:p-7">
            <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-[10px] font-bold uppercase text-blue-700">Detail kementerian</p><h2 id="ministry-detail-title" className="mt-1 text-xl font-bold text-slate-900">{selectedMinistry.nama}</h2></div>
              <p className="text-xs font-semibold text-slate-600">Menteri / Koordinator: {selectedMinistry.koordinator}</p>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">{selectedMinistry.fokus}</p>
            <h3 className="mt-6 text-xs font-bold uppercase text-slate-700">Anggota departemen & bio</h3>
            {visibleDepartmentPeople.length ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {visibleDepartmentPeople.map((person) => (
                  <button key={person.id} type="button" onClick={() => setExpandedMember(expandedMember === person.id ? null : person.id)} aria-expanded={expandedMember === person.id} className="border border-slate-200 p-4 text-left hover:border-blue-400">
                    <span className="block text-sm font-bold text-slate-900">{person.full_name}</span>
                    <span className="mt-1 block text-[10px] font-semibold text-blue-700">{person.role_name}{person.study_program ? ` · ${person.study_program}` : ""}</span>
                    {expandedMember === person.id && <span className="mt-3 block text-xs leading-5 text-slate-600">{person.bio}</span>}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-3 border-l-2 border-blue-300 py-1 pl-3 text-xs leading-5 text-slate-500">Belum ada data anggota departemen. Admin dapat menambahkannya setelah Supabase dikonfigurasi.</p>
            )}

            {isAdmin && (
              <form onSubmit={handleAddPerson} className="mt-6 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-2">
                <h3 className="text-sm font-bold text-slate-900 sm:col-span-2">Tambah anggota departemen</h3>
                <input required aria-label="Nama anggota" placeholder="Nama anggota" value={personName} onChange={(event) => setPersonName(event.target.value)} className="border border-slate-300 px-3 py-2.5 text-xs outline-none focus:border-blue-600" />
                <input required aria-label="Jabatan anggota" placeholder="Jabatan / peran" value={personRole} onChange={(event) => setPersonRole(event.target.value)} className="border border-slate-300 px-3 py-2.5 text-xs outline-none focus:border-blue-600" />
                <input aria-label="Program studi anggota" placeholder="Program studi (opsional)" value={personStudy} onChange={(event) => setPersonStudy(event.target.value)} className="border border-slate-300 px-3 py-2.5 text-xs outline-none focus:border-blue-600" />
                <textarea required aria-label="Biografi anggota" placeholder="Bio singkat" rows={2} value={personBio} onChange={(event) => setPersonBio(event.target.value)} className="resize-y border border-slate-300 px-3 py-2.5 text-xs outline-none focus:border-blue-600" />
                <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2"><p role="status" className="text-xs text-blue-800">{feedback}</p><button type="submit" className="bg-blue-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800">Simpan anggota</button></div>
              </form>
            )}
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}