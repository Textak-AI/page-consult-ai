-- Intelligence Accumulator table
create table public.intelligence_accumulator (
  id uuid default gen_random_uuid() primary key,
  session_id text unique not null,
  user_id uuid references auth.users(id),
  
  -- Layer 1: Consultation Intelligence
  consultation_data jsonb default '{}'::jsonb,
  
  -- Layer 2: Brand Intelligence  
  brand_data jsonb default '{}'::jsonb,
  
  -- Layer 3: Market Intelligence
  market_data jsonb default '{}'::jsonb,
  
  -- Layer 4: Strategic Synthesis
  strategy_data jsonb default '{}'::jsonb,
  
  -- Progress tracking
  completion_stage text default 'consultation',
  readiness_score integer default 0,
  
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint valid_completion_stage check (
    completion_stage in ('consultation', 'brand', 'ready-to-generate', 'generated')
  )
);

-- Enable RLS
alter table public.intelligence_accumulator enable row level security;

-- Block anonymous access
create policy "intelligence_accumulator_anon_blocked"
  on public.intelligence_accumulator
  for all
  to anon
  using (false);

-- Users can only access their own accumulators
create policy "intelligence_accumulator_users_select"
  on public.intelligence_accumulator
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "intelligence_accumulator_users_insert"
  on public.intelligence_accumulator
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "intelligence_accumulator_users_update"
  on public.intelligence_accumulator
  for update
  to authenticated
  using (auth.uid() = user_id);

create policy "intelligence_accumulator_users_delete"
  on public.intelligence_accumulator
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Indexes
create index idx_accumulator_session on public.intelligence_accumulator(session_id);
create index idx_accumulator_user on public.intelligence_accumulator(user_id);
create index idx_accumulator_stage on public.intelligence_accumulator(completion_stage);

-- Updated timestamp trigger (create function if not exists)
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger set_accumulator_updated_at
  before update on public.intelligence_accumulator
  for each row
  execute function public.handle_updated_at();