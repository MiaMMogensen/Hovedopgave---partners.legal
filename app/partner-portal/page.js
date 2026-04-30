"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { auth, db } from "@/app/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, update } from "firebase/database";
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
const certificeringer_options = [
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

function SimpleDropdown({ label, options, value, onChange, single = false }) {
  const [open, setOpen] = useState(false);
  const selected = Array.isArray(value) ? value : [];

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
  const [saved, setSaved] = useState(false);

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

  const [kontaktNavn, setKontaktNavn] = useState(partner.kontakt?.navn ?? "");
  const [kontaktStilling, setKontaktStilling] = useState(
    partner.kontakt?.stilling ?? "",
  );
  const [kontaktMail, setKontaktMail] = useState(partner.kontakt?.email ?? "");
  const [kontaktTelefon, setKontaktTelefon] = useState(
    partner.kontakt?.telefon ?? "",
  );

  async function handleSave() {
    const updates = {};

    if (aktiv === "profiloplysninger") {
      updates.logo = logoUrl;
      updates.beskrivelse = beskrivelse;
      updates.hjemmeside = hjemmeside;
      updates.linkedin = linkedin;
    }

    if (aktiv === "ydelser") {
      updates.ekspertise = ekspertise;
      updates.servicetype = servicetype;
      updates.branche = branche;
      updates.sprog = sprog;
      updates.geografi = geografi;
      updates.ydelser = ydelser;
      updates.certificeringer = [
        ...certificeringer,
        ...(andreCert ? [andreCert] : []),
      ];
    }

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

  function toggleCert(cert) {
    setCertificeringer((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert],
    );
  }

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
        <div
          className={`${styles.statusBanner} ${partner.status === "Aktiv" ? styles.statusBannerAktiv : styles.statusBannerPending}`}
        >
          <span className={styles.statusBannerIcon}>
            {partner.status === "Aktiv" ? "✓" : "⏳"}
          </span>
          {partner.status === "Aktiv"
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
          <div className={styles.headerBtns}>
            {aktiv === "ydelser" && (
              <button className={styles.sendBtn} onClick={handleSave}>
                Send til godkendelse
              </button>
            )}
            <button className={styles.saveBtn} onClick={handleSave}>
              {saved ? "Gemt ✓" : "Gem ændringer"}
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className={styles.infoBanner}>
          <span>ℹ</span>
          Opdateringer under Ydelser sendes til godkendelse, øvrige ændringer
          opdateres med det samme.
        </div>

        {/* Faner */}
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
                    {CERTIFICERING_OPTIONS.map((cert) => (
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
    </div>
  );
}

export default function PartnerPortalPage() {
  const [partnerId, setPartnerId] = useState(null);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const partnersRef = ref(db, "partners");
      onValue(partnersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const found = Object.entries(data).find(
            ([, p]) => p.kontakt?.email === user.email,
          );
          if (found) {
            setPartnerId(found[0]);
            setPartner({ id: found[0], ...found[1] });
          }
        }
        setLoading(false);
      });
    });
    return () => unsubscribe();
  }, []);

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
