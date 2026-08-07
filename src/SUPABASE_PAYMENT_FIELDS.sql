-- Run once in Supabase SQL Editor.
-- Adds partial/deposit payment tracking without changing existing rows.

alter table public.shoots
  add column if not exists paid_amount numeric default 0,
  add column if not exists remaining_amount numeric default 0;

update public.shoots
set
  paid_amount = case
    when payment_status = 'Paid' then coalesce(gross_income, 0)
    else coalesce(paid_amount, 0)
  end,
  remaining_amount = greatest(
    coalesce(gross_income, 0) -
    case
      when payment_status = 'Paid' then coalesce(gross_income, 0)
      else coalesce(paid_amount, 0)
    end,
    0
  );
