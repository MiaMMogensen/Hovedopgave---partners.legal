"use client"; /* fortæller Next.js at denne fil er en klientkomponent. Den kører i browseren og ikke på serveren. Det er nødvendigt fordi jeg bruger React hooks som useState og useEffect der kun virker i browseren */

import {
  useState,
  useMemo,
  useEffect,
} from "react"; /* importerer tre hooks fra React. useState til at gemme og opdatere data i komponenten. useMemo til at cache beregnede værdier så de ikke genberegnes unødvendigt. useEffect til at køre kode som sideeffekter - i dette tilfølde at oprette en firebase lytter */
/* Next.js komponenter */
import Link from "next/link"; /* Link bruges til navigation uden at siden genindlæses */
import Image from "next/image"; /* Image optimerer billeder automatisk for bedre performance */
import { usePartners } from "@/app/usePartners"; /* den globale custom hook der henter alle partnere */
import styles from "./page.module.css";
import { db } from "@/app/firebaseConfig"; /* importerer den konfigurerede Firebase database instans */
import {
  ref,
  onValue,
} from "firebase/database"; /* Firebase-funktioner til at oprette referencer og lytte til data i realtid */

/* definerer de mulige filterknapper øverst i oversigten og deres rækkefølge */
const status_filters = [
  "Alle",
  "Aktivering",
  "Aktiv",
  "På pause",
  "Afsluttet",
  "Afventer godkendelse",
];

/* to objekter der mapper status- og kundecaseværdier til CSS-klasser */
/* Bruges til at give badges den rigtige farve baseret på partnerens status og kundecase-fremdrift */
const status_colors = {
  Aktivering: styles.statusAktivering,
  Aktiv: styles.statusAktiv,
  "På pause": styles.statusPause,
  Afsluttet: styles.statusAfsluttet,
};

const kundecase_colors = {
  "Ikke startet": styles.kundecaseIkke,
  Identificeret: styles.kundecaseIdentificeret,
  "I gang": styles.kundecaseIgang,
  Gennemført: styles.kundecaseGennemfort,
};

