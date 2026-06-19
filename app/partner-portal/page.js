"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { auth, db } from "@/app/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth"; /* lytter til om brugeren er logget ind */
import {
  ref,
  onValue,
  update,
  set,
} from "firebase/database"; /* update bruges til at gemme profiloplysninger firekte. set bruges til at gemme godkendelsesanmodninger i en separat node */
import styles from "./page.module.css";

const ekspertise_options = [
  "GDPR",
  "Databeskyttelse",
  "Compliance",
  "NIS2",
  "Informationssikkerhed",
  "Risikostyring",
  "Cybersikkerhed",
  "DORA",
  "AI-loven",
  "AI-styring",
  "Dataetik",
  "It-ret",
  "Teknologiret",
  "Kontraktstyring",
];
const servicetype_options = [
  "Rådgivning",
  "Konsulentydelser",
  "Revision",
  "DPO-as-a-service",
  "Leverandørstyring",
  "Managed Services",
  "Juridisk rådgivning",
  "Implementering",
];
const branche_options = [
  "Finans",
  "Sundhedsvæsen",
  "Teknologi/IT",
  "Offentlig sektor",
  "Produktion",
  "E-handel",
  "Transport og logistik",
];
const sprog_options = [
  "Dansk",
  "Engelsk",
  "Tysk",
  "Norsk",
  "Svensk",
  "Fransk",
  "Hollandsk",
  "Polsk",
];
const geografi_options = [
  "Danmark",
  "Sverige",
  "Norge",
  "Finland",
  "Tyskland",
  "Storbritannien",
  "Holland",
  "Baltikum",
  "Sydeuropa",
  "Globalt",
];
const certificering_options = [
  "ISO 27001",
  "ISAE 3000",
  "ISAE 3402",
  "CIPP/E",
  "CIPM",
  "CISSP",
  "CISM",
  "ISO 22301",
  "CEH",
  "D-mærket",
];

