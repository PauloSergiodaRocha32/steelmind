-- Steel AI permanent: agent reports storage
create table if not exists public.agent_reports (
  id uuid primary key,
  status text not null,
  score int not null default 0,
  summary jsonb not null default '{}'::jsonb,
  agents jsonb not null default '[]'::jsonb,
  started_at timestamptz not null,
  finished_at timestamptz not null,
  triggered_by uuid references public.profiles(id)
);

create index if not exists idx_agent_reports_finished on public.agent_reports(finished_at desc);

alter table public.agent_reports enable row level security;

create policy "authenticated_read_agent_reports"
  on public.agent_reports for select to authenticated using (true);

create policy "authenticated_write_agent_reports"
  on public.agent_reports for all to authenticated using (true) with check (true);
