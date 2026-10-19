"use client";

/** Store front: hero slides (admin «واجهة المتجر») and best-seller ranking. */
import { supabase, type Tables } from "@/lib/supabase/client";
import { invalidate, must } from "./query";

export type Slide = Tables<"store_slides">;
export type SlideInput = Omit<Slide, "id" | "created_at" | "updated_at" | "image_path"> & { id?: string };

const BUCKET = "products";

export function slideImage(s: Pick<Slide, "image_path">) {
  return s.image_path ? supabase.storage.from(BUCKET).getPublicUrl(s.image_path).data.publicUrl : null;
}

/** Visible slides for the store (RLS returns only active rows to visitors). */
export async function listActiveSlides() {
  return must(await supabase.from("store_slides").select("*").eq("active", true).order("sort").order("created_at"));
}

/** Every slide, for staff. */
export async function listSlides() {
  return must(await supabase.from("store_slides").select("*").order("sort").order("created_at"));
}

/** Product keys ranked by units sold (visible items only). */
export async function listBestsellers() {
  return ((must(await supabase.rpc("store_bestsellers", { p_limit: 8 })) ?? []) as unknown as string[]);
}

async function uploadSlideImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("اختاري ملف صورة (JPG أو PNG أو WEBP).");
  if (file.size > 5 * 1024 * 1024) throw new Error("حجم الصورة أكبر من 5 ميغابايت.");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `slides/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

/** Saves a slide; a new image replaces the old file (removed after a successful save). */
export async function saveSlide(input: SlideInput, file: File | null, oldPath: string | null) {
  const path = file ? await uploadSlideImage(file) : oldPath;
  const { id, ...rest } = input;
  try {
    const row = { ...rest, image_path: path, updated_at: new Date().toISOString() };
    if (id) must(await supabase.from("store_slides").update(row).eq("id", id));
    else must(await supabase.from("store_slides").insert(row));
  } catch (e) {
    if (file && path) await supabase.storage.from(BUCKET).remove([path]);
    throw e;
  }
  if (file && oldPath && oldPath !== path) await supabase.storage.from(BUCKET).remove([oldPath]);
  invalidate("slides");
}

export async function deleteSlide(s: Slide) {
  must(await supabase.from("store_slides").delete().eq("id", s.id));
  if (s.image_path) await supabase.storage.from(BUCKET).remove([s.image_path]);
  invalidate("slides");
}

export async function setSlideActive(id: string, active: boolean) {
  must(await supabase.from("store_slides").update({ active, updated_at: new Date().toISOString() }).eq("id", id));
  invalidate("slides");
}

/** Writes the given order (index → sort). */
export async function reorderSlides(ids: string[]) {
  for (let i = 0; i < ids.length; i++) must(await supabase.from("store_slides").update({ sort: i }).eq("id", ids[i]));
  invalidate("slides");
}
