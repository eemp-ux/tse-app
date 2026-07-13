-- Classify requirements and requirement_changes as commercial or technical
-- so the UI can separate scope/spec items from budget/schedule/contract items.

alter table requirements add column if not exists category text not null default 'technical';
alter table requirement_changes add column if not exists category text not null default 'technical';

-- Backfill existing seed/demo data with sensible categories.
update requirements set category = 'commercial' where id in (
  'd1000000-0000-0000-0000-000000000003', -- Budget ceiling $180k (revised $210k)
  '741502af-290a-4a73-b56c-8eb43cfd531c',  -- Site visit scheduling
  'edf47039-d170-4ba3-b4cd-cbd504d12d95',  -- Budget ceiling
  '74374f8b-df09-4387-874b-4b059a615f66',  -- Fiscal year-end deadline
  '5d98fcab-1590-46f9-88b1-89ed72dd83c8'   -- Budget
);

update requirement_changes set category = 'commercial' where id in (
  'f1000000-0000-0000-0000-000000000001' -- Completion by March 2025 -> April 2025
);
