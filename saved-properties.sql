create table public.saved_properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id text not null,
  saved_at timestamptz not null default now(),
  unique(user_id, property_id)
);

alter table public.saved_properties enable row level security;

create policy "Users can manage their own saved properties"
on public.saved_properties
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ─── 1. Fix property_id column type in saved_properties ──────────────────────
ALTER TABLE public.saved_properties 
  ALTER COLUMN property_id TYPE uuid USING property_id::uuid;

-- ─── 2. Add foreign key to property_submissions ───────────────────────────────
ALTER TABLE public.saved_properties
  ADD CONSTRAINT saved_properties_property_id_fkey
  FOREIGN KEY (property_id) 
  REFERENCES public.property_submissions(id) 
  ON DELETE CASCADE;

-- ─── 3. Add public read policy for approved submissions ───────────────────────
-- Without this, buyers can't read listings they didn't create (RLS blocks join)
CREATE POLICY "Anyone can read approved submissions"
  ON public.property_submissions
  FOR SELECT
  TO authenticated, anon
  USING (status = 'approved');

-- ─── 4. Allow media of approved submissions to be read publicly ───────────────
CREATE POLICY "Anyone can read approved submission media"
  ON public.property_submission_media
  FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.property_submissions s
      WHERE s.id = submission_id
      AND s.status = 'approved'
    )
  );

-- ─── 5. Make property-media bucket public so image URLs work ─────────────────
UPDATE storage.buckets 
  SET public = true 
  WHERE id = 'property-media';