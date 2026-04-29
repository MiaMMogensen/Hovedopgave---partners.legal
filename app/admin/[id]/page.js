"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/app/firebaseConfig";
import { ref, onValue, update } from "firebase/database";
import styles from "./page.module.css";
import { usePartners } from "@/app/usePartners";

const status_options = ["Aktivering", "Aktiv", "På pause", "Afsluttet"];
const kundecase_options = [
  "Ikke startet",
  "Identificeret",
  "I gang",
  "Gennemført",
];
const kompetence_options = [
  "Henvisning",
  "Salg",
  "Løsning",
  "Service",
  "Framework",
  "Teknologi",
];

function usePartner(id) {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!id) return;
    const partnerRef = ref(db, `partners/${id}`);
    const unsubscribe = onValue(partnerRef, (snapshot) => {
      if (snapshot.exists()) setPartner({ id, ...snapshot.val() });
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);
  return { partner, loading };
}

function PartnerDetail({ partner }) {
  const { partners } = usePartners();
  const counts = {
    Aktivering: partners.filter((p) => p.status === "Aktivering").length,
    Aktiv: partners.filter((p) => p.status === "Aktiv").length,
    "På pause": partners.filter((p) => p.status === "På pause").length,
    Afsluttet: partners.filter((p) => p.status === "Afsluttet").length,
  };

  const [status, setStatus] = useState(partner.status ?? "Aktivering");
  const [kundecase, setKundecase] = useState(
    partner.forsteKundecase ?? "Ikke startet",
  );
  const [kompetencer, setKompetencer] = useState(partner.kompetencer ?? []);
  const [saved, setSaved] = useState(false);

  async function handleSaveStatus() {
    await update(ref(db, `partners/${partner.id}`), { status });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSaveKundecase() {
    await update(ref(db, `partners/${partner.id}`), {
      forsteKundecase: kundecase,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSaveKompetencer() {
    await update(ref(db, `partners/${partner.id}`), { kompetencer });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleKompetence(k) {
    <Image
      src={partner.logo}
      alt="Logo"
      width={80}
      height={40}
      style={{
        objectFit: "contain",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "6px",
      }}
    />;
    setKompetencer((prev) =>
      prev.includes(k) ? prev.filter((v) => v !== k) : [...prev, k],
    );
  }

  return (
    <div className={styles.layout}>
      {/* sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <p className={styles.sidebarTitle}>Adminpanel</p>
          <p className={styles.sidebarDesc}>Administrer partnere</p>
          <div className={styles.sidebarNav}>
            <div className={`${styles.navItem} ${styles.navItemActive}`}>
              <Image src="/icons/profile.svg" alt="" width={16} height={16} />
              Partnere
            </div>
          </div>
        </div>

        {/* Stats kort */}
        <div className={styles.statCards}>
          <div className={`${styles.statCard} ${styles.statCardAktivering}`}>
            <p className={styles.statLabel}>Aktivering</p>
            <p className={styles.statNum}>{counts.Aktivering}</p>
          </div>
          <div className={`${styles.statCard} ${styles.statCardAktiv}`}>
            <p className={styles.statLabel}>Aktive</p>
            <p className={styles.statNum}>{counts.Aktiv}</p>
          </div>
          <div className={`${styles.statCard} ${styles.statCardPause}`}>
            <p className={styles.statLabel}>På pause</p>
            <p className={styles.statNum}>{counts["På pause"]}</p>
          </div>
          <div className={`${styles.statCard} ${styles.statCardAfsluttet}`}>
            <p className={styles.statLabel}>Afsluttet</p>
            <p className={styles.statNum}>{counts.Afsluttet}</p>
          </div>
        </div>

        <div className={styles.sidebarUser}>
          <div className={styles.userAvatar}>BØ</div>
          <div>
            <p className={styles.userName}>Brian Østberg</p>
            <p className={styles.userOrg}>.legal</p>
          </div>
        </div>
      </aside>

      {/* indhold */}
      <main className={styles.main}>
        <Link href="/admin" className={styles.backLink}>
          ← Tilbage til oversigt
        </Link>

        <h1 className={styles.pageTitle}>{partner.virksomhedsnavn}</h1>
        <p className={styles.pageMeta}>
          Partner siden {partner.oprettet ?? "—"} &nbsp;·&nbsp; VAT{" "}
          {partner.vat ?? "—"}
        </p>

        <div className={styles.grid}>
          {/* venstre kolonne */}
          <div className={styles.left}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Virksomhedsoplysninger</h2>
              {[
                { label: "Virksomhedsnavn", value: partner.virksomhedsnavn },
                { label: "VAT-nummer", value: partner.vat },
                { label: "Hjemmeside", value: partner.hjemmeside },
                { label: "LinkedIn", value: partner.linkedin },
              ].map(
                (row) =>
                  row.value && (
                    <div key={row.label} className={styles.infoRow}>
                      <span className={styles.infoLabel}>{row.label}</span>
                      <span className={styles.infoValue}>{row.value}</span>
                    </div>
                  ),
              )}
              {partner.logo && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Logo</span>
                  <Image
                    src={partner.logo}
                    alt="Logo"
                    width={80}
                    height={80}
                    style={{
                      objectFit: "contain",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "6px",
                    }}
                  />
                </div>
              )}
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Kontaktperson</h2>
              {[
                { label: "Fulde navn", value: partner.kontakt?.navn },
                { label: "Stilling", value: partner.kontakt?.stilling },
                { label: "Arbejdsmail", value: partner.kontakt?.email },
                { label: "Telefon", value: partner.kontakt?.telefon },
              ].map(
                (row) =>
                  row.value && (
                    <div key={row.label} className={styles.infoRow}>
                      <span className={styles.infoLabel}>{row.label}</span>
                      <span className={styles.infoValue}>{row.value}</span>
                    </div>
                  ),
              )}
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Ydelser</h2>
              {[
                {
                  label: "Ekspertiseområde",
                  value: partner.ekspertise?.join(", "),
                },
                {
                  label: "Servicetype",
                  value: partner.servicetype?.join(", "),
                },
                { label: "Branche", value: partner.branche?.join(", ") },
                { label: "Sprog", value: partner.sprog?.join(", ") },
                {
                  label: "Geografisk dækning",
                  value: partner.geografi?.join(", "),
                },
                { label: "Beskrivelse", value: partner.beskrivelse },
                { label: "Ydelser", value: partner.ydelser?.join(", ") },
              ].map(
                (row) =>
                  row.value && (
                    <div key={row.label} className={styles.infoRow}>
                      <span className={styles.infoLabel}>{row.label}</span>
                      <span className={styles.infoValue}>{row.value}</span>
                    </div>
                  ),
              )}
            </div>

            {partner.certificeringer?.length > 0 && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Certificeringer</h2>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Certificeringer</span>
                  <span className={styles.infoValue}>
                    {partner.certificeringer.join(", ")}
                  </span>
                </div>
              </div>
            )}

            {partner.dokumenter?.length > 0 && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Uploadede dokumenter</h2>
                {partner.dokumenter.map((doc, i) => {
                  const navn =
                    typeof doc === "string"
                      ? doc
                      : (doc?.navn ?? doc?.name ?? "Dokument");
                  return (
                    <div key={i} className={styles.docRow}>
                      <div className={styles.docIcon}>
                        <Image
                          src="/icons/document-yellow.svg"
                          alt=""
                          width={18}
                          height={18}
                        />
                      </div>
                      <div className={styles.docInfo}>
                        <p className={styles.docName}>{navn}</p>
                      </div>
                      <span className={styles.downloadBtn}>Download</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* højre kolonne */}
          <div className={styles.right}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Partnerstatus</h2>
              <div className={styles.selectRow}>
                <label className={styles.selectLabel}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={styles.select}
                >
                  {status_options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.actionBtns}>
                <button className={styles.saveBtn} onClick={handleSaveStatus}>
                  {saved ? "Gemt ✓" : "Gem ændringer"}
                </button>
                <button
                  className={styles.pauseBtn}
                  onClick={() => setStatus("På pause")}
                >
                  Sæt på pause
                </button>
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Første kundecase</h2>
              <div className={styles.selectRow}>
                <label className={styles.selectLabel}>Status</label>
                <select
                  value={kundecase}
                  onChange={(e) => setKundecase(e.target.value)}
                  className={styles.select}
                >
                  {kundecase_options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className={`${styles.saveBtn} ${styles.saveBtnFull}`}
                onClick={handleSaveKundecase}
              >
                {saved ? "Gemt ✓" : "Gem ændringer"}
              </button>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Partner kompetencer</h2>
              <div className={styles.kompetencerGrid}>
                {kompetence_options.map((k) => (
                  <button
                    key={k}
                    className={`${styles.kompetenceBtn} ${kompetencer.includes(k) ? styles.kompetenceBtnActive : ""}`}
                    onClick={() => toggleKompetence(k)}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <button
                className={`${styles.saveBtn} ${styles.saveBtnFull}`}
                onClick={handleSaveKompetencer}
              >
                {saved ? "Gemt ✓" : "Gem ændringer"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminPartnerPage() {
  const { id } = useParams();
  const { partner, loading } = usePartner(id);

  if (loading) return <div className={styles.loading}>Henter partner...</div>;
  if (!partner)
    return <div className={styles.loading}>Partner ikke fundet.</div>;

  return <PartnerDetail partner={partner} />;
}
