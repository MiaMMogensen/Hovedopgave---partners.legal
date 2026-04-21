"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/app/firebaseConfig";
import { ref, onValue } from "firebase/database";
import styles from "./page.module.css";

function usePartner(id) {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const partnerRef = ref(db, `partners/${id}`);
    const unsubscribe = onValue(partnerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setPartner({ id, ...data });
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  return { partner, loading };
}

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
  const { partner, loading } = usePartner(id);

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
                alt={partner.virksomhedsnavn}
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
                <span>{partner.sprog.join(" og ")}</span>
              </div>
            )}
            {partner.kontakt?.email && (
              <div className={styles.metaItem}>
                <Image src="/icons/email.svg" alt="" width={16} height={16} />
                <span>{partner.kontakt.email}</span>
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
                <a
                  href={`mailto:${partner.kontakt?.email}`}
                  className={styles.ctaPrimary}
                >
                  Kontakt partner
                </a>
                <hr className={styles.ctaDivider} />
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
