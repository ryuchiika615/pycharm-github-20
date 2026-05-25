create table if not exists public.shift_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.shift_state enable row level security;

create policy "public read shift state"
on public.shift_state
for select
using (true);

create policy "public insert shift state"
on public.shift_state
for insert
with check (true);

create policy "public update shift state"
on public.shift_state
for update
using (true)
with check (true);
