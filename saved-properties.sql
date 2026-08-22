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