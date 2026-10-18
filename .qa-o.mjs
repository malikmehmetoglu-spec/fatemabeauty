import { createClient } from "@supabase/supabase-js";
const s = createClient("https://btcyrzvaexmgffeamlmg.supabase.co","sb_publishable_KZalKMptfoOsfL6_TU1vbw_RJIX7wTL");
const a = await s.auth.signInWithPassword({ email: "malek@fatema.beauty", password: "homs.111" }); console.log(a.error?.message);
const mode = process.argv[2];
if (mode === "stock") console.log(JSON.stringify(await s.rpc("receive_stock", { p_product: "qa-p-serum", p_qty: 5, p_supplier: "QA-P" })));
if (mode === "create") {
  console.log(JSON.stringify(await s.from("products").insert({ key: "qa-p-serum", name: "QA-P سيروم فيتامين سي للبشرة الحساسة والمتعبة", size: "30 مل", category: "QA-P سيروم", price: 25000, show_in_store: true, active: true, recommended: true, kind: "retail", description: "QA" }).select("key,stock")));
  console.log(JSON.stringify(await s.from("stock_batches").insert({ product_key: "qa-p-serum", qty_received: 5, qty_left: 5, source: "QA-P" }).select("id")));
  console.log(JSON.stringify(await s.from("products").select("key,stock").eq("key","qa-p-serum")));
}
