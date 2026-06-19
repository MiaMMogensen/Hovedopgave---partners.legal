"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/app/firebaseConfig";
import { ref, onValue, update, get, set } from "firebase/database";
import styles from "./page.module.css";
import { usePartners } from "@/app/usePartners";

/* tre arrays der definerer de mulige værdier for partnerstatus, første kundecase og kompetencer. De bruges til at generere dropdown-mulighederne og knapperne i UI'et */
/* de defineres uden for komponenterne for at de kun oprettes én gang og ikke ved hver render, hvilket er mere effektivt */
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

/* lokal usePartner custom react hook der henter én specifik partner fra Firebase. Den opretter en realtidslytter direkte på partners/{id}-noden frem for at hente alle partnere, da det er mere effektivt når man kun har brug for én */
/* Når data modtages spredes alle felter ud med ..snapshot.val() og id'et tilføjes separat, så partner-objektet indeholder både id og alle datafelter. */
/* Hooket returnerer både partner-objektet og en loading-tilstand, så UI'et kan vise en indlæsningsindikator mens data hentes. */
/* Cleanup-funktionen i useEffect (return () => unsubscribe()) sørger for at fjerne lytteren når komponenten unmountes eller id ændres, for at undgå hukommelseslækager og unødvendige opdateringer. */
/* lokal custom hook der tager et id som parameter */
function usePartner(id) {
  /* id kommer fra URL-parametrene via useParams() i AdminPartnerPage-komponenten */
  /* to state-variabler: partner som starter som null og loading som starter som true fordi data ikke er hentet endnu */
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  /* useEffect kører når komponenten mountes eller når id ændrer sig */
  useEffect(() => {
    if (!id) return;
    /* if (!id) return stopper effekten hvis der ikke er noget id, hvilket forhindrer en unædvendig Firebase-forespørgsel */

    const partnerRef = ref(db, `partners/${id}`);
    /* opretter en reference til den specifikke partners node i Firebase ved hjælp af id'et */

    const unsubscribe = onValue(partnerRef, (snapshot) => {
      /* opretter en realtidslytter på den node. Hver gang data ændrer sig i Firebase kaldes callback-funktionen med et snapshot af den aktuelle data */

      if (snapshot.exists()) setPartner({ id, ...snapshot.val() });
      /* hvis snapshot eksisterer (dvs. partneren findes) opdateres partner-state med et objekt der indeholder id og alle datafelter fra snapshot via spread-operator */

      setLoading(false);
    });
    /* uanset om partneren findes eller ej sættes loading til false fordi datahentningen er færdig */

    return () => unsubscribe();
    /* returnerer en cleanup-funktion der kalder unsubscribe for at fjerne lytteren når komponenten unmountes eller id ændrer sig, for at undgå hukommelseslækager og unødvendige opdateringer */
  }, [id]);
  /* useEffect afhænger af id, så den kører igen hvis id ændrer sig */
  return { partner, loading };
}
/* hooket returnerer både partner-objektet og loading-tilstanden, så komponenten der bruger hooket kan håndtere både data og indlæsningsstatus */

