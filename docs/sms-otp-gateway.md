# رموز التحقق عبر هاتف أندرويد (بوابة SMS)

Twilio لا ترسل للأرقام السورية منذ أيلول 2025، لذلك تُرسل رموز التحقق من شريحة سيريتل/MTN في هاتف أندرويد مخصص.

## كيف يعمل
1. المراجعة تكتب رقمها ← `supabase.auth.signInWithOtp({ phone, channel: "sms" })`.
2. Supabase Auth يولّد الرمز ويستدعي الـ hook: Edge Function **`send-sms`**.
3. الدالة ترسل الرمز إلى سحابة SMS Gate (`api.sms-gate.app`)، التي توقظ الهاتف بإشعار فوري.
4. الهاتف يرسل SMS عادية من الشريحة. والتحقق من الرمز يتم داخل Supabase Auth كما كان.

## الإعداد (مرة واحدة)
**الهاتف**
- ثبّت «SMS Gateway for Android» من https://sms-gate.app (ملف APK) وامنحه إذن الرسائل.
- فعّل وضع **Cloud server**، وانسخ اسم المستخدم وكلمة المرور.
- استثنِه من توفير البطارية، وأبقِ الهاتف على الشاحن والإنترنت.

**Supabase (المشروع btcyrzvaexmgffeamlmg)**
- Edge Functions → Secrets: `SMSGATE_USER`, `SMSGATE_PASS`.
- Authentication → Sign In / Providers → **Phone**: مفعّل (أي مزوّد SMS؛ الـ hook يتجاوزه).
- Authentication → Hooks → **Send SMS hook** → HTTPS → رابط الدالة
  `https://btcyrzvaexmgffeamlmg.supabase.co/functions/v1/send-sms`، ثم انسخ السر الناتج إلى Secret باسم `SEND_SMS_HOOK_SECRET`.
- الدالة تُنشر مع `verify_jwt = false` (التوقيع يُتحقق منه داخلها).
