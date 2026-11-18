-- 2026-11-18 (data, applied once): products added with the old form kept the company in the first stock batch's
-- «المورّد»; copy it to products.company where that is empty so the new edit form shows it.
update public.products p set company = b.supplier
from (select distinct on (product_key) product_key, supplier from public.stock_batches
      where coalesce(trim(supplier),'')<>'' order by product_key, received_at) b
where b.product_key=p.key and coalesce(trim(p.company),'')='';
