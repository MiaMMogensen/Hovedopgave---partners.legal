"use client";

import { usePartners } from "./usePartners"; /* custom hook der henter partnerdata fra Firebase */

import Link from "next/link";
import Image from "next/image";
import HeroSearch from "@/components/HeroSearch";
import styles from "./page.module.css";

const popularTags = ["GDPR", "Datasikkerhed", "Compliance", "DPO", "ISO 27001"];

/* data til "Partneruniverset" sektionens tre feature kort */
const partneruniverseFeatures = [
  {
    icon: "/icons/verified.svg",
    title: "Verificerede eksperter",
    description:
      "Alle partnere er grundigt kontrollerede og certificerede fagfolk med dokumenterede resultater inden for compliance og juridiske services.",
  },
  {
    icon: "/icons/search.svg",
    title: "Nem søgning",
    description:
      "Find den rigtige partner hurtigt med vores filtrering efter ekspertise, branche, placering og certificeringer.",
  },
  {
    icon: "/icons/flow.svg",
    title: "Strømlinet proces",
    description:
      "Få direkte kontakt til partnere, gennemgå deres services, og kom i gang med din compliance-rejse med tillid.",
  },
];

/* data til "Sådan finder du en partner" sektionens tre trin */
const HowToSteps = [
  {
    icon: "/icons/search.svg",
    title: "Søg og filtrer",
    description:
      "Brug søgefeltet eller filtrer på ekspertise, servicetype og certificeringer for at finde relevante partnere der matcher din virksomheds behov.",
  },
  {
    icon: "/icons/profile.svg",
    title: "Gennemgå profiler",
    description:
      "Læs om partnerens ydelser, erfaring og certificeringer og vurder om de passer til din situation og branche.",
  },
  {
    icon: "/icons/contact.svg",
    title: "Tag kontakt",
    description:
      "Kontakt partneren direkte via profilen og kom i gang med dit compliance-arbejde med en verificeret ekspert.",
  },
];

