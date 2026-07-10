create table if not exists project_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  project_id uuid not null references projects(id) on delete cascade,
  summary text not null,
  review_status text not null default 'unreviewed',
  created_at timestamptz not null default now()
);
alter table project_summaries enable row level security;
drop policy if exists "project_summaries_v1_read" on project_summaries;
create policy "project_summaries_v1_read" on project_summaries for select using (true);
drop policy if exists "project_summaries_v1_write" on project_summaries;
create policy "project_summaries_v1_write" on project_summaries for all using (true) with check (true);
