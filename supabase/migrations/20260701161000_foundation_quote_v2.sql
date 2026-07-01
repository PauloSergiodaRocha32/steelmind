-- SteelMind foundation v2: knowledge + quote traceability + shadow runs
create extension if not exists pgcrypto;

-- Knowledge domain
create table if not exists public.knowledge_rule_sets (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'inglesa-metais',
  code text not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (tenant_id, code)
);

create table if not exists public.knowledge_rule_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'inglesa-metais',
  rule_set_id uuid not null references public.knowledge_rule_sets(id) on delete cascade,
  version text not null,
  formula text not null,
  source text not null,
  owner text not null,
  assumptions jsonb not null default '[]'::jsonb,
  limitations jsonb not null default '[]'::jsonb,
  parameters jsonb not null default '{}'::jsonb,
  published_at timestamptz not null default now(),
  unique (rule_set_id, version)
);

create table if not exists public.knowledge_norm_citations (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'inglesa-metais',
  rule_version_id uuid not null references public.knowledge_rule_versions(id) on delete cascade,
  code text not null,
  title text not null,
  section text
);

create table if not exists public.constructive_systems (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'inglesa-metais',
  code text not null,
  version text not null,
  name text not null,
  description text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  unique (tenant_id, code, version)
);

-- Quote v2 domain
create table if not exists public.quote_v2 (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'inglesa-metais',
  opportunity_id uuid references public.commercial_opportunities(id),
  title text not null,
  constructive_system_id uuid references public.constructive_systems(id),
  status text not null default 'draft',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_v2_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'inglesa-metais',
  quote_id uuid not null references public.quote_v2(id) on delete cascade,
  version_number int not null,
  status text not null default 'draft',
  confidence numeric(5,4) not null default 0.0,
  margin_percent numeric(8,4) not null default 0,
  subtotal numeric(14,2) not null default 0,
  margin_value numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  uncertainty_notes jsonb not null default '[]'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (quote_id, version_number)
);

create table if not exists public.quote_v2_line_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'inglesa-metais',
  quote_version_id uuid not null references public.quote_v2_versions(id) on delete cascade,
  code text not null,
  description text not null,
  quantity numeric(14,4) not null,
  unit text not null,
  unit_price numeric(14,4) not null,
  subtotal numeric(14,2) not null
);

create table if not exists public.quote_v2_calculation_traces (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'inglesa-metais',
  line_item_id uuid not null references public.quote_v2_line_items(id) on delete cascade,
  formula text not null,
  formula_value numeric(14,4) not null,
  formula_unit text not null,
  rule_id text not null,
  rule_version text not null,
  rule_source text not null,
  rule_revision_date date not null,
  inputs jsonb not null default '{}'::jsonb,
  assumptions jsonb not null default '[]'::jsonb,
  limitations jsonb not null default '[]'::jsonb,
  norms jsonb not null default '[]'::jsonb,
  confidence numeric(5,4) not null default 0,
  calculated_at timestamptz not null default now()
);

-- Shadow mode calibration and migration safety
create table if not exists public.quote_engine_shadow_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'inglesa-metais',
  legacy_quote_id uuid references public.steel_quotes(id),
  requested_by uuid references public.profiles(id),
  constructive_system_code text not null,
  legacy_total numeric(14,2) not null,
  v2_total numeric(14,2) not null,
  delta_amount numeric(14,2) not null,
  delta_percent numeric(8,4) not null,
  confidence numeric(5,4) not null default 0,
  warning_count int not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_quote_v2_tenant on public.quote_v2(tenant_id);
create index if not exists idx_quote_v2_versions_quote on public.quote_v2_versions(quote_id);
create index if not exists idx_quote_v2_line_items_version on public.quote_v2_line_items(quote_version_id);
create index if not exists idx_quote_v2_traces_line_item on public.quote_v2_calculation_traces(line_item_id);
create index if not exists idx_shadow_runs_created_at on public.quote_engine_shadow_runs(created_at desc);

-- Strict tenant-aware RLS for v2 foundation tables
alter table public.knowledge_rule_sets enable row level security;
alter table public.knowledge_rule_versions enable row level security;
alter table public.knowledge_norm_citations enable row level security;
alter table public.constructive_systems enable row level security;
alter table public.quote_v2 enable row level security;
alter table public.quote_v2_versions enable row level security;
alter table public.quote_v2_line_items enable row level security;
alter table public.quote_v2_calculation_traces enable row level security;
alter table public.quote_engine_shadow_runs enable row level security;

create policy "tenant_rw_knowledge_rule_sets"
  on public.knowledge_rule_sets
  for all
  to authenticated
  using (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'))
  with check (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'));

create policy "tenant_rw_knowledge_rule_versions"
  on public.knowledge_rule_versions
  for all
  to authenticated
  using (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'))
  with check (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'));

create policy "tenant_rw_knowledge_norm_citations"
  on public.knowledge_norm_citations
  for all
  to authenticated
  using (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'))
  with check (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'));

create policy "tenant_rw_constructive_systems"
  on public.constructive_systems
  for all
  to authenticated
  using (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'))
  with check (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'));

create policy "tenant_rw_quote_v2"
  on public.quote_v2
  for all
  to authenticated
  using (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'))
  with check (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'));

create policy "tenant_rw_quote_v2_versions"
  on public.quote_v2_versions
  for all
  to authenticated
  using (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'))
  with check (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'));

create policy "tenant_rw_quote_v2_line_items"
  on public.quote_v2_line_items
  for all
  to authenticated
  using (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'))
  with check (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'));

create policy "tenant_rw_quote_v2_calculation_traces"
  on public.quote_v2_calculation_traces
  for all
  to authenticated
  using (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'))
  with check (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'));

create policy "tenant_rw_quote_engine_shadow_runs"
  on public.quote_engine_shadow_runs
  for all
  to authenticated
  using (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'))
  with check (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'));
