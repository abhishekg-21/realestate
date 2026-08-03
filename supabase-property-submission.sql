-- Run after supabase-setup.sql in Supabase Dashboard → SQL Editor.
-- Property photos and documents are private until an administrator approves a listing.

create table if not exists public.property_submissions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'under_review', 'changes_requested', 'approved', 'rejected')),
  intent text not null check (intent in ('sale', 'rent', 'commercial')),
  property_type text not null,
  title text not null,
  description text,
  city text not null,
  state text not null,
  locality text,
  address text,
  price numeric,
  price_period text,
  bedrooms integer,
  bathrooms integer,
  area_sqft numeric,
  contact_name text not null,
  contact_phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_submission_media (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.property_submissions(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.property_submission_documents (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.property_submissions(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  document_type text not null,
  created_at timestamptz not null default now()
);

alter table public.property_submissions enable row level security;
alter table public.property_submission_media enable row level security;
alter table public.property_submission_documents enable row level security;

create policy "Owners manage their submissions" on public.property_submissions
for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Owners manage submission media" on public.property_submission_media
for all to authenticated using (exists (select 1 from public.property_submissions s where s.id = submission_id and s.owner_id = auth.uid()))
with check (exists (select 1 from public.property_submissions s where s.id = submission_id and s.owner_id = auth.uid()));

create policy "Owners manage submission documents" on public.property_submission_documents
for all to authenticated using (exists (select 1 from public.property_submissions s where s.id = submission_id and s.owner_id = auth.uid()))
with check (exists (select 1 from public.property_submissions s where s.id = submission_id and s.owner_id = auth.uid()));

insert into storage.buckets (id, name, public)
values ('property-media', 'property-media', false), ('property-documents', 'property-documents', false)
on conflict (id) do nothing;

create policy "Users upload their submission files" on storage.objects
for insert to authenticated with check (
  bucket_id in ('property-media', 'property-documents')
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users read their submission files" on storage.objects
for select to authenticated using (
  bucket_id in ('property-media', 'property-documents')
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users delete their submission files" on storage.objects
for delete to authenticated using (
  bucket_id in ('property-media', 'property-documents')
  and (storage.foldername(name))[1] = auth.uid()::text
);
