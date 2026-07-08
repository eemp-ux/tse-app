create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  customer_name text not null,
  status text not null default 'prospecting',
  description text,
  created_at timestamptz not null default now()
);
alter table projects enable row level security;
drop policy if exists "projects_v1_read" on projects;
create policy "projects_v1_read" on projects for select using (true);
drop policy if exists "projects_v1_write" on projects;
create policy "projects_v1_write" on projects for all using (true) with check (true);

create table if not exists parties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  role text not null,
  organization text,
  email text,
  created_at timestamptz not null default now()
);
alter table parties enable row level security;
drop policy if exists "parties_v1_read" on parties;
create policy "parties_v1_read" on parties for select using (true);
drop policy if exists "parties_v1_write" on parties;
create policy "parties_v1_write" on parties for all using (true) with check (true);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  project_id uuid not null references projects(id) on delete cascade,
  event_type text not null,
  party_id uuid references parties(id),
  direction text,
  event_date timestamptz not null default now(),
  raw_content text,
  summary text,
  summary_source text,
  summary_confidence numeric,
  summary_review_status text default 'unreviewed',
  created_at timestamptz not null default now()
);
alter table events enable row level security;
drop policy if exists "events_v1_read" on events;
create policy "events_v1_read" on events for select using (true);
drop policy if exists "events_v1_write" on events;
create policy "events_v1_write" on events for all using (true) with check (true);

create table if not exists requirements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  project_id uuid not null references projects(id) on delete cascade,
  source_event_id uuid references events(id),
  title text not null,
  description text,
  status text not null default 'open',
  priority text,
  extracted_value text,
  extracted_source text,
  extracted_confidence numeric,
  extracted_review_status text default 'unreviewed',
  created_at timestamptz not null default now()
);
alter table requirements enable row level security;
drop policy if exists "requirements_v1_read" on requirements;
create policy "requirements_v1_read" on requirements for select using (true);
drop policy if exists "requirements_v1_write" on requirements;
create policy "requirements_v1_write" on requirements for all using (true) with check (true);

create table if not exists bid_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  version text not null default '1',
  received_date timestamptz,
  pasted_content text,
  ai_summary text,
  ai_summary_source text,
  ai_summary_confidence numeric,
  ai_summary_review_status text default 'unreviewed',
  created_at timestamptz not null default now()
);
alter table bid_documents enable row level security;
drop policy if exists "bid_documents_v1_read" on bid_documents;
create policy "bid_documents_v1_read" on bid_documents for select using (true);
drop policy if exists "bid_documents_v1_write" on bid_documents;
create policy "bid_documents_v1_write" on bid_documents for all using (true) with check (true);

create table if not exists requirement_changes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  project_id uuid not null references projects(id) on delete cascade,
  requirement_id uuid references requirements(id),
  bid_document_id uuid references bid_documents(id),
  change_type text not null,
  previous_value text,
  new_value text,
  detected_by text not null default 'ai',
  review_status text default 'unreviewed',
  created_at timestamptz not null default now()
);
alter table requirement_changes enable row level security;
drop policy if exists "requirement_changes_v1_read" on requirement_changes;
create policy "requirement_changes_v1_read" on requirement_changes for select using (true);
drop policy if exists "requirement_changes_v1_write" on requirement_changes;
create policy "requirement_changes_v1_write" on requirement_changes for all using (true) with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  project_id uuid,
  action text not null,
  target_table text,
  target_id uuid,
  detail jsonb,
  created_at timestamptz not null default now()
);
alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into projects (id, name, customer_name, status, description) values
  ('a1000000-0000-0000-0000-000000000001', 'Westfield HVAC Upgrade', 'Westfield Properties Ltd', 'bid_received', 'Commercial HVAC replacement across 3 floors, initial scope discovered via intro call.'),
  ('a1000000-0000-0000-0000-000000000002', 'Harbor Bridge Electrical', 'Harbor City Council', 'prospecting', 'Preliminary conversations about switchboard upgrade for the bridge maintenance facility.'),
  ('a1000000-0000-0000-0000-000000000003', 'Metro Fitout Project', 'Metro Retail Group', 'requirements_confirmed', 'Full electrical fitout for new retail tenancy, requirements confirmed in writing.');

