create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author_name text not null,
  author_email text not null,
  category text not null,
  description text not null,
  file_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.aspirations (
  id uuid primary key default gen_random_uuid(),
  author_name text,
  anonymous boolean not null default false,
  category text not null,
  target_unit text not null default 'BEM KM',
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  description text not null default '',
  file_path text not null,
  file_name text not null,
  file_size bigint not null default 0,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create table if not exists public.gallery_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  category text not null,
  description text not null,
  photo_path text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create table if not exists public.organization_people (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  department text not null,
  role_name text not null,
  study_program text not null default '',
  bio text not null default '',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create table if not exists public.calendar_events (
  id text primary key,
  event_date date not null,
  title text not null,
  category text not null,
  event_time text not null,
  description text not null default '',
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create index if not exists works_status_created_at_idx on public.works (status, created_at desc);
create index if not exists aspirations_status_created_at_idx on public.aspirations (status, created_at desc);
create index if not exists gallery_posts_event_date_idx on public.gallery_posts (event_date desc);
create index if not exists calendar_events_date_idx on public.calendar_events (event_date);

alter table public.profiles enable row level security;
alter table public.works enable row level security;
alter table public.aspirations enable row level security;
alter table public.documents enable row level security;
alter table public.gallery_posts enable row level security;
alter table public.organization_people enable row level security;
alter table public.calendar_events enable row level security;

revoke all on table public.profiles, public.works, public.aspirations, public.documents, public.gallery_posts, public.organization_people, public.calendar_events from anon, authenticated;

grant select (id, display_name, role) on public.profiles to authenticated;

grant select (id, title, author_name, category, description, file_path, status, created_at, reviewed_at)
  on public.works to anon, authenticated;
grant insert (title, author_name, author_email, category, description, file_path)
  on public.works to anon, authenticated;

grant select (id, author_name, anonymous, category, target_unit, message, status, created_at, reviewed_at)
  on public.aspirations to anon, authenticated;
grant insert (author_name, anonymous, category, target_unit, message)
  on public.aspirations to anon, authenticated;

grant select on public.documents, public.gallery_posts to anon, authenticated;
grant insert, update, delete on public.documents, public.gallery_posts to authenticated;
grant select (id, full_name, department, role_name, study_program, bio, sort_order, published, created_at)
  on public.organization_people to anon, authenticated;
grant insert (full_name, department, role_name, study_program, bio, sort_order, published, created_by),
  update (full_name, department, role_name, study_program, bio, sort_order, published),
  delete on public.organization_people to authenticated;
grant select on public.calendar_events to anon, authenticated;
grant insert, update, delete on public.calendar_events to authenticated;

drop policy if exists "Profiles readable by owner or admin" on public.profiles;
create policy "Profiles readable by owner or admin"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "Public reads approved works and admins read queue" on public.works;
create policy "Public reads approved works and admins read queue"
  on public.works for select to anon, authenticated
  using (status = 'approved' or (select public.is_admin()));
drop policy if exists "Public submits pending works" on public.works;
create policy "Public submits pending works"
  on public.works for insert to anon, authenticated
  with check (status = 'pending');

drop policy if exists "Public reads approved aspirations and admins read queue" on public.aspirations;
create policy "Public reads approved aspirations and admins read queue"
  on public.aspirations for select to anon, authenticated
  using (status = 'approved' or (select public.is_admin()));
drop policy if exists "Public submits pending aspirations" on public.aspirations;
create policy "Public submits pending aspirations"
  on public.aspirations for insert to anon, authenticated
  with check (status = 'pending');

drop policy if exists "Public reads documents" on public.documents;
create policy "Public reads documents"
  on public.documents for select to anon, authenticated using (true);
drop policy if exists "Admins manage documents" on public.documents;
create policy "Admins manage documents"
  on public.documents for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Public reads gallery" on public.gallery_posts;
create policy "Public reads gallery"
  on public.gallery_posts for select to anon, authenticated using (true);
drop policy if exists "Admins manage gallery" on public.gallery_posts;
create policy "Admins manage gallery"
  on public.gallery_posts for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Public reads published organization people" on public.organization_people;
create policy "Public reads published organization people"
  on public.organization_people for select to anon, authenticated
  using (published or (select public.is_admin()));
drop policy if exists "Admins manage organization people" on public.organization_people;
create policy "Admins manage organization people"
  on public.organization_people for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Public reads calendar events" on public.calendar_events;
create policy "Public reads calendar events"
  on public.calendar_events for select to anon, authenticated using (true);
drop policy if exists "Admins manage calendar events" on public.calendar_events;
create policy "Admins manage calendar events"
  on public.calendar_events for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

insert into public.calendar_events (id, event_date, title, category, event_time, description)
values
  ('agenda-2026-10-04', '2026-10-04', 'Baksos & Pemeriksaan Mata Gratis', 'Pengabdian', '08:00 - Selesai', 'Pemeriksaan kesehatan dan edukasi bersama warga.'),
  ('agenda-2026-10-12', '2026-10-12', 'Workshop Penulisan Proposal & PKM', 'Akademik', '13:30 WIB', 'Lokakarya penulisan proposal untuk mahasiswa dan ormawa.'),
  ('agenda-2026-10-20', '2026-10-20', 'Pelantikan Pengurus 12 Ormawa', 'Organisasi', '09:00 WIB', 'Pelantikan pengurus organisasi mahasiswa periode 2026.'),
  ('agenda-2026-10-28', '2026-10-28', 'Rapat Koordinasi BEM & Prodi', 'Internal', '15:00 WIB', 'Koordinasi agenda BEM bersama program studi.')
on conflict (id) do nothing;

insert into public.gallery_posts (id, title, event_date, category, description)
values
  ('11000000-0000-4000-8000-000000000001', 'Pengabdian Masyarakat & Pemeriksaan Kesehatan Gratis', '2026-02-28', 'Baksos', 'BEM KM bersama Hima Keperawatan & Kebidanan memberikan layanan pemeriksaan dan edukasi kesehatan warga desa binaan.'),
  ('11000000-0000-4000-8000-000000000002', 'Makrab & Pelantikan Ormawa 2026', '2026-01-15', 'Internal', 'Malam keakraban seluruh pengurus BEM, HIMA, dan UKM sekaligus pelantikan kabinet periode baru.'),
  ('11000000-0000-4000-8000-000000000003', 'Seminar Nasional Kesehatan: Tren Teknologi Medis Modern', '2026-02-10', 'Akademik', 'Seminar ilmiah tentang perkembangan teknologi kesehatan untuk mahasiswa tenaga medis.'),
  ('11000000-0000-4000-8000-000000000004', 'Pekan Olahraga & Seni (PORSENI) Antar Prodi', '2026-03-05', 'Non-Akademik', 'Ajang olahraga dan seni untuk mempererat solidaritas serta menyalurkan bakat mahasiswa.')
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('works-files', 'works-files', false, 5242880, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  ('bem-documents', 'bem-documents', true, 10485760, array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip']),
  ('bem-gallery', 'bem-gallery', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Visitors submit karya files" on storage.objects;
create policy "Visitors submit karya files"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'works-files');
drop policy if exists "Approved karya files and admins can read" on storage.objects;
create policy "Approved karya files and admins can read"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'works-files'
    and (
      (select public.is_admin())
      or exists (
        select 1 from public.works
        where works.file_path = storage.objects.name and works.status = 'approved'
      )
    )
  );

drop policy if exists "Admins upload BEM documents" on storage.objects;
create policy "Admins upload BEM documents"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'bem-documents' and (select public.is_admin()));
drop policy if exists "Admins update BEM documents" on storage.objects;
create policy "Admins update BEM documents"
  on storage.objects for update to authenticated
  using (bucket_id = 'bem-documents' and (select public.is_admin()))
  with check (bucket_id = 'bem-documents' and (select public.is_admin()));
drop policy if exists "Admins delete BEM documents" on storage.objects;
create policy "Admins delete BEM documents"
  on storage.objects for delete to authenticated
  using (bucket_id = 'bem-documents' and (select public.is_admin()));

drop policy if exists "Admins upload gallery photos" on storage.objects;
create policy "Admins upload gallery photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'bem-gallery' and (select public.is_admin()));
drop policy if exists "Admins update gallery photos" on storage.objects;
create policy "Admins update gallery photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'bem-gallery' and (select public.is_admin()))
  with check (bucket_id = 'bem-gallery' and (select public.is_admin()));
drop policy if exists "Admins delete gallery photos" on storage.objects;
create policy "Admins delete gallery photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'bem-gallery' and (select public.is_admin()));