export default function AdminPage() {
  const { partners, loading } = usePartners();
  /* henter alle partnere via den globale usePartners hook der lytter til Firebase i realtid og destrukturerer de to værdier den returnerer til et array af alle partnere og en loading-tilstand */
  const [godkendelser, setGodkendelser] = useState({});
  /* state til godkendelsesanmodninger initialiseret som et tomt objekt. Det vil blive opdateret i realtid med data fra Firebase, hvor hver nøgle er en partner-id og værdien er godkendelsesanmodningens data (hvis der er en afventende anmodning for den partner) */

  /* henter alle godkendelsesanmodninger fra Firebase i realtid */
  /* snapshot.val() ?? {} giver et tomt objekt som fallback hvis noden ikke eksisterer, så man undgår fejl ved at prøve at tilgå egenskaber på undefined */
  /* ref(db, "godkendelser") opretter en reference til "godkendelser" noden i Firebase databasen, og onValue lytter til ændringer på den reference og opdaterer godkendelser state hver gang der kommer nye data */
  useEffect(() => {
    const godkendelsesRef = ref(db, "godkendelser");
    const unsubscribe = onValue(godkendelsesRef, (snapshot) => {
      setGodkendelser(snapshot.val() ?? {});
    });
    return () =>
      unsubscribe(); /* cleanup funktion der fjerner lytteren når komponenten unmountes og forhindrer memory leaks */
  }, []); /* det tomme dependency array [] sikrer at denne effekt kun kører én gang ved komponentens første render */

  const [activeFilter, setActiveFilter] = useState("Alle");
  const [search, setSearch] = useState("");

  /* beregner antallet af partnere i hver statuskategori og antallet af godkendelser, som bruges til at vise tal på filterknapperne i sidebar */
  const counts = useMemo(() => {
    /* useMemo sikrer at beregningen kun køres igen når partners eller godkendelser ændrer sig ([partners, godkendelser]), hvilket forbedrer performance ved at undgå unødvendige beregninger ved hver render */
    return {
      Aktivering: partners.filter((p) => p.status === "Aktivering").length,
      Aktiv: partners.filter((p) => p.status === "Aktiv").length,
      "På pause": partners.filter((p) => p.status === "På pause").length,
      Afsluttet: partners.filter((p) => p.status === "Afsluttet").length,
      Godkendelser: Object.keys(godkendelser).length,
      /* Object.keys(godkendelser).length tæller antallet af nøgler i godkendelser-objektet, hvilket svarer til antallet af godkendelsesanmodninger */
    };
  }, [partners, godkendelser]);

  /* filtrerer partnerlisten baseret på det aktive filter og søgeteksten */
  const filtered = useMemo(() => {
    return partners.filter((p) => {
      const matchesFilter =
        /* matchesFilter håndterer tre tilfælde */
        activeFilter === "Alle" ||
        /* "Alle" viser alle partnere uanset status */
        p.status === activeFilter ||
        /* hvis activeFilter er en specifik status (f.eks. "Aktiv"), matchesFilter er sandt for partnere der har den status */
        (activeFilter === "Afventer godkendelse" && godkendelser[p.id]);
      /* "Afventer godkendelse" tjekker om partnerens id eksisterer som nøgle i godkendelser-objektet, hvilket indikerer at der er en afventende godkendelsesanmodning for den partner */
      const matchesSearch =
        /* matchesSearch matcher virksomhedsnavn og kontakt-email mod søgeteksten, og er sandt hvis søgeteksten er tom eller hvis nogen af de to felter indeholder søgeteksten (case-insensitive) */
        !search ||
        p.virksomhedsnavn?.toLowerCase().includes(search.toLowerCase()) ||
        p.kontakt?.email?.toLowerCase().includes(search.toLowerCase());
      return (
        matchesFilter && matchesSearch
      ); /* for at en partner skal inkluderes i den filtrerede liste, skal den både matche det aktive filter og søgeteksten */
    });
  }, [partners, activeFilter, search, godkendelser]);
  /* denne useMemo kører igen når nogen af dependencies ændrer sig, og returnerer den filtrerede liste af partnere baseret på de valgte kriterier */

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
          {/* stat-kortet for godkendelser vises kun når de faktisk er afventende godkendelser. counts.Godkendelser > 0 %% sørger for det */}
          {counts.Godkendelser > 0 && (
            <div className={`${styles.statCard} ${styles.statCardGodkendelse}`}>
              <p className={styles.statLabel}>Afventer godkendelse</p>
              <p className={styles.statNum}>{counts.Godkendelser}</p>
            </div>
          )}
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
        <div className={styles.mainHeader}>
          <h1 className={styles.pageTitle}>Partneroversigt</h1>
          <p className={styles.pageDesc}>Administrer dine partnere.</p>
        </div>

        {/* Filtre + søgning */}
        <div className={styles.filterBar}>
          <div className={styles.filterBtns}>
            {status_filters.map((f) => (
              <button
                key={f}
                className={`${styles.filterBtn} ${activeFilter === f ? styles.filterBtnActive : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className={styles.searchWrap}>
            <Image src="/icons/search.svg" alt="" width={16} height={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Søg partner..."
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Tabel */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHead}>
                <th>Partner</th>
                <th>Kompetencer</th>
                <th>Partnerstatus</th>
                <th>Første kundecase</th>
                <th>Oprettet</th>
                <th>Handling</th>
              </tr>
            </thead>
            <tbody>
              {/* tre mulige tilstande - loading viser en besked, ingen resultater viser en tom-besked, og ellers mappes de filtrerede partnere til tabelrækker. colSpan={6} sørger for at celleækken strækker sig over alle kolonner */}
              {loading ? (
                <tr>
                  <td colSpan={6} className={styles.loading}>
                    Henter partnere...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.loading}>
                    Ingen partnere fundet
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className={styles.tableRow}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <p className={styles.partnerName}>
                          {p.virksomhedsnavn}
                        </p>
                        {/* viser et orange "Afventer" badge ved siden af partnernavnet hvis partnerens id eksisterer i godkendelser-objektet */}
                        {godkendelser[p.id] && (
                          <span className={styles.afventerBadge}>Afventer</span>
                        )}
                      </div>
                      <p className={styles.partnerEmail}>
                        <Image
                          src="/icons/email.svg"
                          alt=""
                          width={12}
                          height={12}
                        />
                        {p.kontakt?.email}
                      </p>
                    </td>
                    <td>
                      <div className={styles.kompetencerWrap}>
                        {(p.kompetencer ?? []).slice(0, 3).map((k) => (
                          <span key={k} className={styles.kompetenceTag}>
                            {k}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {/* status-badget kombinerer en generel badge-klasse med en farve-klasse fra status_colors objekter. ?? "" giver en tom streng som fallback hvis statussen ikke har en defineret farve. Den lille statusDot span er den farvede prik foran statusteksten */}
                      <span
                        className={`${styles.statusBadge} ${status_colors[p.status] ?? ""}`}
                      >
                        <span className={styles.statusDot} />
                        {p.status ?? "—"}
                      </span>
                    </td>
                    <td>
                      {/* kundecase-badget kombinerer en generel badge-klasse med en farve-klasse fra kundecase_colors objekter. ?? "" giver en tom streng som fallback hvis kundecase ikke har en defineret farve */}
                      <span
                        className={`${styles.kundecaseBadge} ${kundecase_colors[p.forsteKundecase] ?? ""}`}
                      >
                        {p.forsteKundecase ?? "Ikke startet"}
                      </span>
                    </td>
                    <td className={styles.oprettetCell}>{p.oprettet ?? "—"}</td>
                    <td>
                      <Link href={`/admin/${p.id}`} className={styles.seBtn}>
                        Se partner
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
