import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

const stats = [
  { tal: "7+", tekst: "Aktive partnere" },
  { tal: "5 hverdage", tekst: "Fra oprettelse til live profil" },
  { tal: "100%", tekst: "Verificerede partnere" },
];

const fordele = [
  {
    icon: "/icons/fordele1.svg",
    title: "Udvid din rækkevidde",
    description:
      "Øg din synlighed overfor .legals kunder, og nå kunder, du ellers ikke ville finde.",
  },
  {
    icon: "/icons/fordele2.svg",
    title: "Kvalificerede leads",
    description:
      "Bliv matchet med virksomheder, der aktivt søger compliance-partnere med din specifikke ekspertise.",
  },
  {
    icon: "/icons/fordele3.svg",
    title: "Professionel profil",
    description:
      "Præsenter dine ydelser og ekspertise på en professionelle partnerprofil. Du styrer selv indholdet og kan opdatere løbende.",
  },
  {
    icon: "/icons/fordele4.svg",
    title: "Nem onboarding",
    description:
      "Kom hurtigt i gang med vores strukturerede onboarding. Det taget 10 minutter og vi vender tilbage inden for 5 hverdage.",
  },
];

const proces_trin = [
  {
    num: "1",
    title: "Book et møde",
    description:
      "Kontakt os og book et uforpligtende møde hvor vi sammen afklarer om et partnerskab giver mening for din virksomhed.",
  },
  {
    num: "2",
    title: "Indgå aftale",
    description:
      "Når vi er enige om et samarbejde indgår vi en partneraftale og sender dig adgang til vores onboarding.",
  },
  {
    num: "3",
    title: "Opret din profil",
    description:
      "Udfyld dine virksomhedsoplysninger og ekspertiseområder så din profil kan gå live og blive synlig for .legals kunder.",
  },
];

export default function BlivPartnerPage() {
  return (
    <main>
      {/* hero */}
      <section className={styles.hero}>
        <Image
          src="/img/hero-circles.svg"
          alt=""
          fill
          className={styles.ctaBg}
        />
        <div className={styles.heroInner}>
          <p className={styles.catLabel}>Partnerprogram</p>
          <h1 className={styles.heroTitle}>
            Vækst din compliance-forretning med .legal
          </h1>
          <p className={styles.heroDesc}>
            Bliv en del af .legals partnernetværk og få adgang til kunder, der
            aktivt søger compliance-eksperter som dig.
          </p>
          <Link href="/book-mode" className={styles.heroCta}>
            Book et møde
          </Link>
          <div className={styles.statsGrid}>
            {stats.map((s) => (
              <div key={s.tal} className={styles.statItem}>
                <span className={styles.statTal}>{s.tal}</span>
                <span className={styles.statTekst}>{s.tekst}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* fordele */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <p className={styles.catLabel}>Fordele</p>
          <h2 className={styles.sectionTitle}>Hvorfor blive .legal-partner?</h2>
          <p className={styles.sectionDesc}>
            Som .legal-partner får du adgang til en række fordele der hjælper
            dig med at vækste din forretning.
          </p>
          <div className={styles.fordeleGrid}>
            {fordele.map((f) => (
              <div key={f.title} className={styles.fordeleCard}>
                <div className={styles.fordeleIcon}>
                  <Image src={f.icon} alt="" width={28} height={28} />
                </div>
                <div>
                  <h3 className={styles.fordeleTitle}>{f.title}</h3>
                  <p className={styles.fordeleDesc}>{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* proces */}
      <section className={`${styles.section} ${styles.bgLight}`}>
        <div className={styles.inner}>
          <p className={styles.catLabel}>Processen</p>
          <h2 className={styles.sectionTitle}>Sådan kommer du i gang</h2>
          <p className={styles.sectionDesc}>
            Fra første kontakt til aktiv partner på tre enkle trin.
          </p>
          <div className={styles.procesWrap}>
            {proces_trin.map((trin, index) => (
              <div key={trin.num} className={styles.procesItem}>
                {/* Streg og cirkel */}
                <div className={styles.procesTop}>
                  <div className={styles.procesLine} data-first={index === 0} />
                  <div className={styles.procesCircle}>{trin.num}</div>
                  <div
                    className={styles.procesLine}
                    data-last={index === proces_trin.length - 1}
                  />
                </div>
                {/* Tekst under */}
                <div className={styles.procesTekst}>
                  <h3 className={styles.procesTitel}>{trin.title}</h3>
                  <p className={styles.procesDesc}>{trin.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* cta sektion */}
      <section className={styles.ctaSection}>
        <Image src="/img/bg-vector1.svg" alt="" fill className={styles.ctaBg} />
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Klar til at vokse din forretning?</h2>
          <p className={styles.ctaDesc}>
            Book et uforpligtende møde med vores team og hør hvordan et
            partnerskab med .legal kan gavne din forretning.
          </p>
          <Link href="/book-mode" className={styles.ctaBtn}>
            Book et møde
          </Link>
          <p className={styles.ctaSubtext}>Gratis at booke — ingen binding</p>
        </div>
      </section>
    </main>
  );
}
