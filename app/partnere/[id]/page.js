"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/app/firebaseConfig";
import { ref, onValue } from "firebase/database";
import styles from "./page.module.css";

/* en lokal custom hook der henter én specifik partner fra Firebase baseret på id */
function usePartner(id) {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const partnerRef = ref(db, `partners/${id}`);
    /* opretter en reference direkte til den specifikke partners node frem for hele partners noden fordi vi kun har brug for en partner */
    const unsubscribe = onValue(partnerRef, (snapshot) => {
      const data = snapshot.val();
      /* hvis partneren eksisterer kombineres id'et med partnerens øvrige felter via spread-operatoren og gemmes i partner state */
      if (data) setPartner({ id, ...data });
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);
  /* lytteren oprettes igen hvis id ændrer sig */

  return { partner, loading };
}

/* et array af objekter der defincerer hvilke felter der vises i oplysnings-kortet i højre kolonne */
/* hvert objekt indeholder nøglen til at slå værdien op i partnerobjektet, en visningslabel og et ikon */
/* ved at definere det som data kan man nemt tilføje eller fjerne felter uden at ændre i JSX-logikken */
const infoItems = [
  {
    key: "ekspertise",
    label: "Ekspertiseområde",
    icon: "/icons/check-circle.svg",
  },
  { key: "servicetype", label: "Servicetype", icon: "/icons/star.svg" },
  { key: "branche", label: "Branche", icon: "/icons/suitcase.svg" },
  { key: "sprog", label: "Sprog", icon: "/icons/speech-bubble.svg" },
  {
    key: "geografi",
    label: "Geografisk dækning",
    icon: "/icons/location-white.svg",
  },
];

export default function PartnerProfilePage() {
  const { id } = useParams();
  /* henter id'et fra URL'en fx /partnere/unitas giver id = "unitas" */
  const { partner, loading } = usePartner(id);
  /* henter via usePartner hook ovenfor */

  if (loading) {
    return <main className={styles.loading}>Henter partnerprofil...</main>;
  }

  if (!partner) {
    return (
      <main className={styles.loading}>
        <p>Partneren blev ikke fundet.</p>
        <Link href="/partnere">← Tilbage til alle partnere</Link>
      </main>
    );
  }

  return (
    <main>
      {/* hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          {/* Logo + navn + beskrivelse */}
          <div className={styles.heroTop}>
            <div className={styles.logoWrap}>
              <Image
                src={partner.logo}
                alt={
                  partner.virksomhedsnavn
                } /* giver logoet en meningsfuld alt-tekst frem for en tom streng */
                width={160}
                height={160}
                className={styles.logo}
              />
            </div>
            <div className={styles.heroText}>
              <h1 className={styles.heroName}>{partner.virksomhedsnavn}</h1>
              <p className={styles.heroDesc}>{partner.beskrivelse}</p>
            </div>
          </div>

          {/* Tags */}
          {/* ekspertise og certificeringer kombineres til ét fladt array via spread og mappes til badges */}
          {/* ?? [] giver fallback hvis felterne ikke eksisterer */}
          <div className={styles.heroTags}>
            {[
              ...(partner.ekspertise ?? []),
              ...(partner.certificeringer ?? []),
            ].map((t) => (
              <span key={t} className={styles.tag}>
                {t}
              </span>
            ))}
          </div>

          <hr className={styles.divider} />

          {/* Meta-info række */}
          {/* partner.geografi?.[0] bruger optional chaining til at tjekke om det første element eksisterer */}
          <div className={styles.metaRow}>
            {partner.geografi?.[0] && (
              <div className={styles.metaItem}>
                <Image
                  src="/icons/location-blue.svg"
                  alt=""
                  width={16}
                  height={16}
                />
                <span>{partner.geografi.join(", ")}</span>
              </div>
            )}
            {partner.sprog && (
              <div className={styles.metaItem}>
                <Image
                  src="/icons/speech-bubble-blue.svg"
                  alt=""
                  width={16}
                  height={16}
                />
                <span>{partner.sprog.join(", ")}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* indhold */}
      <section className={styles.content}>
        <div className={styles.contentInner}>
          <div className={styles.grid}>
            {/* venstre kolonne */}
            <div className={styles.left}>
              {/* Ydelser */}
              {/* ydelser-kortet vises kun hvis partneren har mindst én ydelse - partner.ydelser?.length > 0 */}
              {partner.ydelser?.length > 0 && (
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Ydelser</h2>
                  <div className={styles.ydelsGrid}>
                    {partner.ydelser.map((y) => (
                      <div key={y} className={styles.ydelseItem}>
                        <div className={styles.ydelseIcon}>
                          <Image
                            src="/icons/ydelser.svg"
                            alt=""
                            width={18}
                            height={18}
                          />
                        </div>
                        <span>{y}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificeringer */}
              {partner.certificeringer?.length > 0 && (
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Certificeringer</h2>
                  <div className={styles.ydelsGrid}>
                    {partner.certificeringer.map((c) => (
                      <div key={c} className={styles.ydelseItem}>
                        <div className={styles.ydelseIcon}>
                          <Image
                            src="/icons/certificat.svg"
                            alt=""
                            width={18}
                            height={18}
                          />
                        </div>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Om virksomheden */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Om virksomheden</h2>
                <p className={styles.aboutText}>{partner.beskrivelse}</p>
              </div>
            </div>

            {/* højre kolonne */}
            <div className={styles.right}>
              {/* Kontakt */}
              <div className={styles.card}>
                {/* mailto: linket åbner brugerens email-klient med partnerens email som modtager */}
                {/* partner.kontakt?.email bruger optional chaining da kontakt er et nested objekt */}
                <a
                  href={`mailto:${partner.kontakt?.email}`}
                  className={styles.ctaPrimary}
                >
                  Kontakt partner
                </a>
                <hr className={styles.ctaDivider} />
                {/* hjemmeside og linkedin vises kun hvis felterne eksisterer */}
                {partner.hjemmeside && (
                  <a
                    href={partner.hjemmeside}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.ctaSecondary}
                  >
                    <Image src="/icons/web.svg" alt="" width={16} height={16} />
                    Besøg hjemmeside
                  </a>
                )}
                {partner.linkedin && (
                  <a
                    href={partner.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.ctaOutline}
                  >
                    <Image
                      src="/icons/linkedin.svg"
                      alt=""
                      width={16}
                      height={16}
                    />
                    Se LinkedIn profil
                  </a>
                )}
              </div>

              {/* Oplysninger */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Oplysninger</h2>
                <div className={styles.infoList}>
                  {/* infoItems arrayet mappes til oplysningsrækker. For hvert item hentes værdien fra partnerobjektet via partner[item.key] - computed property syntax der bruger item-key som nøgle */}
                  {/* rækken vises ikke hvis værdien er falsy eller et tomt array */}
                  {/* Array.isArray(value) ? value.join(", ") : value håndterer at værdier kan være både arrays og strenge */}
                  {infoItems.map((item) => {
                    const value = partner[item.key];
                    if (!value || (Array.isArray(value) && value.length === 0))
                      return null;
                    return (
                      <div key={item.key} className={styles.infoItem}>
                        <div className={styles.infoIcon}>
                          <Image
                            src={item.icon}
                            alt=""
                            width={20}
                            height={20}
                          />
                        </div>
                        <div>
                          <p className={styles.infoLabel}>{item.label}</p>
                          <p className={styles.infoValue}>
                            {Array.isArray(value) ? value.join(", ") : value}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
