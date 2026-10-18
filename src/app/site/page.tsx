"use client";

/**
 * Public landing page of the centre — served at https://fatema.beauty/ (see vercel.json).
 * Not part of the design canvas; built with the same identity (mauve, El Messiri, depth).
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { APP_ORIGIN, DOMAIN } from "@/lib/hosts";
import s from "./site.module.css";
import { Icon, Logo } from "@/components/ui";
import { R } from "@/lib/routes";
import { useCatalog } from "@/lib/supabase/catalog";
import { money } from "@/lib/format";
import { C, FATEMA_PHOTO } from "@/lib/tokens";
import { PRODUCTS } from "@/lib/mock/c1";
import { ProductArt } from "@/app/store/c1ui";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

const STEPS = [
  { title: "احجزي من هاتفكِ", text: "اختاري الخدمة واليوم والوقت المناسب، ويصلكِ التأكيد والتذكير على واتساب." },
  { title: "خذي رقم دوركِ", text: "امسحي رمز موعدكِ عند الوصول، وتابعي دوركِ على شاشة الانتظار أو من هاتفكِ." },
  { title: "تابعي رحلة بشرتكِ", text: "صور قبل وبعد، وروتينكِ اليومي، ووصفاتكِ — كلها محفوظة في ملفكِ." },
];

const APP_FEATURES: [string, string][] = [
  ["cal", "الحجز والتعديل"], ["clock", "رقم الدور مباشرة"], ["sparkle", "رحلة بشرتكِ"], ["cam", "استشارة أونلاين"],
  ["drop", "روتينكِ اليومي"], ["gift", "الباقات والنقاط"],
];

export default function SitePage() {
  const { services: SERVICES, packages: PACKAGES } = useCatalog();
  const services = SERVICES.filter((x) => x.key !== "consult");
  const products = PRODUCTS.filter((p) => p.price !== null).slice(0, 3);
  // On fatema.beauty, booking/app links go to app.fatema.beauty and store links to store.fatema.beauty.
  const [hosts, setHosts] = useState({ app: "", store: "" });
  useEffect(() => {
    if (window.location.hostname.endsWith(DOMAIN)) setHosts({ app: APP_ORIGIN, store: `https://store.${DOMAIN}` });
  }, []);
  const app = (path: string) => hosts.app + path;
  const store = (path: string) => (hosts.store && path === R.P_Store ? hosts.store + "/" : hosts.store + path);

  return (
    <div className={s.page} dir="rtl">
      <div className={s.halo1} aria-hidden />
      <div className={s.halo2} aria-hidden />

      <div className={s.wrap}>
        <header className={s.nav}>
          <Logo height={58} />
          <nav className={s.navLinks} aria-label="أقسام الصفحة">
            <a className={s.navLink} href="#services">الخدمات</a>
            <a className={s.navLink} href="#how">كيف نعمل</a>
            <Link className={s.navLink} href={store(R.P_Store)}>المتجر</Link>
            <Link className={s.navCta} href={app(R.Login)}>
              <Icon name="cal" color="#FFFFFF" size={18} stroke={1.9} />احجزي
            </Link>
          </nav>
        </header>

        <section className={s.hero}>
          <div>
            <span className={s.eyebrow}>مركز العناية بالبشرة</span>
            <h1 className={s.h1}><em>عناية</em> تليق ببشرتكِ<br />وخبرة تمنحكِ <em>إشراقة تدوم</em></h1>
            <p className={s.lead}>
              تنظيف عميق، هيدرافيشل، تقشير وليزر — بإشراف الأخصائية فاطمة طيبة.
              احجزي جلستكِ في دقيقة، وتابعي دوركِ ورحلة بشرتكِ من هاتفكِ.
            </p>
            <div className={s.ctaRow}>
              <Link className={s.btnPrimary} href={app(R.Login)}>
                <Icon name="cal" color="#FFFFFF" size={19} stroke={1.9} />احجزي جلستكِ
              </Link>
              <Link className={s.btnGhost} href={store(R.P_Store)}>
                <Icon name="bag" color={C.accent} size={19} stroke={1.9} />تسوّقي منتجاتكِ
              </Link>
            </div>
            <div className={s.trust}>
              <span><Icon name="shield" size={18} />بياناتكِ الصحية محمية</span>
              <span><Icon name="msg" size={18} />تذكير على واتساب</span>
              <span><Icon name="clock" size={18} />لا انتظار طويل</span>
            </div>
            <InstallPrompt style={{ marginTop: 26, maxWidth: 520 }} />
          </div>

          <div className={s.photoCard}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={FATEMA_PHOTO} alt="الأخصائية فاطمة طيبة" />
            <span className={s.floatTag}><Icon name="sparkle" color={C.accent} size={17} />تنظيف وعناية فقط</span>
            <div className={s.glass}>
              <div>
                <div className={s.glassName}>فاطمة طيبة</div>
                <div className={s.glassRole}>أخصائية عناية بالبشرة</div>
              </div>
              <Link className={s.navCta} href={app(R.Login)} aria-label="احجزي مع فاطمة">
                <Icon name="arrow" color="#FFFFFF" size={17} stroke={2} />
              </Link>
            </div>
          </div>
        </section>

        <section id="services" className={s.section}>
          <div className={s.sectionHead}>
            <div>
              <h2 className={s.h2}>لنجد جلستكِ <em>المثالية</em></h2>
              <p className={s.sub}>أسعار واضحة لكل جلسة، والاستشارة في المركز مجانية لتختاري ما يناسب بشرتكِ.</p>
            </div>
          </div>

          <div className={s.services}>
            {services.map((x) => {
              const dark = x.key === "laser";
              return (
                <Link key={x.key} href={app(R.Login)} className={`${s.svc} ${dark ? s.svcDark : ""}`}>
                  <span style={{ width: 52, height: 52, borderRadius: 26, display: "flex", alignItems: "center", justifyContent: "center",
                    background: dark ? "rgba(255,255,255,0.16)" : "linear-gradient(145deg, #F6EEF9, #E6D3EE)" }}>
                    <Icon name={{ clean: "drop", hydra: "sparkle", peel: "layers", laser: "sun", consult: "msg" }[x.key]} color={dark ? "#FFFFFF" : C.accentMid} size={24} />
                  </span>
                  <div className={s.svcName}>{x.name}</div>
                  <div className={s.svcDesc}>{x.desc} · {x.minutes} دقيقة</div>
                  <div className={s.svcFoot}>
                    <div>
                      <div className={s.price}>{x.from ? "من " : ""}{money(x.price)}</div>
                      <div className={s.per}>للجلسة</div>
                    </div>
                    <span className={s.arrow}><Icon name="arrow" color={C.accent} size={16} stroke={2} /></span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className={s.packBand}>
            <span style={{ width: 52, height: 52, borderRadius: 26, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 12px rgba(123,70,135,0.30)" }}>
              <Icon name="gift" color="#FFFFFF" size={24} />
            </span>
            <div>
              <div className={s.packTitle}>الباقات: 6 جلسات بسعر 5</div>
              <div className={s.per} style={{ fontSize: 14 }}>الجلسة السادسة هدية منا</div>
            </div>
            <div className={s.packList}>
              {PACKAGES.map((p) => (
                <span key={p.service} className={s.packChip}>{p.name.replace(" للبشرة", "")} <b>{money(p.price)}</b></span>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className={s.section}>
          <div className={s.sectionHead}>
            <h2 className={s.h2}>كيف <em>نعمل</em></h2>
          </div>
          <div className={s.steps}>
            {STEPS.map((st, i) => (
              <div key={st.title} className={s.step}>
                <span className={s.stepNo}>0{i + 1}</span>
                <div className={s.stepTitle}>{st.title}</div>
                <div className={s.stepText}>{st.text}</div>
              </div>
            ))}
          </div>
        </section>

        <section className={s.section}>
          <div className={s.split}>
            <div className={s.appCard}>
              <div className={s.appGlow} aria-hidden />
              <Logo light height={62} style={{ position: "relative" }} />
              <h2 className={s.h2} style={{ color: "#FFFFFF", position: "relative" }}>كل شيء من هاتفكِ</h2>
              <ul className={s.appList}>
                {APP_FEATURES.map(([icon, label]) => (
                  <li key={label}><span className={s.dot}><Icon name={icon} color="#FFFFFF" size={17} /></span>{label}</li>
                ))}
              </ul>
              <div className={s.appCtas}>
                <Link className={s.btnLight} href={app(R.Login)}>افتحي التطبيق<Icon name="fwd" color={C.accent} size={18} stroke={2} /></Link>
                <span className={s.soon}><Icon name="download" color="#F3EAF6" size={17} />قريباً على <span className="latin" dir="ltr">App Store</span> و<span className="latin" dir="ltr">Google Play</span></span>
              </div>
            </div>

            <div className={s.storeCard}>
              <div>
                <h2 className={s.h2}>متجر <em>فاطمة بيوتي</em></h2>
                <p className={s.sub}>منتجات تختارها الأخصائية لروتينكِ اليومي، تستلمينها في زيارتكِ أو تصلكِ إلى البيت.</p>
              </div>
              <div className={s.products}>
                {products.map((p) => (
                  <Link key={p.key} href={store(R.P_Store)} className={s.product}>
                    <ProductArt p={p} width={64} />
                    <div className={s.productName}>{p.name}</div>
                    <div className={s.productPrice}>{money(p.price ?? 0)}</div>
                  </Link>
                ))}
              </div>
              <Link className={s.btnGhost} href={store(R.P_Store)} style={{ alignSelf: "flex-start" }}>
                <Icon name="bag" color={C.accent} size={19} stroke={1.9} />ادخلي المتجر
              </Link>
            </div>
          </div>
        </section>

        <footer className={s.footer}>
          <Logo height={52} />
          <nav className={s.footLinks} aria-label="روابط">
            <Link href={app(R.Login)}>الحجز</Link>
            <Link href={app(R.P_Services)}>الخدمات والأسعار</Link>
            <Link href={store(R.P_Store)}>المتجر</Link>
            <Link href={app(R.P_Help)}>المساعدة</Link>
          </nav>
          <span className={s.copy}>© {new Date().getFullYear()} Fatema Beauty — Skin Care Center</span>
        </footer>
      </div>
    </div>
  );
}
