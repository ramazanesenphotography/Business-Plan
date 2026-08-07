-- BUSINESS PLAN AUTH V1 - OPTIONAL SAFE PATCH
-- Run only if the link columns do not already exist.

alter table public.shoots
  add column if not exists drive_link text,
  add column if not exists gallery_link text,
  add column if not exists invoice_link text,
  add column if not exists contract_link text;

create index if not exists profiles_approval_status_idx
  on public.profiles (approval_status);

create index if not exists profiles_email_idx
  on public.profiles (email);

notify pgrst, 'reload schema';