export default function HomePage() {
  /* henter alle partnere fra Firebase via usePartners hooken */
  /* partners = array af partnerobjekter, loading = boolean der er true mens data hentes */
  const { partners, loading } = usePartners();

  /* filterer kun de partnere der har featured = true i Firebase. Det er disse der vises i "Udvalgte partnere" sektionen */
  const featuredPartners = partners.filter((p) => p.featured);

  return (
    <main>
      {/* hero sektion */}
      <section className={styles.hero}>
        <Image
          src="/img/hero-circles.svg"
          alt=""
          fill
          className={styles.partnerProgBg}
        />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Find den rette compliance-partner
          </h1>
          <p className={styles.heroDesc}>
            .legals partnerunivers samler de bedste compliance-eksperter på ét
            sted. <br />
            Søg og find en partner der kan hjælpe din virksomhed med GDPR,
            kontraktstyring og meget mere.
          </p>

          <HeroSearch />

          <div className={styles.tagsRow}>
            <span className={styles.tagsLabel}>Populært:</span>
            {popularTags.map((tag) => (
              <Link
                key={tag}
                href={`/partnere?q=${encodeURIComponent(tag)}`}
                className={styles.tag}
              >
                {tag}
              </Link>
            ))}
          </div>

          <Link href="/partnere" className={styles.heroCta}>
            Se alle partnere
          </Link>
        </div>
      </section>

      {/* partnerprogram sektion */}
      <section className={styles.partnerProg}>
        <Image
          src="/img/bg-vector1.svg"
          alt=""
          fill
          className={styles.partnerProgBg}
        />
        <div className={styles.inner}>
          <p className={styles.catLabel}>Partnerprogram</p>
          <h2 className={styles.sectionTitle}>
            Er du compliance-konsulent? <br />
            Bliv partner hos .legal
          </h2>
          <p className={styles.sectionDesc}>
            Bliv en del af .legals partnernetværk og få synlighed overfor
            virksomheder der aktivt leder efter netop din ekspertise.
          </p>
          <div className={styles.stepsGrid}>
            {[
              {
                num: "1",
                title: "Book et møde",
              },
              {
                num: "2",
                title: "Indgå aftale",
              },
              {
                num: "3",
                title: "Opret din profil",
              },
            ].map((step) => (
              <div key={step.num} className={styles.stepCard}>
                <p className={styles.stepNum}>{step.num}</p>
                <h3 className={styles.stepTitle}>{step.title}</h3>
              </div>
            ))}
          </div>
          <Link href="/bliv-partner" className={styles.progCta}>
            Læs mere om partnerprogrammet
          </Link>
        </div>
      </section>

      {/* partneruniverset sektion */}
      <section className={`${styles.section} ${styles.bgLight}`}>
        <div className={styles.innerMiddle}>
          <p className={styles.catLabel}>Partneruniverset</p>
          <h2 className={styles.sectionTitle}>
            Derfor vælger virksomheder partners.legal
          </h2>
          <p className={styles.sectionDesc}>
            Alt hvad du behøver for at finde den rette compliance-ekspert.
          </p>
          <div className={styles.threeGrid}>
            {partneruniverseFeatures.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <Image src={f.icon} alt="" width={35} height={39} />
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* udvalgte partnere sektion */}
      <section className={styles.partnersSection}>
        <Image
          src="/img/bg-vector-2.svg"
          alt=""
          fill
          className={styles.partnerProgBg}
        />
        <div className={styles.inner}>
          <div className={styles.partnersHeader}>
            <div>
              <p className={styles.catLabel}>Udvalgte partnere</p>
              <h2 className={styles.sectionTitle}>
                Mød nogle af vores partnere
              </h2>
              <p className={styles.sectionDesc}>
                Betroede compliance-eksperter klar til at hjælpe din virksomhed.
              </p>
            </div>
            <Link href="/partnere" className={styles.seeAllLink}>
              Se alle partnere →
            </Link>
          </div>

          {loading ? (
            <p>Henter partnere...</p>
          ) : (
            <div className={styles.partnersGrid}>
              {featuredPartners.map((p) => (
                <div key={p.id} className={styles.partnerCard}>
                  <div className={styles.cardTop}>
                    <Image
                      src={p.logo}
                      alt={p.virksomhedsnavn}
                      width={100}
                      height={100}
                      className={styles.partnerLogo}
                    />
                    <div>
                      <p className={styles.partnerName}>{p.virksomhedsnavn}</p>
                      <p className={styles.partnerLoc}>
                        <Image
                          src="/icons/location.svg"
                          alt=""
                          width={14}
                          height={14}
                        />
                        {p.geografi?.[0]}, Danmark
                      </p>
                    </div>
                  </div>
                  <div className={styles.partnerTags}>
                    {p.ekspertise?.map((t) => (
                      <span key={t} className={styles.ptag}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className={styles.partnerDesc}>{p.beskrivelse}</p>
                  <Link
                    href={`/partnere/${p.id}`}
                    className={styles.partnerCta}
                  >
                    Se profil
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* sådan finder du en partner sektion */}
      <section className={`${styles.section} ${styles.bgLight}`}>
        <div className={styles.inner}>
          <p className={styles.catLabelHowTo}>Partneruniverset</p>
          <h2 className={styles.sectionTitle}>
            Sådan finder du den rette partner
          </h2>
          <p className={styles.sectionDesc}>
            Tre trin til at finde den rette compliance-ekspert.
          </p>
          <div className={styles.howToGrid}>
            {HowToSteps.map((s) => (
              <div key={s.title} className={styles.howStep}>
                <div className={styles.howIcon}>
                  <Image src={s.icon} alt="" width={30} height={30} />
                </div>
                <div>
                  <h3 className={styles.howTitle}>{s.title}</h3>
                  <p className={styles.howDesc}>{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
