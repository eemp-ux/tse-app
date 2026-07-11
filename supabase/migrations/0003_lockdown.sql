-- Lock-down: replace permissive v1 policies with owner-scoped RLS.
-- Rows with user_id IS NULL are seed/demo data: readable by everyone,
-- writable by no one (not even authenticated users) once locked down.

do $$
declare
  t text;
begin
  foreach t in array array[
    'projects', 'parties', 'events', 'requirements',
    'bid_documents', 'requirement_changes', 'project_summaries'
  ]
  loop
    execute format('drop policy if exists "%s_v1_read" on %I', t, t);
    execute format('drop policy if exists "%s_v1_write" on %I', t, t);
    execute format('drop policy if exists "%s_select" on %I', t, t);
    execute format('drop policy if exists "%s_insert" on %I', t, t);
    execute format('drop policy if exists "%s_update" on %I', t, t);
    execute format('drop policy if exists "%s_delete" on %I', t, t);

    execute format(
      'create policy "%s_select" on %I for select using (auth.uid() = user_id or user_id is null)',
      t, t
    );
    execute format(
      'create policy "%s_insert" on %I for insert with check (auth.uid() = user_id)',
      t, t
    );
    execute format(
      'create policy "%s_update" on %I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      t, t
    );
    execute format(
      'create policy "%s_delete" on %I for delete using (auth.uid() = user_id)',
      t, t
    );
  end loop;
end $$;

-- audit_logs: append-only. Readable (own rows + demo), insertable by the
-- acting user, never updatable or deletable via the API.
drop policy if exists "audit_logs_v1_read" on audit_logs;
drop policy if exists "audit_logs_v1_write" on audit_logs;
drop policy if exists "audit_logs_select" on audit_logs;
drop policy if exists "audit_logs_insert" on audit_logs;

create policy "audit_logs_select" on audit_logs
  for select using (auth.uid() = user_id or user_id is null);
create policy "audit_logs_insert" on audit_logs
  for insert with check (auth.uid() = user_id);
