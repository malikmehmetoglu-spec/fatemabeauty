"use client";

import { supabase } from "./client";

const KEY = "fb-login-phone";

/** "0933 123 456", "933123456", "+963933123456" → "+963933123456" (Syrian mobiles). null if invalid. */
export function normalizePhone(input: string) {
  let d = input.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("963")) d = d.slice(3);
  if (d.startsWith("0")) d = d.slice(1);
  return /^9\d{8}$/.test(d) ? `+963${d}` : null;
}

export function maskPhone(p: string) {
  return `${p.slice(0, 4)} ${p.slice(4, 6)}• ••• ${p.slice(-3)}`;
}

export const savedPhone = () => { try { return sessionStorage.getItem(KEY) || ""; } catch { return ""; } };

/**
 * Sends the 6-digit code by SMS. Supabase Auth creates the code and hands it to the «send-sms» hook,
 * which delivers it from the clinic's Android gateway phone. Returns an Arabic error message or null.
 */
export async function sendCode(phone: string): Promise<string | null> {
  try { sessionStorage.setItem(KEY, phone); } catch {}
  const { error } = await supabase.auth.signInWithOtp({ phone, options: { channel: "sms" } });
  if (!error) return null;
  if (/provider|disabled|not enabled|unsupported/i.test(error.message)) return "خدمة إرسال الرموز غير مفعّلة بعد. تواصلي مع المركز.";
  if (/rate|too many|seconds/i.test(error.message)) return "طلبتِ رمزاً قبل قليل. انتظري دقيقة ثم أعيدي المحاولة.";
  return "تعذّر إرسال الرمز. تأكدي من الرقم وحاولي مرة أخرى.";
}

/** Verifies the code, then makes sure the patient record exists. */
export async function verifyCode(phone: string, token: string) {
  const { error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
  if (error) return { error: "الرمز غير صحيح أو انتهت صلاحيته.", patient: null };
  const { data: patient } = await supabase.rpc("ensure_patient");
  return { error: null, patient };
}
