-- =====================================================================
-- HANIEL STORES - PHASE 2: DATABASE ADDITION
-- ---------------------------------------------------------------------
-- You already ran schema.sql in Phase 1. Run THIS file once, the same
-- way (Supabase -> SQL Editor -> New query -> paste -> Run).
-- It adds one small view that the category filter needs.
-- (It is also now included inside schema.sql for future fresh setups.)
-- Safe to run more than once.
-- =====================================================================

begin;

create or replace view public.category_counts
with (security_invoker = true) as
select c.id, c.name, c.slug, c.sort_order, count(p.id)::int as product_count
from public.categories c
left join public.products p on p.category_id = c.id and p.is_active
where c.is_active
group by c.id;

grant select on public.category_counts to anon, authenticated, service_role;

commit;

-- Check - run this afterwards. Expected: 10 rows (categories that have products).
--   select name, product_count from public.category_counts
--   where product_count > 0 order by sort_order;