/* komponent der viser detaljer for en enkelt partner og giver admin mulighed for at godkende ændringer, opdatere status, første kundecase og kompetencer. Den modtager partner-objektet som prop fra AdminPartnerPage-komponenten. */
function PartnerDetail({ partner }) {
  /* komponenten modtager partner som prop. Det er det partnerobjekt der er hentet via usePartner hooken i AdminPartnerPage-komponenten */
  const { partners } =
    usePartners(); /* bruger usePartners custom hook til at få adgang til listen over alle partnere, som bruges til at tælle hvor mange partnere der er i hver status for at vise i sidebar-statistikken. Det er mere effektivt end at lave separate Firebase-forespørgsler for hver status, da vi allerede har alle partnerdata i hukommelsen */
  const counts = {
    /* beregner antallet af partnere i hver statuskategori ved at filtrere partners-arrayet og tælle hvor mange der har hver status med .length. Resultatet gemmes i counts-objektet, som bruges til at vise statistikkerne i sidebar'en */
    Aktivering: partners.filter((p) => p.status === "Aktivering").length,
    Aktiv: partners.filter((p) => p.status === "Aktiv").length,
    "På pause": partners.filter((p) => p.status === "På pause").length,
    Afsluttet: partners.filter((p) => p.status === "Afsluttet").length,
  };

  /* tre state-variabler til at holde styr på de redigerbare felter i UI'et: status, kundecase og kompetencer. De initialiseres med værdier fra partner-objektet eller med standardværdier hvis de ikke findes */
  const [status, setStatus] = useState(partner.status ?? "Aktivering");
  const [kundecase, setKundecase] = useState(
    partner.forsteKundecase ?? "Ikke startet",
  );
  const [kompetencer, setKompetencer] = useState(partner.kompetencer ?? []);
  const [saved, setSaved] = useState(false);
  /* Der er også en saved-tilstand for at vise en "Gemt" indikator efter opdateringer, og en godkendelse-tilstand for at holde styr på eventuelle afventende ændringer der skal godkendes */

  const [godkendelse, setGodkendelse] = useState(null);
  /* godkendelse-tilstanden holder styr på eventuelle afventende ændringer som partneren har indsendt og som venter på admin-godkendelse. Den initialiseres som null, hvilket betyder at der ikke er nogen afventende ændringer. Hvis der findes en godkendelse i Firebase for denne partner, vil godkendelse-tilstanden blive opdateret med de ændringer der skal godkendes, og UI'et vil vise disse ændringer i en sektion hvor admin kan vælge at godkende eller afvise dem. */

  /* useEffect der opretter en realtidslytter på godkendelser/{partner.id}-noden i Firebase for at holde styr på eventuelle afventende ændringer der skal godkendes. Når data modtages opdateres godkendelse-tilstanden med de ændringer der skal godkendes, eller sættes til null hvis der ikke findes nogen godkendelse. Cleanup-funktionen fjerner lytteren når komponenten unmountes eller partner.id ændrer sig. */
  /* realtidslytter der holder øje med om der er en afventede godkendelsesanmodning for den specifikke partner */
  useEffect(() => {
    const godkendelsesRef = ref(db, `godkendelser/${partner.id}`);
    const unsubscribe = onValue(godkendelsesRef, (snapshot) => {
      if (snapshot.exists()) {
        setGodkendelse(snapshot.val());
      } else {
        setGodkendelse(null);
      }
    });
    return () => unsubscribe();
  }, [partner.id]);

  /* handleGodkend funktion */
  /* en asynkron funktion der kører når admin trykker "Godkend ændringer" knappen. Den opdaterer partnerens data i Firebase baseret på de ændringer der er indsendt og gemt i godkendelse-tilstanden, og fjerner derefter godkendelsen fra Firebase. */
  async function handleGodkend() {
    const opdateringer = {};
    /* et tomt objekt der skal fyldes med de felter og værdier der skal opdateres i partnerens data i Firebase. */
    const æ = godkendelse.ændringer;
    /* en forkortelse for godkendelse.ændringer, som er det objekt der indeholder de ændringer partneren har indsendt og som venter på godkendelse. Ændringerne kan være i form af tilføjede eller fjernede værdier for array-felter som ekspertise, servicetype, branche osv. */

    /* et array med alle de felter der potentielt kan være ændret og som skal tjekkes for opdateringer. For hvert felt i dette array hentes den nuværende værdi fra partner-objektet (eller en tom array hvis det ikke findes), og en opdateret version af dette array laves ved at tilføje eventuelle nye værdier fra godkendelse.ændringer (de der ender på "Tilføjet") og fjerne eventuelle værdier der er markeret som fjernet (de der ender på "Fjernet"). Hvis den opdaterede version af arrayet er forskellig fra den nuværende version, tilføjes det til opdateringer-objektet, som senere vil blive sendt til Firebase for at opdatere partnerens data. */
    /* der loopes over alle felter så man ikke behøver at skrive gentagen kode for hvert enkelt felt, hvilket gør det mere vedligeholdelsesvenligt og mindre fejlbehæftet. */
    const felter = [
      "ekspertise",
      "servicetype",
      "branche",
      "sprog",
      "geografi",
      "ydelser",
      "certificeringer",
    ];

    for (const felt of felter) {
      /* looper over hvert felt i felter-arrayet for at tjekke for ændringer */
      const nuværende = partner[felt] ?? [];
      /* henter den nuværende værdi for dette felt fra partner-objektet, eller bruger en tom array (?? []) som default/fallback hvis det ikke findes */
      let opdateret = [...nuværende];
      /* laver en kopi af den nuværende array med spread-operator, som skal opdateres baseret på ændringerne i godkendelse.ændringer. Jeg kopierer fremfor at modificere den originale array da jeg ikke vil modificere den originale array */

      /* tjekker om der er nogen tilføjede værdier for dette felt i godkendelse.ændringer (de der ender på "Tilføjet"). Hvis der er, spredes de ind i det opdaterede array, men kun hvis de ikke allerede findes i det opdaterede array (for at undgå duplikater). Det gøres ved at filtrere de tilføjede værdier og kun inkludere dem der ikke allerede er i opdateret. */
      if (æ[`${felt}Tilføjet`]) {
        opdateret = [
          ...opdateret,
          ...æ[`${felt}Tilføjet`].filter((v) => !opdateret.includes(v)),
        ];
      }

      /* tjekker om der er fjernede værdier for dette felt i godkendelse.ændringer (de der ender på "Fjernet"). Hvis der er, filtreres de ud af det opdaterede array, så kun de værdier der ikke er markeret som fjernet forbliver i det opdaterede array. Det gøres ved at filtrere det opdaterede array og kun inkludere de værdier der ikke findes i æ[`${felt}Fjernet`]. */
      if (æ[`${felt}Fjernet`]) {
        opdateret = opdateret.filter((v) => !æ[`${felt}Fjernet`].includes(v));
      }

      /* sammenligner den opdaterede version af arrayet med den nuværende version ved at konvertere begge til JSON-strenge og sammenligne dem. Hvis de er forskellige, betyder det at der er sket en ændring, og det opdaterede array tilføjes til opdateringer-objektet under det aktuelle felt. Dette sikrer at kun de felter der rent faktisk har ændringer bliver sendt til Firebase for opdatering, hvilket kan være mere effektivt og reducere risikoen for utilsigtede overskrivninger. */
      /* JSON.stringify bruges her til at sammenligne de to arrays, fordi det er en nem måde at tjekke for dyb lighed mellem arrays på. Hvis de to arrays indeholder de samme værdier i samme rækkefølge, vil deres JSON-strenge være identiske. Hvis der er nogen forskel (f.eks. en tilføjet eller fjernet værdi), vil JSON-strengene være forskellige, og dermed kan vi konkludere at der er sket en ændring der skal opdateres i Firebase. */
      /* JSON.stringify bruges fordi man ikke kan sammenligne arrays direkte med === i JavaScript, da det kun tjekker for reference-lighed og ikke indhold-lighed. To forskellige array-objekter med samme indhold vil ikke være ===, men deres JSON-strenge vil være identiske hvis de indeholder de samme værdier i samme rækkefølge. Derfor er JSON.stringify en praktisk måde at tjekke for lighed mellem arrays på i dette tilfælde. */
      if (JSON.stringify(opdateret) !== JSON.stringify(nuværende)) {
        opdateringer[felt] = opdateret;
      }
    }

    await update(ref(db, `partners/${partner.id}`), opdateringer);
    /* skriver kun de felter der faktisk er ændret til Firebase for at opdatere partnerens data. update overskriver ikke hele partnerobjektet men kun de specifikke felter i opdateringer. Det gør det mere effektivt og reducerer risikoen for utilsigtede overskrivninger af data, da vi ikke sender hele partner-objektet hvis kun nogle få felter er ændret. */
    await set(ref(db, `godkendelser/${partner.id}`), null);
    /* sletter godkendelsen fra Firebase ved at sætte nogen til null, hvilket betyder at der ikke længere er nogen afventende ændringer der skal godkendes for denne partner. Det rydder op i godkendelsesnoden og sikrer at admin ikke ser gamle ændringer som allerede er godkendt. */
    setSaved(true);
    /* sætter saved-tilstanden til true for at vise en "Gemt" indikator i UI'et, så admin får feedback om at ændringerne er blevet gemt. */
    setTimeout(() => setSaved(false), 2000);
    /* efter 2 sekunder sættes saved-tilstanden tilbage til false for at fjerne "Gemt" indikatoren, så UI'et ikke viser det permanent. Det giver en visuel bekræftelse til admin om at ændringerne er blevet gemt, men fjerner indikatoren igen efter et kort stykke tid for at holde UI'et rent og opdateret. */
  }

  /* asynkron funktion der sletter godkendelsesanmodningen uden at ændre partnerprofilen */
  /* det er den samme set til null som i handleGodkend men uden at opdatere partnerens data først, hvilket betyder at eventuelle afventende ændringer blot fjernes og ikke bliver godkendt eller implementeret i partnerens profil. Det er en måde for admin at afvise de indsendte ændringer og rydde op i godkendelsesnoden uden at påvirke den eksisterende partnerdata. */
  async function handleAfvis() {
    await set(ref(db, `godkendelser/${partner.id}`), null);
  }

  /* gemmer kun status-feltet i Firebase via update */
  async function handleSaveStatus() {
    await update(ref(db, `partners/${partner.id}`), {
      status,
    }); /* { status } er et objekt der kun indeholder det felt der skal opdateres, så update-funktionen i Firebase vil kun opdatere status-feltet i partnerens data og ikke røre ved andre felter. Det gør det mere effektivt og reducerer risikoen for utilsigtede overskrivninger af data, da vi ikke sender hele partner-objektet hvis kun status er ændret. */
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  /* samme mønster som handleSaveStatus men gemmer forsteKundecase-feltet i stedet. Det opdaterer kun det specifikke felt i Firebase og giver feedback til admin om at ændringerne er blevet gemt. */
  async function handleSaveKundecase() {
    await update(ref(db, `partners/${partner.id}`), {
      forsteKundecase: kundecase,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  /* gemmer hele kompetencer-arrayet i Firebase, da det er et array og det er nemmest at overskrive hele arrayet når der er ændringer i det. Det opdaterer kompetencer-feltet i partnerens data med den nuværende værdi af kompetencer-tilstanden, som kan være blevet ændret ved at tilføje eller fjerne kompetencer via toggleKompetence-funktionen. Det giver også feedback til admin om at ændringerne er blevet gemt. */
  async function handleSaveKompetencer() {
    await update(ref(db, `partners/${partner.id}`), { kompetencer });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  /* tilføjer eller fjerner en kompetence fra arrayet */
  function toggleKompetence(k) {
    setKompetencer(
      (prev) =>
        prev.includes(k)
          ? prev.filter((v) => v !== k)
          : [
              ...prev,
              k,
            ] /* prev.includes(k) tjekker om kompetencen allerede findes i kompetencer-arrayet. Hvis den gør, betyder det at vi vil fjerne den, så vi filtrerer arrayet for at skabe en ny array uden den kompetence. Hvis den ikke findes, betyder det at vi vil tilføje den, så vi laver en ny array ved at sprede den eksisterende array og tilføje den nye kompetence k til slutningen. */,
    ); /* den ternære operator ? : fungerer som en if-else statement, hvor hvis kompetencen allerede findes i arrayet (prev.includes(k) er true), så returneres den filtrerede array uden den kompetence, ellers returneres en ny array med den nye kompetence tilføjet. Det gør det nemt at toggle en kompetence on og off i arrayet baseret på om den allerede er der eller ej. */
  }

  /* komponenten returnerer et layout med en sidebar og et hovedindhold */
  return (
    <div className={styles.layout}>
      {/* sidebar */}
      <aside className={styles.sidebar}>
        {" "}
        {/* aside er et semantisk HTML-element til sideindhold */}
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
        {/* stat-kortne viser antallet af partnere i hver statuskategori. */}
        <div className={styles.statCards}>
          <div className={`${styles.statCard} ${styles.statCardAktivering}`}>
            {" "}
            {/* Template literals bruges til at kombinere to CSS-klasser - en generel statCard klasse og en specifik farve-klasse */}
            <p className={styles.statLabel}>Aktivering</p>
            <p className={styles.statNum}>{counts.Aktivering}</p>{" "}
            {/* counts.Aktivering henter antallet af partnere i aktivering-statussen der blev beregnet øverst i komponenten*/}
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
      {/* en Next.js Link-komponent der navigerer tilbage til adminoversigten */}
      <main className={styles.main}>
        <Link href="/admin" className={styles.backLink}>
          ← Tilbage til oversigt
        </Link>

        {/* viser partnerens navn som overskrift og oprettelsesdato og VAT-nummer som metadata*/}
        <h1 className={styles.pageTitle}>{partner.virksomhedsnavn}</h1>
        <p className={styles.pageMeta}>
          Partner siden {partner.oprettet ?? "—"} &nbsp;·&nbsp; VAT{" "}
          {/* &nbsp;·&nbsp; er HTML-kode for en non-breaking space og en prik som separator */}
          {partner.vat ?? "—"}{" "}
          {/* ?? "_" viser en streg hvis feltet ikke eksisterer*/}
        </p>

        <div className={styles.grid}>
          {/* venstre kolonne */}
          <div className={styles.left}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Virksomhedsoplysninger</h2>
              {/* et array af objekter med label og value mappes til rækker i UI'et */}
              {[
                { label: "Virksomhedsnavn", value: partner.virksomhedsnavn },
                { label: "VAT-nummer", value: partner.vat },
                { label: "Hjemmeside", value: partner.hjemmeside },
                { label: "LinkedIn", value: partner.linkedin },
              ].map(
                (row) =>
                  /* row.value && betyder at rækken kun renderes hvis værdien eksisterer - tomme felter vises ikke */
                  row.value && (
                    <div key={row.label} className={styles.infoRow}>
                      {" "}
                      {/* key={row.label} er påkrævet af React når man mapper lister så React kan identificere hvert element */}
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
            {/* godkendelse && betyder kortet kun vises hvis der er en afventende godkendelse */}
            {godkendelse && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Afventende ændringer</h2>
                <p className={styles.selectLabelGodkendelse}>
                  Partneren har indsendt følgende ændringer til godkendelse:
                </p>
                {/* Object.entries konverterer godkendelsens ændringer til et array af nøgle-værdi par der mappes til rækker (key, value) */}
                {Object.entries(godkendelse.ændringer).map(([key, value]) => (
                  <div key={key} className={styles.infoRow}>
                    <span className={styles.infoLabel}>
                      {/* nøglenavnet transformeres så fx "TilføjetNavn" bliver "Navn +" og "FjernetNavn" bliver "Navn -" ved hjælp af .includes() og .replace() */}
                      {key.includes("Tilføjet")
                        ? `${key.replace("Tilføjet", "")} +`
                        : key.includes("Fjernet")
                          ? `${key.replace("Fjernet", "")} -`
                          : key}
                    </span>
                    <span className={styles.infoValue}>
                      {Array.isArray(value) ? value.join(", ") : value}{" "}
                      {/* Array.isArray(value) tjekker om værdien er et array - hvis ja joines elementerne med komma, hvis nej vises værdien direkte */}
                    </span>
                  </div>
                ))}
                <div
                  className={styles.actionBtns}
                  style={{ marginTop: "16px" }}
                >
                  <button className={styles.saveBtn} onClick={handleGodkend}>
                    Godkend ændringer
                  </button>
                  <button className={styles.pauseBtn} onClick={handleAfvis}>
                    Afvis
                  </button>
                </div>
              </div>
            )}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Partnerstatus</h2>
              <div className={styles.selectRow}>
                {/* en kontrolleret dropdown -value={status} binder dropdown til state og onChange opdaterer state når admin vælger en ny værdi */}
                <label className={styles.selectLabel}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={styles.select}
                >
                  {/* status_options arrayet fra toppen mappes til option-elementer */}
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
                {/* Kompetenceknapperne genereres ved at mappe over kompetence_options */}
                {kompetence_options.map((k) => (
                  <button
                    key={k}
                    className={`${styles.kompetenceBtn} ${kompetencer.includes(k) ? styles.kompetenceBtnActive : ""}`} /* kompetencer.includes(k) tjekker om kompetencen er valgt og tilføjer en aktiv CSS-klasse hvis ja */
                    onClick={() =>
                      toggleKompetence(k)
                    } /* klik kalder toggleKompetence med kompetencens navn */
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

{
  /* Den eksporterede komponent der er indgangspunktet for siden */
}
{
  /* useParams() henter id'et fra URL'en. Derefter hentes partnerdata via usePartner hooken. */
}
{
  /* Hvis data stadig indlæses vises en loading-besked. Hvis partneren ikke eksisterer vises en fejlbesked */
}
{
  /* først når data er klar renderes PartnerDetail-komponenten med partneren som prop */
}
export default function AdminPartnerPage() {
  const { id } = useParams();
  const { partner, loading } = usePartner(id);

  if (loading) return <div className={styles.loading}>Henter partner...</div>;
  if (!partner)
    return <div className={styles.loading}>Partner ikke fundet.</div>;

  return <PartnerDetail partner={partner} />;
}
