-- SteelMind v1: commercial pipeline + steel quotes + improved RLS

create table if not exists public.commercial_opportunities (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  cliente text not null,
  contato text,
  valor_estimado numeric(14,2) not null default 0,
  stage text not null default 'lead' check (stage in ('lead', 'qualification', 'proposal', 'negotiation', 'won', 'lost')),
  quote_id uuid,
  codigo_projeto_gestio int,
  observacoes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.steel_quotes (
  id uuid primary key,
  titulo text not null,
  status text not null,
  observacoes text not null default '',
  arquivos jsonb not null default '[]'::jsonb,
  pipeline jsonb not null default '[]'::jsonb,
  itens jsonb not null default '[]'::jsonb,
  custos jsonb not null,
  memorial jsonb,
  mensagens jsonb not null default '[]'::jsonb,
  ai_mode text not null default 'steelmind',
  opportunity_id uuid references public.commercial_opportunities(id) on delete set null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.commercial_opportunities
  add constraint commercial_opportunities_quote_id_fkey
  foreign key (quote_id) references public.steel_quotes(id) on delete set null;

create index if not exists idx_opportunities_stage on public.commercial_opportunities(stage);
create index if not exists idx_steel_quotes_status on public.steel_quotes(status);

alter table public.commercial_opportunities enable row level security;
alter table public.steel_quotes enable row level security;

-- Authenticated users can read/write (service role bypasses RLS)
create policy "authenticated_read_opportunities"
  on public.commercial_opportunities for select
  to authenticated using (true);

create policy "authenticated_write_opportunities"
  on public.commercial_opportunities for all
  to authenticated using (true) with check (true);

create policy "authenticated_read_quotes"
  on public.steel_quotes for select
  to authenticated using (true);

create policy "authenticated_write_quotes"
  on public.steel_quotes for all
  to authenticated using (true) with check (true);

-- Tighten platform tables: require authenticated (replace open policies)
drop policy if exists "service_all_requisitions" on public.purchase_requisitions;
drop policy if exists "service_all_boms" on public.project_boms;
drop policy if exists "service_all_movements" on public.movement_logs;
drop policy if exists "service_all_sync_runs" on public.sync_runs;

create policy "authenticated_read_requisitions"
  on public.purchase_requisitions for select to authenticated using (true);
create policy "authenticated_write_requisitions"
  on public.purchase_requisitions for all to authenticated using (true) with check (true);

create policy "authenticated_read_boms"
  on public.project_boms for select to authenticated using (true);
create policy "authenticated_write_boms"
  on public.project_boms for all to authenticated using (true) with check (true);

create policy "authenticated_read_movements"
  on public.movement_logs for select to authenticated using (true);
create policy "authenticated_write_movements"
  on public.movement_logs for all to authenticated using (true) with check (true);

create policy "authenticated_read_sync_runs"
  on public.sync_runs for select to authenticated using (true);
create policy "authenticated_write_sync_runs"
  on public.sync_runs for all to authenticated using (true) with check (true);
