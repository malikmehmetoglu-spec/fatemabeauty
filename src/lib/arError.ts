/** Turn any thrown error (Supabase/Postgres/network) into a short Arabic message for staff screens.
 *  Messages that are already Arabic (raised by our own SQL functions) pass through unchanged. */
export function arError(e: unknown, prefix = "تعذّر الحفظ"): string {
  const m = e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : String(e);
  if (/[؀-ۿ]/.test(m)) return m;
  if (/only the owner/i.test(m)) return "هذه العملية للمدير العام فقط.";
  if (/row-level security|permission denied|not allowed|forbidden/i.test(m)) return "ليست لديكِ صلاحية لهذه العملية.";
  if (/duplicate key|already exists|unique/i.test(m)) return `${prefix}: يوجد سجل بالاسم نفسه مسبقاً.`;
  if (/foreign key/i.test(m)) return `${prefix}: هذا السجل مرتبط بسجلات أخرى.`;
  if (/not-null|null value/i.test(m)) return `${prefix}: هناك حقل مطلوب فارغ.`;
  if (/check constraint|invalid input|out of range/i.test(m)) return `${prefix}: إحدى القيم غير صحيحة.`;
  if (/failed to fetch|network|timeout|load failed/i.test(m)) return "تعذّر الاتصال بالخادم. تحققي من الإنترنت وأعيدي المحاولة.";
  if (/jwt|session|not authenticated|auth/i.test(m)) return "انتهت الجلسة. سجّلي الدخول من جديد.";
  return `${prefix}. أعيدي المحاولة.`;
}

/** Reason shown after «تعذّر تحميل …:» when a list fails to load. */
export function arLoadError(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (/[؀-ۿ]/.test(m)) return m;
  if (/failed to fetch|network|timeout|load failed/i.test(m)) return "تعذّر الاتصال بالخادم، تحققي من الإنترنت وأعيدي المحاولة.";
  if (/row-level security|permission denied|not allowed/i.test(m)) return "ليست لديكِ صلاحية لعرض هذه البيانات.";
  if (/jwt|not authenticated/i.test(m)) return "انتهت الجلسة، سجّلي الدخول من جديد.";
  return "حدث خطأ غير متوقع، أعيدي تحميل الصفحة.";
}