insert into parties (id, project_id, name, role, organization, email) values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Sandra Okafor', 'customer', 'Westfield Properties Ltd', 'sokafor@westfield.example.com'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'ThermoTech Solutions', 'vendor', 'ThermoTech Solutions', 'quotes@thermotech.example.com'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'CoolAir Pty Ltd', 'vendor', 'CoolAir Pty Ltd', 'sales@coolair.example.com'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'James Tran', 'customer', 'Harbor City Council', 'j.tran@harborcity.example.gov'),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', 'Priya Nair', 'customer', 'Metro Retail Group', 'pnair@metroretail.example.com');

insert into events (id, project_id, party_id, event_type, direction, event_date, raw_content, summary, summary_source, summary_confidence, summary_review_status) values
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'email', 'inbound', '2024-11-05 09:14:00+00', 'Hi, we are looking for quotes to replace HVAC units on floors 2, 3, and 4. Budget is around $180k. Can you come site visit next week?', 'Customer requesting HVAC replacement quote for floors 2-4, budget ~$180k, requesting site visit.', 'ai_extraction', 0.93, 'approved'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'meeting', 'inbound', '2024-11-12 10:00:00+00', 'Site visit completed. Sandra confirmed scope includes BMS integration. Budget now revised to $210k after seeing plant room condition.', 'Site visit: scope expanded to include BMS integration, budget revised to $210k.', 'ai_extraction', 0.91, 'approved'),
  ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004', 'email', 'inbound', '2024-12-01 14:22:00+00', 'Just reaching out to understand your capabilities for switchboard upgrades. No formal RFQ yet.', 'Introductory enquiry from Council about switchboard upgrade capability, no formal RFQ issued.', 'ai_extraction', 0.88, 'unreviewed'),
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000005', 'email', 'inbound', '2024-10-20 08:55:00+00', 'Please find attached the confirmed fitout specification. All requirements are final as of this email.', 'Customer confirmed final fitout specification — requirements locked.', 'ai_extraction', 0.96, 'approved');

insert into requirements (id, project_id, source_event_id, title, description, status, priority, extracted_value, extracted_source, extracted_confidence, extracted_review_status) values
  ('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'HVAC replacement floors 2-4', 'Replace all HVAC units on floors 2, 3, and 4', 'confirmed', 'high', 'HVAC replacement floors 2, 3, 4', 'ai_extraction', 0.93, 'approved'),
  ('d1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'BMS integration', 'New HVAC units must integrate with existing Building Management System', 'open', 'high', 'BMS integration required', 'ai_extraction', 0.91, 'approved'),
  ('d1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Budget ceiling $180k (revised $210k)', 'Initial budget $180k revised to $210k after site visit', 'changed', 'medium', 'Budget revised from $180k to $210k', 'ai_extraction', 0.89, 'approved'),
  ('d1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000004', 'Full electrical fitout per spec', 'All items per confirmed fitout specification document', 'confirmed', 'high', 'Electrical fitout per spec', 'ai_extraction', 0.96, 'approved');

insert into bid_documents (id, project_id, title, version, received_date, ai_summary, ai_summary_source, ai_summary_confidence, ai_summary_review_status) values
  ('e1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Westfield HVAC RFQ v1', '1', '2024-11-20 00:00:00+00', 'RFQ covers HVAC replacement for floors 2-4, BMS integration mandatory, completion by March 2025, budget $210k.', 'ai_extraction', 0.92, 'approved'),
  ('e1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Westfield HVAC RFQ v2', '2', '2024-12-03 00:00:00+00', 'Revision adds requirement for energy efficiency rating (min 4-star NABERS), completion date extended to April 2025.', 'ai_extraction', 0.90, 'unreviewed');

insert into requirement_changes (id, project_id, requirement_id, bid_document_id, change_type, previous_value, new_value, detected_by, review_status) values
  ('f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000002', 'modified', 'Completion by March 2025', 'Completion extended to April 2025', 'ai', 'unreviewed'),
  ('f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', null, 'e1000000-0000-0000-0000-000000000002', 'added', null, 'Minimum 4-star NABERS energy efficiency rating required', 'ai', 'unreviewed');