/* en lokal dropdown-komponent der ligner MultiSelectDropdown i onboarding */
/* Array.isArray(value) ? value : [] sikrer at selected altid et et array - det forhindrer fejl hvis value er undefined */
function SimpleDropdown({ label, options, value, onChange, single = false }) {
  const [open, setOpen] = useState(false);
  const selected = Array.isArray(value) ? value : [];

  /* samme toggle-logik som i onboarding - single-mode vælger kun ét element og lukker dropdown, multi-mode toggler elementet ind og ud af arrayet */
  function toggle(opt) {
    if (single) {
      onChange([opt]);
      setOpen(false);
    } else
      onChange(
        selected.includes(opt)
          ? selected.filter((v) => v !== opt)
          : [...selected, opt],
      );
  }

  return (
    <div className={styles.dropdownWrap}>
      <button
        type="button"
        className={`${styles.dropdownBtn} ${open ? styles.dropdownBtnOpen : ""}`}
        onClick={() => setOpen((p) => !p)}
      >
        <span className={styles.dropdownBtnText}>
          {selected.length === 0
            ? `Vælg ${label.toLowerCase()}`
            : selected.join(", ")}
        </span>
        <span
          className={`${styles.dropdownArrow} ${open ? styles.dropdownArrowOpen : ""}`}
        >
          ›
        </span>
      </button>
      {open && (
        <div className={styles.dropdownList}>
          {options.map((opt) => (
            <label key={opt} className={styles.dropdownOption}>
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className={styles.checkbox}
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function PortalContent({ partnerId, partner }) {
  const [aktiv, setAktiv] = useState("profiloplysninger");
  /* styrer hvilken fane der vises */
  const [saved, setSaved] = useState(false); /* styrer "Gemt" feedback */

  const [visGodkendelsesModal, setVisGodkendelsesModal] = useState(false);
  /* styrer om bekræftelsesmodalen er synlig */
  const [afventendeÆndringer, setAfventendeÆndringer] = useState({});
  /* gemmer de beregnede ændringer midlertidigt så de kan vises i modalen og efterfølgende gemmes i Firebase */

  /* alle redigerbare felter initialisres med partnerens nuværende værdier via ?? som fallback */
  /* det er vigtigt at initialisere med de nuværende værdier så diff-beregningen i handleSave kan sammenligne hvad der er ændret */
  const [logoUrl, setLogoUrl] = useState(partner.logo ?? "");
  const [beskrivelse, setBeskrivelse] = useState(partner.beskrivelse ?? "");
  const [hjemmeside, setHjemmeside] = useState(partner.hjemmeside ?? "");
  const [linkedin, setLinkedin] = useState(partner.linkedin ?? "");

  const [ekspertise, setEkspertise] = useState(partner.ekspertise ?? []);
  const [servicetype, setServicetype] = useState(partner.servicetype ?? []);
  const [branche, setBranche] = useState(partner.branche ?? []);
  const [sprog, setSproq] = useState(partner.sprog ?? []);
  const [geografi, setGeografi] = useState(partner.geografi ?? []);
  const [ydelser, setYdelser] = useState(partner.ydelser ?? []);
  const [ydelseInput, setYdelseInput] = useState("");
  const [certificeringer, setCertificeringer] = useState(
    partner.certificeringer ?? [],
  );
  const [andreCert, setAndreCert] = useState("");

  /* lytter i realtid på om der er en afventende godkendelsesanmodning for denne partner */
  const [harAfventendeGodkendelse, setHarAfventendeGodkendelse] =
    useState(false);

  useEffect(() => {
    const godkendelsesRef = ref(db, `godkendelser/${partnerId}`);
    const unsubscribe = onValue(godkendelsesRef, (snapshot) => {
      setHarAfventendeGodkendelse(snapshot.exists());
      /* snapshot.exists() returnerer true eller false - det er nok til at styre bannerets tilstand. Vi tjekker kun om noden eksisterer og har data, vi behøver ikke hente dataen her */
    });
    return () => unsubscribe();
    /* cleanup funktionen fjerner lytteren når komponenten unmountes */
  }, [partnerId]); /* lytteren oprettes igen hvis partnerId ændrer sig */

  const [kontaktNavn, setKontaktNavn] = useState(partner.kontakt?.navn ?? "");
  const [kontaktStilling, setKontaktStilling] = useState(
    partner.kontakt?.stilling ?? "",
  );
  const [kontaktMail, setKontaktMail] = useState(partner.kontakt?.email ?? "");
  const [kontaktTelefon, setKontaktTelefon] = useState(
    partner.kontakt?.telefon ?? "",
  );

  /* for profiloplysninger og virksomhedsdata opbygges et updates objekt med de relevante felter og sendes direkte til Firebase via update */
  async function handleSave() {
    const updates = {};

    if (aktiv === "profiloplysninger") {
      updates.logo = logoUrl;
      updates.beskrivelse = beskrivelse;
      updates.hjemmeside = hjemmeside;
      updates.linkedin = linkedin;
    }

    /* for ydelser beregnes differencen frem for at gemme hele objektet */
    /* for hvert felt beregnes to arrays - hvad er tilføjet og hvad er fjernet */
    /* kun felter med faktiske ændringer tilføjes til ændringer i objektet via if (tilføjetEkspertise.length > 0) */
    /* det samme mønster gentages for alle felter */
    if (aktiv === "ydelser") {
      const ændringer = {};

      const tilføjetEkspertise = ekspertise.filter(
        (e) => !(partner.ekspertise ?? []).includes(e),
      );
      const fjernetEkspertise = (partner.ekspertise ?? []).filter(
        (e) => !ekspertise.includes(e),
      );
      if (tilføjetEkspertise.length > 0)
        ændringer.ekspertiseTilføjet = tilføjetEkspertise;
      if (fjernetEkspertise.length > 0)
        ændringer.ekspertiseFjernet = fjernetEkspertise;

      const tilføjetServicetype = servicetype.filter(
        (s) => !(partner.servicetype ?? []).includes(s),
      );
      const fjernetServicetype = (partner.servicetype ?? []).filter(
        (s) => !servicetype.includes(s),
      );
      if (tilføjetServicetype.length > 0)
        ændringer.servicetypeTilføjet = tilføjetServicetype;
      if (fjernetServicetype.length > 0)
        ændringer.servicetypeFjernet = fjernetServicetype;

      const tilføjetBranche = branche.filter(
        (b) => !(partner.branche ?? []).includes(b),
      );
      const fjernetBranche = (partner.branche ?? []).filter(
        (b) => !branche.includes(b),
      );
      if (tilføjetBranche.length > 0)
        ændringer.brancheTilføjet = tilføjetBranche;
      if (fjernetBranche.length > 0) ændringer.brancheFjernet = fjernetBranche;

      const tilføjetSprog = sprog.filter(
        (s) => !(partner.sprog ?? []).includes(s),
      );
      const fjernetSprog = (partner.sprog ?? []).filter(
        (s) => !sprog.includes(s),
      );
      if (tilføjetSprog.length > 0) ændringer.sprogTilføjet = tilføjetSprog;
      if (fjernetSprog.length > 0) ændringer.sprogFjernet = fjernetSprog;

      const tilføjetGeografi = geografi.filter(
        (g) => !(partner.geografi ?? []).includes(g),
      );
      const fjernetGeografi = (partner.geografi ?? []).filter(
        (g) => !geografi.includes(g),
      );
      if (tilføjetGeografi.length > 0)
        ændringer.geografiTilføjet = tilføjetGeografi;
      if (fjernetGeografi.length > 0)
        ændringer.geografiFjernet = fjernetGeografi;

      const tilføjetYdelser = ydelser.filter(
        (y) => !(partner.ydelser ?? []).includes(y),
      );
      const fjernetYdelser = (partner.ydelser ?? []).filter(
        (y) => !ydelser.includes(y),
      );
      if (tilføjetYdelser.length > 0)
        ændringer.ydelserTilføjet = tilføjetYdelser;
      if (fjernetYdelser.length > 0) ændringer.ydelserFjernet = fjernetYdelser;

      const nyeCertificeringer = [
        ...certificeringer,
        ...(andreCert ? [andreCert] : []),
      ];
      const nuværendeCert = partner.certificeringer ?? [];
      const tilføjetCert = nyeCertificeringer.filter(
        (c) => !nuværendeCert.includes(c),
      );
      const fjernetCert = nuværendeCert.filter(
        (c) => !nyeCertificeringer.includes(c),
      );
      if (tilføjetCert.length > 0)
        ændringer.certificeringerTilføjet = tilføjetCert;
      if (fjernetCert.length > 0)
        ændringer.certificeringerFjernet = fjernetCert;

      /* ændringerne gemmes i state og modalen åbnes */
      /* return stopper funktionen så update ikke kaldes - ændringerne gemmes først i Firebase når brugeren bekræfter i modalen */
      setAfventendeÆndringer(ændringer);
      setVisGodkendelsesModal(true);
      return;
    }

    /* kontaktoplysninger gemmes som et nested objekt */
    if (aktiv === "virksomhed") {
      updates.kontakt = {
        navn: kontaktNavn,
        stilling: kontaktStilling,
        email: kontaktMail,
        telefon: kontaktTelefon,
      };
    }

    await update(ref(db, `partners/${partnerId}`), updates);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  /* gemmer godkendelsesanmodningen i Firebase via set - det overskriver en eventuel eksisterende anmodning */
  /* objektet indeholder status, de beregnede ændringer og et timestamp */
  async function handleBekræftGodkendelse() {
    await set(ref(db, `godkendelser/${partnerId}`), {
      status: "afventer",
      ændringer: afventendeÆndringer,
      indsendt: Date.now(),
    });
    setVisGodkendelsesModal(false); /* modalen lukkes */
    setSaved(true); /* "Gemt" feedback vises */
    setTimeout(() => setSaved(false), 2500);
  }

  /* tre betingelser skal være opfyldt - feltet må ikke være tomt, ydelsen må ikke allerede eksistere og der må ikke være mere end 10 ydelser */
  /* && evaluerer kun videre hvis alle er sande */
  function addYdelse() {
    if (
      ydelseInput.trim() &&
      !ydelser.includes(ydelseInput.trim()) &&
      ydelser.length < 10
    ) {
      setYdelser([...ydelser, ydelseInput.trim()]);
      setYdelseInput("");
    }
  }

  function removeYdelse(y) {
    setYdelser(ydelser.filter((v) => v !== y));
  }

  /* tilføjer eller fjerner en certificering via ternær operator - hvis certificeringen allerede er i listen fjernes den, ellers tilføjes den */
  function toggleCert(cert) {
    setCertificeringer((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert],
    );
  }

  /* beregner initialer fra kontaktpersonens navn */
  /* .split(" ") deler navnet i ord */
  /* .map((w) => w[0]) tager første bogstav af hvert ord */
  /* .slice(0, 2) tager de første to */
  /* .join("") joiner dem til en streng - fx Morten Schaumann" bliver "MS" */
  /* ?? "??" giver fallbavk hvis navn mangler */
  const initials =
    partner.kontakt?.navn
      ?.split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("") ?? "??";

  return (
    <div className={styles.layout}>
      {/* sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <p className={styles.sidebarTitle}>Partnerportal</p>
          <p className={styles.sidebarSection}>Menu</p>
          <div className={styles.sidebarNav}>
            <button className={`${styles.navItem} ${styles.navItemActive}`}>
              <Image
                src="/icons/partner-profile1.svg"
                alt=""
                width={16}
                height={16}
              />
              Min profil
            </button>
            <Link href={`/partnere/${partnerId}`} className={styles.navItem}>
              <Image
                src="/icons/partner-profile.svg"
                alt=""
                width={16}
                height={16}
              />
              Se offentlig profil
            </Link>
          </div>
        </div>
        <div className={styles.sidebarUser}>
          <div className={styles.userAvatar}>{initials}</div>
          <div>
            <p className={styles.userName}>
              {partner.kontakt?.navn ?? "Partner"}
            </p>
            <p className={styles.userOrg}>{partner.virksomhedsnavn}</p>
          </div>
        </div>
      </aside>

      {/* indhold */}
      <main className={styles.main}>
        {/* Status banner */}
        {/* banneret har tre mulige tilstande styret af to ternære operatorer der avalueres i rækkefølge */}
        {/* hvis der er en afventende godkendelse vises gult banner. Ellers hvis partneren er aktiv vises grønt banner. Ellers vises det afventende orange banner */}
        <div
          className={`${styles.statusBanner} ${harAfventendeGodkendelse ? styles.statusBannerAfventer : partner.status === "Aktiv" ? styles.statusBannerAktiv : styles.statusBannerPending}`}
        >
          <span className={styles.statusBannerIcon}>
            {harAfventendeGodkendelse
              ? "⊙"
              : partner.status === "Aktiv"
                ? "✓"
                : "⏳"}
          </span>
          {/* samme tre-vejs logik for bannerteksten */}
          {harAfventendeGodkendelse
            ? "Dine ændringer afventer godkendelse hos .legal — din nuværende profil er stadig synlig på platformen"
            : partner.status === "Aktiv"
              ? "Din profil er godkendt og synlig på partnerplatformen"
              : "Din profil afventer godkendelse fra .legal-teamet"}
          <Link
            href={`/partnere/${partnerId}`}
            className={styles.statusBannerLink}
          >
            Se offentlig profil →
          </Link>
        </div>

        <div className={styles.mainHeader}>
          <div>
            <h1 className={styles.pageTitle}>Rediger profil</h1>
            <p className={styles.pageDesc}>Opdater dine oplysninger.</p>
          </div>
          {/* knapperne skifter baseret på aktiv fane. På ydelser-fanen vises kun "Send til godkendelse". På alle andre faner vises "Gem ændringer". Begge kalder handleSave men funktionen håndterer de to tilfælde forskelligt baseret på aktiv state */}
          <div className={styles.headerBtns}>
            {aktiv === "ydelser" && (
              <button className={styles.sendBtn} onClick={handleSave}>
                Send til godkendelse
              </button>
            )}
            {aktiv !== "ydelser" && (
              <button className={styles.saveBtn} onClick={handleSave}>
                {saved ? "Gemt ✓" : "Gem ændringer"}
              </button>
            )}
          </div>
        </div>

        {/* Info banner */}
        <div className={styles.infoBanner}>
          <span>ℹ</span>
          Opdateringer under Ydelser sendes til godkendelse, øvrige ændringer
          opdateres med det samme.
        </div>

        {/* Faner */}
        {/* fanerne genereres ved at mappe over et array af tab-navne */}
        {/* tab.charAt(0).toUpperCase() + tab.slice(1) kapitaliserer første bogstav — fx "profiloplysninger" bliver "Profiloplysninger" */}
        {/* tabActive klassen tilføjes betinget til den aktive fane */}
        <div className={styles.tabs}>
          {["profiloplysninger", "ydelser", "virksomhed"].map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${aktiv === tab ? styles.tabActive : ""}`}
              onClick={() => setAktiv(tab)}
            >
              {tab.charAt(0).toUpperCase() +
                tab.slice(1).replace("oplysninger", "oplysninger")}
            </button>
          ))}
        </div>

        {/* fane 1 - profiloplysninger */}
        {aktiv === "profiloplysninger" && (
          <div className={styles.tabContent}>
            <div className={styles.twoCol}>
              <div className={styles.leftCol}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Logo</h2>
                  </div>
                  <div className={styles.logoSection}>
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt="Logo"
                        width={80}
                        height={80}
                        className={styles.logoPreview}
                      />
                    ) : (
                      <div className={styles.logoPlaceholder}>Logo</div>
                    )}
                    <div className={styles.logoInfo}>
                      <p className={styles.logoDesc}>
                        Dit logo vises på din partnerprofil og i søgeresultater.
                      </p>
                      <p className={styles.logoSubDesc}>
                        Anbefalet størrelse: 200x200px.
                      </p>
                      <input
                        type="url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://virksomhed.dk/logo.png"
                        className={styles.logoInput}
                      />
                    </div>
                  </div>
                  {logoUrl && (
                    <button
                      className={styles.fjernBtn}
                      onClick={() => setLogoUrl("")}
                    >
                      Fjern
                    </button>
                  )}
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Om virksomheden</h2>
                    <p className={styles.cardSubDesc}>
                      Vises på din offentlige profil
                    </p>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Beskrivelse</label>
                    <textarea
                      value={beskrivelse}
                      onChange={(e) => setBeskrivelse(e.target.value)}
                      maxLength={600}
                      rows={5}
                      className={styles.textarea}
                      placeholder="Beskriv din virksomhed..."
                    />
                    <p className={styles.charCount}>
                      {beskrivelse.length}/600 tegn
                    </p>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Hjemmeside</label>
                    <input
                      type="url"
                      value={hjemmeside}
                      onChange={(e) => setHjemmeside(e.target.value)}
                      placeholder="www.virksomhed.dk"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>LinkedIn</label>
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="linkedin.com/virksomhed"
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Tips til en god profil</h2>
                </div>
                <ul className={styles.tipsList}>
                  <li>
                    Beskriv konkret hvad I leverer — ikke bare jeres titel.
                  </li>
                  <li>
                    Upload et skarpt logo — det øger synlighed i søgeresultater.
                  </li>
                  <li>Hold beskrivelsen under 300 tegn for bedst læsbarhed.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* fane 2 - ydelser */}
        {aktiv === "ydelser" && (
          <div className={styles.tabContent}>
            <div className={styles.twoCol}>
              <div className={styles.leftCol}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Kategorisering</h2>
                    <p className={styles.cardSubDesc}>
                      Bruges til filtrering og søgning
                    </p>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Primært ekspertiseområde
                    </label>
                    <SimpleDropdown
                      label="Ekspertiseområde"
                      options={ekspertise_options}
                      value={ekspertise}
                      onChange={setEkspertise}
                      single
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Servicetype</label>
                    <SimpleDropdown
                      label="Servicetype"
                      options={servicetype_options}
                      value={servicetype}
                      onChange={setServicetype}
                    />
                  </div>
                  <div className={styles.twoInputRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Branche</label>
                      <SimpleDropdown
                        label="Branche"
                        options={branche_options}
                        value={branche}
                        onChange={setBranche}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Sprog</label>
                      <SimpleDropdown
                        label="Sprog"
                        options={sprog_options}
                        value={sprog}
                        onChange={setSproq}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Geografisk dækning</label>
                    <SimpleDropdown
                      label="Geografisk dækning"
                      options={geografi_options}
                      value={geografi}
                      onChange={setGeografi}
                    />
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Ydelser</h2>
                    <p className={styles.cardSubDesc}>Op til 10 ydelser</p>
                  </div>
                  <div className={styles.ydelseRow}>
                    {/* onChange opdaterer ydelseInput state hver gang brugeren skriver noget */}
                    {/* onKeyDown lytter på tastaturet. Hvis brugeren trykker Enter - e.preventDefault forhindrer at formularen bliver sendt, addYdelse tilføjer ydelsen til listen */}
                    <input
                      type="text"
                      value={ydelseInput}
                      onChange={(e) => setYdelseInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addYdelse())
                      }
                      placeholder="fx GDPR-rådgivning"
                      className={styles.input}
                    />
                    <button className={styles.tilfoejBtn} onClick={addYdelse}>
                      Tilføj
                    </button>
                  </div>
                  <div className={styles.chipsRow}>
                    {ydelser.map((y) => (
                      <span key={y} className={styles.chip}>
                        {y}
                        <button
                          className={styles.chipRemove}
                          onClick={() => removeYdelse(y)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <p className={styles.charCount}>
                    {ydelser.length} af 10 ydelser tilføjet
                  </p>
                </div>
              </div>

              <div className={styles.leftCol}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Certificeringer</h2>
                    <p className={styles.cardSubDesc}>
                      Vises som badges og bruges til filtrering
                    </p>
                  </div>
                  <div className={styles.certList}>
                    {certificering_options.map((cert) => (
                      <label key={cert} className={styles.certItem}>
                        <input
                          type="checkbox"
                          checked={certificeringer.includes(cert)}
                          onChange={() => toggleCert(cert)}
                          className={styles.checkbox}
                        />
                        {cert}
                      </label>
                    ))}
                  </div>
                  <div
                    className={styles.formGroup}
                    style={{ marginTop: "16px" }}
                  >
                    <label className={styles.label}>Anden certificering</label>
                    <input
                      type="text"
                      value={andreCert}
                      onChange={(e) => setAndreCert(e.target.value)}
                      placeholder="fx Certified DPO"
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Sådan bruges filtrene</h2>
                  </div>
                  <ul className={styles.tipsList}>
                    <li>
                      Kunder filtrerer primært på ekspertiseområde,
                      certificeringer og geografi.
                    </li>
                    <li>
                      Jo flere relevante ydelser du tilføjer, jo bedre matcher
                      du søgninger.
                    </li>
                    <li>
                      Certificeringer vises som badges på din profil og øger
                      tilliden.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* fane 3 - virksomhed */}
        {aktiv === "virksomhed" && (
          <div className={styles.tabContent}>
            <div className={styles.twoCol}>
              <div>
                <div className={styles.card} style={{ marginBottom: "50px" }}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Virksomhedsoplysninger</h2>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Virksomhedsnavn</label>
                    <input
                      type="text"
                      value={partner.virksomhedsnavn}
                      disabled
                      className={`${styles.input} ${styles.inputDisabled}`}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>VAT-nummer</label>
                    <input
                      type="text"
                      value={partner.vat ?? ""}
                      disabled
                      className={`${styles.input} ${styles.inputDisabled}`}
                    />
                    <p className={styles.fieldHint}>
                      VAT-nummer kan ikke ændres. Kontakt support hvis det er
                      forkert.
                    </p>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Kontaktperson</h2>
                    <p className={styles.cardSubDesc}>
                      Bruges til intern kommunikation — vises ikke offentligt
                    </p>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Fulde navn</label>
                    <input
                      type="text"
                      value={kontaktNavn}
                      onChange={(e) => setKontaktNavn(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Stilling</label>
                    <input
                      type="text"
                      value={kontaktStilling}
                      onChange={(e) => setKontaktStilling(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Arbejdsmail</label>
                    <input
                      type="email"
                      value={kontaktMail}
                      onChange={(e) => setKontaktMail(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Telefon</label>
                    <input
                      type="tel"
                      value={kontaktTelefon}
                      onChange={(e) => setKontaktTelefon(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Kontaktoplysninger</h2>
                </div>
                <ul className={styles.tipsList}>
                  <li>
                    Kontaktpersonens oplysninger bruges kun til intern
                    kommunikation med .legal.
                  </li>
                  <li>
                    Den offentlige kontaktmail sættes under profiloplysninger.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* modalen vises kun når visGodkendelsesModal er true */}
      {visGodkendelsesModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalIcon}>
              <Image src="/icons/godkend.svg" alt="" width={32} height={32} />
            </div>
            <h2 className={styles.modalTitle}>
              Send ændringer til godkendelse?
            </h2>
            <p className={styles.modalDesc}>
              Dine ændringer bliver ikke synlige på platformen før .legal har
              godkendt dem. Du modtager en mail når de er behandlet.
            </p>
            <div className={styles.modalChanges}>
              <p className={styles.modalChangesLabel}>Ændringer der sendes</p>
              {/* Object.entries(afventendeÆndringer) konverterer ændringsobjektet til et array af nøgle-værdi par der mappes til rækker */}
              {Object.entries(afventendeÆndringer).map(([key, value]) => (
                <div key={key} className={styles.modalChangeRow}>
                  <span className={styles.modalChangeKey}>{key}</span>
                  {/* Array.isArray(value) ? value.join(", ") : value håndterer at værdier kan være arrays eller strenge */}
                  <span className={styles.modalChangeValue}>
                    {Array.isArray(value) ? value.join(", ") : value}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.modalBtns}>
              <button
                className={styles.modalBtnCancel}
                onClick={() => setVisGodkendelsesModal(false)}
              >
                Annuller
              </button>
              <button
                className={styles.modalBtnConfirm}
                onClick={handleBekræftGodkendelse}
              >
                Send til godkendelse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* wrapper-komponenten håndterer autentificering og datahentning */
export default function PartnerPortalPage() {
  const [partnerId, setPartnerId] = useState(null);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  /* onAuthStateChanged lytter til Firebase Authentication - callback funktionen kaldes med user som objekt hvis logget ind eller null hvis ikke */
  /* hvis ikke logget ind sættes loading til false og funktionen returnerer */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      /* hvis logget ind hentes alle partnere og Object.entries(data).find() finder den partner hvis kontakt.email matcher den loggede brugers email */
      /* [, p] er destructuring hvor _ konventionen for den ubrugte nøgle erstattes med en tom plads */
      /* found[0] er partnerens id og found[1] er partnerens data - de kombineres til et objekt med spread-operatoren */
      const partnersRef = ref(db, "partners");
      /* opretter en realtidslytter der henter alle partnere */
      onValue(partnersRef, (snapshot) => {
        /* konverterer snapshot til et JavaScript objekt med alle partnere */
        const data = snapshot.val();
        /* tjekker om der faktisk er data */
        if (data) {
          const found = Object.entries(data).find(
            ([, p]) => p.kontakt?.email === user.email,
          );
          /* tjekker om partneren blev fundet */
          if (found) {
            /* gemmer partnerens Firebase id */
            setPartnerId(found[0]);
            /* kombinerer id'et med partnerens øvrige data via spread-operatoren og gemmer det i partner state */
            setPartner({ id: found[0], ...found[1] });
          }
        }
        setLoading(false);
      });
    });
    return () => unsubscribe();
  }, []);

  /* samme separtion og concerns som i adminpanelet - PartnerPortalPage håndterer datahentning og loading-state, og PortalContent renderes kun når data er klar */
  if (loading)
    return (
      <div style={{ padding: "80px", textAlign: "center" }}>
        Henter profil...
      </div>
    );
  if (!partner)
    return (
      <div style={{ padding: "80px", textAlign: "center" }}>
        Ingen partnerprofil fundet.
      </div>
    );

  return <PortalContent partnerId={partnerId} partner={partner} />;
}
