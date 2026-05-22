"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { db } from "@/app/firebaseConfig";
import { ref, push } from "firebase/database";
import styles from "./page.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TRIN = [
  { num: 1, label: "Virksomhed" },
  { num: 2, label: "Kontakt" },
  { num: 3, label: "Ydelser" },
  { num: 4, label: "Dokumentation" },
  { num: 5, label: "Opsummering" },
];

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
const geoografi_options = [
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
const ydelser_suggestions = [
  "DPO-as-a-service",
  "GDPR gap-analyse",
  "NIS2 implementering",
  "Penetrationstest",
  "ISO 27001 certificering",
  "Risikovurdering",
  "Databeskyttelsespolitikker",
  "Medarbejdertræning",
  "Sikkerhedsaudit",
  "Compliance framework",
  "Leverandørstyring",
  "Kontraktstyring",
];

const ekspertise_ydelser = {
  GDPR: [
    "GDPR gap-analyse",
    "Databeskyttelsespolitikker",
    "Registre over behandlingsaktiviteter",
    "Databehandleraftaler",
    "Konsekvensanalyse (DPIA)",
  ],
  Databeskyttelse: [
    "GDPR gap-analyse",
    "Databeskyttelsespolitikker",
    "Databehandleraftaler",
    "Brud på datasikkerhed",
    "Konsekvensanalyse (DPIA)",
  ],
  Compliance: [
    "Compliance gap-analyse",
    "Compliance-monitorering",
    "Ledelsesrapportering",
    "Compliance framework",
    "Intern revision",
  ],
  NIS2: [
    "NIS2 gap-analyse",
    "Sikkerhedsaudit",
    "Hændelseshåndtering",
    "Beredskabsplanlægning",
    "Leverandørstyring",
  ],
  Informationssikkerhed: [
    "ISO 27001 implementering",
    "Sikkerhedsaudit",
    "Risikovurdering",
    "Sikkerhedspolitikker",
    "Medarbejdertræning",
  ],
  Risikostyring: [
    "Risikovurdering",
    "Risiko-framework",
    "Ledelsesrapportering",
    "Compliance-monitorering",
    "Beredskabsplanlægning",
  ],
  Cybersikkerhed: [
    "Penetrationstest",
    "Sikkerhedsaudit",
    "Hændelseshåndtering",
    "Sårbarhedsscanning",
    "SOC-as-a-service",
  ],
  DORA: [
    "DORA gap-analyse",
    "ICT-risikostyring",
    "Tredjepartsstyring",
    "Digital operationel modstandsdygtighed",
    "Hændelsesrapportering",
  ],
  "AI-loven": [
    "AI-risikovurdering",
    "AI-konsekvensanalyse",
    "AI-governance framework",
    "AI-politikker",
    "AI-compliance",
  ],
  "AI-styring": [
    "AI-governance framework",
    "AI-politikker",
    "AI-risikovurdering",
    "Etisk AI-ramme",
    "AI-revision",
  ],
  Dataetik: [
    "Dataetik-rådgivning",
    "Etisk AI-ramme",
    "Databeskyttelsespolitikker",
    "Interessentanalyse",
    "Transparensrapportering",
  ],
  "It-ret": [
    "Kontraktgennemgang",
    "SLA-aftaler",
    "Licensaftaler",
    "Teknologikontrakter",
    "Juridisk rådgivning",
  ],
  Teknologiret: [
    "Teknologikontrakter",
    "Licensaftaler",
    "SLA-aftaler",
    "Kontraktgennemgang",
    "Juridisk rådgivning",
  ],
  Kontraktstyring: [
    "Kontraktgennemgang",
    "Leverandøraftaler",
    "Forhandlingsstøtte",
    "Kontraktdatabase",
    "SLA-aftaler",
  ],
};

const tips = {
  1: [
    {
      icon: "/icons/tooltip-document.svg",
      title: "VAT-nummer",
      desc: "Dit virksomhedens momsregistreringsnummer, fx. DK12345678 for danske virksomheder.",
    },
    {
      icon: "/icons/tooltip-upload.svg",
      title: "Logo",
      desc: "Valgfrit - du kan altid uploade det senere.",
    },
  ],
  2: [
    {
      icon: "/icons/tooltip-person.svg",
      title: "Beslutningstageren",
      desc: "Angiv den person der har mandat for at indgå partnerskabet.",
    },
    {
      icon: "/icons/tooltip-mail.svg",
      title: "Arbejdsmail",
      desc: "Brug en firmamail - ikke en privat adresse.",
    },
  ],
  3: [
    {
      icon: "/icons/tooltip-pencil.svg",
      title: "Vær konkret",
      desc: "Beskriv hvad I faktisk leverer - ikke bare jeres titel.",
    },
    {
      icon: "/icons/tooltip-filter.svg",
      title: "Ydelser",
      desc: "Tilføj specifikke ydelser - de bruges som søgefiltre.",
    },
  ],
  4: [
    {
      icon: "/icons/tooltip-filter.svg",
      title: "Filtrering",
      desc: "Kunder kan søge efter partnere med specifikke certificeringer.",
    },
    {
      icon: "/icons/tooltip-document.svg",
      title: "Dokumentation",
      desc: "Upload certifikater som PDF for at understøtte din profil.",
    },
  ],
};

const tips_titles = {
  1: "Hvad skal du bruge?",
  2: "Hvem skal kontaktes?",
  3: "Tips til beskrivelsen",
  4: "Hvorfor certificeringer?",
};

function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
  single = false,
}) {
  const [open, setOpen] = useState(false);

  function toggle(option) {
    if (single) {
      onChange([option]);
      setOpen(false);
    } else {
      onChange(
        selected.includes(option)
          ? selected.filter((v) => v !== option)
          : [...selected, option],
      );
    }
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

function ChipInput({ value, onChange }) {
  const [query, setQuery] = useState("");

  const suggestions = query
    ? ydelser_suggestions.filter(
        (s) =>
          s.toLowerCase().includes(query.toLowerCase()) && !value.includes(s),
      )
    : [];

  function add(item) {
    if (!value.includes(item)) onChange([...value, item]);
    setQuery("");
  }

  function remove(item) {
    onChange(value.filter((v) => v !== item));
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();
      add(query.trim());
    }
  }

  return (
    <div className={styles.chipInputWrap}>
      <div className={styles.chipInputField}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="fx GDPR gap-analyse, databeskyttelsespolitikker..."
          className={`${styles.chipSearchInput} ${suggestions.length > 0 ? styles.chipSearchInputOpen : ""}`}
          autoComplete="off"
        />
        {suggestions.length > 0 && (
          <div className={styles.chipSuggestions}>
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                className={styles.chipSuggestion}
                onClick={() => add(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      {value.length > 0 && (
        <div className={styles.chipsRow}>
          {value.map((v) => (
            <span key={v} className={styles.chip}>
              {v}
              <button
                type="button"
                className={styles.chipRemove}
                onClick={() => remove(v)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  const [aktivtTrin, setAktivtTrin] = useState(1);
  const [showTip, setShowTip] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trinErrors, setTrinErrors] = useState({});
  const router = useRouter();

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (aktivtTrin > 1 && !submitted) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [aktivtTrin, submitted]);

  useEffect(() => {
    if (aktivtTrin === 1 || submitted) return;

    const handleClick = (e) => {
      const link = e.target.closest("a");
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      e.preventDefault();
      const confirm = window.confirm(
        "Er du sikker på at du vil forlade siden? Dine oplysninger gemmes ikke.",
      );
      if (confirm) router.push(href);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [aktivtTrin, submitted, router]);

  const [data, setData] = useState({
    virksomhedsnavn: "",
    vat: "",
    hjemmeside: "",
    linkedin: "",
    logoUrl: "",

    kontaktNavn: "",
    kontaktStilling: "",
    kontaktMail: "",
    kontaktTelefon: "",

    ekspertise: [],
    servicetype: [],
    branche: [],
    sprog: [],
    geografi: [],
    beskrivelse: "",
    ydelser: [],

    certificeringer: [],
    andreCertificeringer: "",
    dokumenter: [],
  });

  const docInputRef = useRef(null);

  function update(field, value) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function handleDocUpload(e) {
    const files = Array.from(e.target.files);
    setData((prev) => ({
      ...prev,
      dokumenter: [...prev.dokumenter, ...files],
    }));
    docInputRef.current.value = "";
  }

  function validerOgGåVidere(næsteTrin) {
    const errors = {};

    if (aktivtTrin === 1) {
      if (!data.virksomhedsnavn.trim()) {
        errors.virksomhedsnavn = "Udfyld virksomhedsnavnet";
      } else if (data.virksomhedsnavn.trim().length < 2) {
        errors.virksomhedsnavn = "Virksomhedsnavnet er for kort";
      }
      if (!data.vat.trim()) {
        errors.vat = "Udfyld VAT-nummeret";
      } else if (
        !/^[A-Z]{0,2}\d{6,12}$/.test(data.vat.trim().replace(/\s/g, ""))
      ) {
        errors.vat = "Indtast et gyldigt VAT-nummer, fx DK12345678";
      }
    }

    if (aktivtTrin === 2) {
      if (!data.kontaktNavn.trim()) {
        errors.kontaktNavn = "Udfyld dit fulde navn";
      } else if (data.kontaktNavn.trim().split(" ").length < 2) {
        errors.kontaktNavn = "Indtast både fornavn og efternavn";
      }
      if (!data.kontaktStilling.trim()) {
        errors.kontaktStilling = "Udfyld din stilling";
      } else if (data.kontaktStilling.trim().length < 2) {
        errors.kontaktStilling = "Stillingen er for kort";
      }
      if (!data.kontaktMail.trim()) {
        errors.kontaktMail = "Udfyld din arbejdsmail";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.kontaktMail.trim())) {
        errors.kontaktMail = "Indtast en gyldig mailadresse";
      }
    }

    if (aktivtTrin === 3) {
      if (!data.ekspertise.length)
        errors.ekspertise = "Vælg mindst ét ekspertiseområde";
      if (!data.servicetype.length)
        errors.servicetype = "Vælg mindst én servicetype";
      if (!data.branche.length) errors.branche = "Vælg mindst én branche";
      if (!data.beskrivelse.trim()) {
        errors.beskrivelse = "Skriv en beskrivelse";
      } else if (data.beskrivelse.trim().length < 20) {
        errors.beskrivelse = "Beskrivelsen er for kort — skriv mindst 20 tegn";
      }
    }

    if (Object.keys(errors).length > 0) {
      setTrinErrors(errors);
      return;
    }
    setTrinErrors({});
    setAktivtTrin(næsteTrin);
  }

  async function handleSubmit() {
    try {
      const partnerRef = ref(db, "partners");
      await push(partnerRef, {
        virksomhedsnavn: data.virksomhedsnavn,
        vat: data.vat,
        hjemmeside: data.hjemmeside,
        linkedin: data.linkedin,
        kontakt: {
          navn: data.kontaktNavn,
          stilling: data.kontaktStilling,
          email: data.kontaktMail,
          telefon: data.kontaktTelefon,
        },
        ekspertise: data.ekspertise,
        servicetype: data.servicetype,
        branche: data.branche,
        sprog: data.sprog,
        geografi: data.geografi,
        beskrivelse: data.beskrivelse,
        ydelser: data.ydelser,
        certificeringer: [
          ...data.certificeringer,
          ...(data.andreCertificeringer ? [data.andreCertificeringer] : []),
        ],
        status: "Aktivering",
        featured: false,
        logo: data.logoUrl,
        forsteKundecase: "Ikke startet",
        kompetencer: [],
        oprettet: new Date().toLocaleDateString("da-DK", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        oprettetTimestamp: Date.now(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Firebase fejl:", err);
    }
  }

  if (submitted) {
    return (
      <main>
        <section className={styles.formSectionSuccess}>
          <div className={styles.inner}>
            <div className={styles.formCard}>
              <div className={styles.successWrap}>
                <div className={styles.successIcon}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path
                      d="M6 16L13 23L26 9"
                      stroke="#7284FA"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h2 className={styles.successTitle}>
                  Din profil er ved at blive oprettet
                </h2>
                <p className={styles.successDesc}>
                  Tak, <strong>{data.kontaktNavn}</strong>. Vi har modtaget dine
                  oplysninger og er ved at oprette din partnerprofil. Du
                  modtager en mail når din profil er klar og synlig på
                  platformen.
                </p>

                <hr className={styles.successDivider} />

                <p className={styles.nextStepsLabel}>Hvad sker der nu?</p>
                <div className={styles.nextSteps}>
                  {[
                    {
                      num: "✓",
                      done: true,
                      active: false,
                      title: "Oplysninger indsendt",
                      desc: "Vi har modtaget dine oplysninger og sender dig en bekræftelsesmail indenfor få minutter.",
                    },
                    {
                      num: "2",
                      done: false,
                      active: true,
                      title: "Profil oprettes",
                      desc: "Vi gennemgår dine oplysninger og opretter din profil - typisk inden for 5 hverdage.",
                    },
                    {
                      num: "3",
                      done: false,
                      active: false,
                      title: "Bekræftelse på mail",
                      desc: `Du modtager en bekræftelse på ${data.kontaktMail} når din profil er klar.`,
                    },
                    {
                      num: "4",
                      done: false,
                      active: false,
                      title: "Aktivering af profil",
                      desc: "Din profil bliver synlig på partnerportalen og kunder kan finde dig.",
                    },
                  ].map((step) => (
                    <div key={step.num} className={styles.nextStep}>
                      <div
                        className={`${styles.stepCircle} ${step.done ? styles.stepCircleDone : step.active ? styles.stepCircleActive : ""}`}
                      >
                        {step.num}
                      </div>
                      <div className={styles.stepContent}>
                        <p
                          className={`${styles.stepTitle} ${step.done ? styles.stepTitleDone : step.active ? styles.stepTitleActive : ""}`}
                        >
                          {step.title}
                        </p>
                        <p
                          className={`${styles.stepDesc} ${step.done ? styles.stepDescDone : step.active ? styles.stepDescActive : ""}`}
                        >
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tre info-kort */}
                <div className={styles.successInfoGrid}>
                  <div className={styles.successInfoCard}>
                    <p className={styles.successInfoLabel}>Bekræftelsesmail</p>
                    <p className={styles.successInfoValue}>
                      {data.kontaktMail}
                    </p>
                  </div>
                  <div className={styles.successInfoCard}>
                    <p className={styles.successInfoLabel}>Virksomhed</p>
                    <p className={styles.successInfoValue}>
                      {data.virksomhedsnavn}
                    </p>
                  </div>
                  <div className={styles.successInfoCard}>
                    <p className={styles.successInfoLabel}>Forventet svartid</p>
                    <p className={styles.successInfoValue}>5 hverdage</p>
                  </div>
                </div>

                {/* Mens du venter boks */}
                <div className={styles.successWaitBox}>
                  <p className={styles.successWaitTitle}>Mens du venter</p>
                  <ul className={styles.successWaitList}>
                    <li>
                      Tjek din indbakke — du modtager en bekræftelsesmail inden
                      for få minutter
                    </li>
                    <li>
                      Husk at tjekke dit spamfilter hvis du ikke ser mailen
                    </li>
                    <li>
                      Har du spørgsmål? Skriv til os på support@dotlegal.com
                    </li>
                  </ul>
                </div>

                <hr className={styles.successDivider} />

                <div className={styles.successActions}>
                  <Link href="/" className={styles.successBtnOutline}>
                    Gå til forsiden
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      {/* hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.catLabel}>Partnerprogram</p>
          <h1 className={styles.heroTitle}>
            Velkommen til .legals partnerprogram
          </h1>
          <p className={styles.heroDesc}>
            Udfyld nedenstående trin for at komme i gang med at oprette din
            partnerprofil.
          </p>

          {/* Progress indikator */}
          <div className={styles.progressWrap}>
            {TRIN.map((trin, index) => (
              <div key={trin.num} className={styles.progressItem}>
                <div className={styles.progressStep}>
                  <div
                    className={`${styles.progressCircle} ${aktivtTrin === trin.num ? styles.progressCircleActive : aktivtTrin > trin.num ? styles.progressCircleDone : ""}`}
                  >
                    {aktivtTrin > trin.num ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M2 7L6 11L12 3"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      trin.num
                    )}
                  </div>
                  <span
                    className={`${styles.progressLabel} ${aktivtTrin === trin.num ? styles.progressLabelActive : aktivtTrin > trin.num ? styles.progressLabelDone : ""}`}
                  >
                    {trin.label}
                  </span>
                </div>
                {index < TRIN.length - 1 && (
                  <div
                    className={`${styles.progressLine} ${aktivtTrin > trin.num ? styles.progressLineDone : ""}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── formular ── */}
      <section className={styles.formSection}>
        <div className={styles.inner}>
          <div className={styles.formCard}>
            {/* Spørgsmålstegn tooltip */}
            {aktivtTrin < 5 && (
              <div className={styles.tipWrap}>
                <button
                  type="button"
                  className={styles.tipBtn}
                  onMouseEnter={() => setShowTip(true)}
                  onMouseLeave={() => setShowTip(false)}
                >
                  <Image
                    src="/icons/question.svg"
                    alt=""
                    width={20}
                    height={20}
                  />
                </button>
                {showTip && (
                  <div className={styles.tipBox}>
                    <p className={styles.tipTitle}>{tips_titles[aktivtTrin]}</p>
                    {tips[aktivtTrin].map((tip) => (
                      <div key={tip.title} className={styles.tipItem}>
                        <div className={styles.tipIcon}>
                          <Image src={tip.icon} alt="" width={18} height={18} />
                        </div>
                        <div>
                          <p className={styles.tipItemTitle}>{tip.title}</p>
                          <p className={styles.tipItemDesc}>{tip.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* trin 1 */}
            {aktivtTrin === 1 && (
              <div>
                <h2 className={styles.stepHeading}>Fortæl om din virksomhed</h2>
                <p className={styles.stepDesc2}>
                  Vi bruger disse oplysninger til at oprette din partnerprofil
                  på .legals partnerplatform.
                </p>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Virksomhedsnavn <span className={styles.req}>*</span>
                    </label>
                    <input
                      type="text"
                      value={data.virksomhedsnavn}
                      onChange={(e) => {
                        update("virksomhedsnavn", e.target.value);
                        setTrinErrors((prev) => ({
                          ...prev,
                          virksomhedsnavn: undefined,
                        }));
                      }}
                      placeholder="fx Compliance Partners"
                      className={styles.input}
                    />
                    {trinErrors.virksomhedsnavn && (
                      <p className={styles.fieldError}>
                        {trinErrors.virksomhedsnavn}
                      </p>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      VAT-nummer <span className={styles.req}>*</span>
                    </label>
                    <input
                      type="text"
                      value={data.vat}
                      onChange={(e) => {
                        update("vat", e.target.value);
                        setTrinErrors((prev) => ({
                          ...prev,
                          vat: undefined,
                        }));
                      }}
                      placeholder="fx 12345678"
                      className={styles.input}
                    />
                    {trinErrors.vat && (
                      <p className={styles.fieldError}>{trinErrors.vat}</p>
                    )}
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Hjemmeside</label>
                    <input
                      type="url"
                      value={data.hjemmeside}
                      onChange={(e) => update("hjemmeside", e.target.value)}
                      placeholder="fx www.compliancepartners.dk"
                      className={styles.input}
                    />
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>LinkedIn</label>
                    <input
                      type="url"
                      value={data.linkedin}
                      onChange={(e) => update("linkedin", e.target.value)}
                      placeholder="fx www.linkedin.com/company/compliance-partners"
                      className={styles.input}
                    />
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Logo</label>
                    <div className={styles.uploadArea}>
                      {data.logoUrl ? (
                        <div className={styles.logoPreviewWrap}>
                          <Image
                            src={data.logoUrl}
                            alt="Logo preview"
                            width={80}
                            height={80}
                            className={styles.logoPreview}
                          />
                          <button
                            type="button"
                            className={styles.logoRemove}
                            onClick={() => update("logoUrl", "")}
                          >
                            Fjern logo
                          </button>
                        </div>
                      ) : (
                        <>
                          <Image
                            src="/icons/upload.svg"
                            alt=""
                            width={28}
                            height={28}
                          />
                          <p className={styles.uploadText}>
                            Indsæt et link til dit logo
                          </p>
                          <p className={styles.uploadSubtext}>
                            PNG, SVG eller JPG — anbefalet 200x200px
                          </p>
                          <input
                            type="url"
                            value={data.logoUrl}
                            onChange={(e) => update("logoUrl", e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="https://virksomhed.dk/logo.png"
                            className={styles.uploadUrlInput}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <hr className={styles.divider} />
                <div className={styles.navRow}>
                  <div />
                  <button
                    type="button"
                    className={styles.nextBtn}
                    onClick={() => validerOgGåVidere(2)}
                  >
                    Næste trin →
                  </button>
                </div>
              </div>
            )}

            {/* trin 2 */}
            {aktivtTrin === 2 && (
              <div>
                <h2 className={styles.stepHeading}>Hvem er kontaktperson?</h2>
                <p className={styles.stepDesc2}>
                  Vi bruger disse oplysninger til at komme i kontakt med dig i
                  forbindelse med dit partnerskab.
                </p>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Fulde navn <span className={styles.req}>*</span>
                    </label>
                    <input
                      type="text"
                      value={data.kontaktNavn}
                      onChange={(e) => {
                        update("kontaktNavn", e.target.value);
                        setTrinErrors((prev) => ({
                          ...prev,
                          kontaktNavn: undefined,
                        }));
                      }}
                      placeholder="fx Mikkel Hansen"
                      className={styles.input}
                    />
                    {trinErrors.kontaktNavn && (
                      <p className={styles.fieldError}>
                        {trinErrors.kontaktNavn}
                      </p>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Stilling <span className={styles.req}>*</span>
                    </label>
                    <input
                      type="text"
                      value={data.kontaktStilling}
                      onChange={(e) => {
                        update("kontaktStilling", e.target.value);
                        setTrinErrors((prev) => ({
                          ...prev,
                          kontaktStilling: undefined,
                        }));
                      }}
                      placeholder="fx Direktør"
                      className={styles.input}
                    />
                    {trinErrors.kontaktStilling && (
                      <p className={styles.fieldError}>
                        {trinErrors.kontaktStilling}
                      </p>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Arbejdsmail <span className={styles.req}>*</span>
                    </label>
                    <input
                      type="email"
                      value={data.kontaktMail}
                      onChange={(e) => {
                        update("kontaktMail", e.target.value);
                        setTrinErrors((prev) => ({
                          ...prev,
                          kontaktMail: undefined,
                        }));
                      }}
                      placeholder="fx mikkelhansen@compliancepartners.dk"
                      className={styles.input}
                    />
                    {trinErrors.kontaktMail && (
                      <p className={styles.fieldError}>
                        {trinErrors.kontaktMail}
                      </p>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Telefonnummer</label>
                    <input
                      type="tel"
                      value={data.kontaktTelefon}
                      onChange={(e) => update("kontaktTelefon", e.target.value)}
                      placeholder="fx. +45 12 34 56 78"
                      className={styles.input}
                    />
                  </div>
                </div>
                <hr className={styles.divider} />
                <div className={styles.navRow}>
                  <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() => setAktivtTrin(1)}
                  >
                    ← Tilbage
                  </button>
                  <button
                    type="button"
                    className={styles.nextBtn}
                    onClick={() => validerOgGåVidere(3)}
                  >
                    Næste trin →
                  </button>
                </div>
              </div>
            )}

            {/* trin 3 */}
            {aktivtTrin === 3 && (
              <div>
                <h2 className={styles.stepHeading}>
                  Hvad tilbyder din virksomhed?
                </h2>
                <p className={styles.stepDesc2}>
                  Beskriv dine ydelser så kunderne kan finde dig på
                  partnerplatformen.
                </p>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Primært ekspertiseområde{" "}
                      <span className={styles.req}>*</span>
                    </label>
                    <MultiSelectDropdown
                      label="Ekspertiseområde"
                      options={ekspertise_options}
                      selected={data.ekspertise}
                      onChange={(v) => {
                        update("ekspertise", v);
                        setTrinErrors((prev) => ({
                          ...prev,
                          ekspertise: undefined,
                        }));

                        const valgt = v[0];
                        const foreslåedeYdelser =
                          ekspertise_ydelser[valgt] ?? [];

                        setData((prev) => ({
                          ...prev,
                          ekspertise: v,
                          ydelser: [
                            ...prev.ydelser,
                            ...foreslåedeYdelser.filter(
                              (y) => !prev.ydelser.includes(y),
                            ),
                          ],
                        }));
                      }}
                      single={true}
                    />
                    {trinErrors.ekspertise && (
                      <p className={styles.fieldError}>
                        {trinErrors.ekspertise}
                      </p>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Servicetype <span className={styles.req}>*</span>
                    </label>
                    <MultiSelectDropdown
                      label="Servicetype"
                      options={servicetype_options}
                      selected={data.servicetype}
                      onChange={(v) => {
                        update("servicetype", v);
                        setTrinErrors((prev) => ({
                          ...prev,
                          servicetype: undefined,
                        }));
                      }}
                    />
                    {trinErrors.servicetype && (
                      <p className={styles.fieldError}>
                        {trinErrors.servicetype}
                      </p>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Branche <span className={styles.req}>*</span>
                    </label>
                    <MultiSelectDropdown
                      label="Branche"
                      options={branche_options}
                      selected={data.branche}
                      onChange={(v) => {
                        update("branche", v);
                        setTrinErrors((prev) => ({
                          ...prev,
                          branche: undefined,
                        }));
                      }}
                    />
                    {trinErrors.branche && (
                      <p className={styles.fieldError}>{trinErrors.branche}</p>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Sprog</label>
                    <MultiSelectDropdown
                      label="Sprog"
                      options={sprog_options}
                      selected={data.sprog}
                      onChange={(v) => update("sprog", v)}
                    />
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Geografisk dækning</label>
                    <MultiSelectDropdown
                      label="Geografisk dækning"
                      options={geoografi_options}
                      selected={data.geografi}
                      onChange={(v) => update("geografi", v)}
                    />
                  </div>
                </div>
                <div
                  className={styles.formGroup}
                  style={{ marginBottom: "24px" }}
                >
                  <label className={styles.label}>
                    Beskrivelse <span className={styles.req}>*</span>
                  </label>
                  <p className={styles.fieldHint}>
                    Beskriv din virksomhed og hvad I kan hjælpe med. Denne tekst
                    vises på din partnerprofil.
                  </p>
                  <textarea
                    value={data.beskrivelse}
                    onChange={(e) => {
                      update("beskrivelse", e.target.value);
                      setTrinErrors((prev) => ({
                        ...prev,
                        beskrivelse: undefined,
                      }));
                    }}
                    placeholder="Giv en kort beskrivelse af hvem I er og hvad I tilbyder..."
                    className={styles.textarea}
                    rows={5}
                  />
                  {trinErrors.beskrivelse && (
                    <p className={styles.fieldError}>
                      {trinErrors.beskrivelse}
                    </p>
                  )}
                </div>
                <div
                  className={styles.formGroup}
                  style={{ marginBottom: "24px" }}
                >
                  <label className={styles.label}>Dine ydelser</label>
                  <p className={styles.fieldHint}>
                    Søg og tilføj de specifikke ydelser din virksomhed tilbyder.
                  </p>
                  <ChipInput
                    value={data.ydelser}
                    onChange={(v) => update("ydelser", v)}
                  />
                </div>
                <hr className={styles.divider} />
                <div className={styles.navRow}>
                  <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() => setAktivtTrin(2)}
                  >
                    ← Tilbage
                  </button>
                  <button
                    type="button"
                    className={styles.nextBtn}
                    onClick={() => validerOgGåVidere(4)}
                  >
                    Næste trin →
                  </button>
                </div>
              </div>
            )}

            {/* trin 4 */}
            {aktivtTrin === 4 && (
              <div>
                <h2 className={styles.stepHeading}>
                  Certificeringer og dokumenter
                </h2>
                <p className={styles.stepDesc2}>
                  Angiv de certificeringer der skal fremgå af din partnerprofil,
                  og upload eventuelle dokumenter.
                </p>
                <div
                  className={styles.formGroup}
                  style={{ marginBottom: "32px" }}
                >
                  <label className={styles.label}>Certificeringer</label>
                  <div className={styles.certGrid}>
                    {certificering_options.map((cert) => (
                      <label key={cert} className={styles.checkLabel}>
                        <input
                          type="checkbox"
                          checked={data.certificeringer.includes(cert)}
                          onChange={() => {
                            const current = data.certificeringer;
                            update(
                              "certificeringer",
                              current.includes(cert)
                                ? current.filter((c) => c !== cert)
                                : [...current, cert],
                            );
                          }}
                          className={styles.checkbox}
                        />
                        {cert}
                      </label>
                    ))}
                  </div>
                </div>
                <div
                  className={styles.formGroup}
                  style={{ marginBottom: "32px" }}
                >
                  <label className={styles.label}>
                    Anden certificering (valgfrit)
                  </label>
                  <input
                    type="text"
                    value={data.andreCertificeringer}
                    onChange={(e) =>
                      update("andreCertificeringer", e.target.value)
                    }
                    placeholder="fx Certified DPO"
                    className={styles.input}
                  />
                </div>
                <hr className={styles.divider} />
                <div
                  className={styles.formGroup}
                  style={{ marginBottom: "32px" }}
                >
                  <label className={styles.label}>Dokumenter (valgfrit)</label>
                  <p className={styles.fieldHint}>
                    Upload certifikater eller anden dokumentation
                  </p>
                  <div
                    className={styles.uploadArea}
                    onClick={() => docInputRef.current?.click()}
                  >
                    <p className={styles.uploadText}>
                      Træk filer hertil eller klik for at uploade
                    </p>
                    <p className={styles.uploadSubtext}>PDF, PNG eller JPG</p>
                  </div>
                  <input
                    ref={docInputRef}
                    type="file"
                    multiple
                    accept=".pdf,image/*"
                    onChange={handleDocUpload}
                    className={styles.hiddenInput}
                  />
                  {data.dokumenter.length > 0 && (
                    <div className={styles.docList}>
                      {data.dokumenter.map((doc, i) => (
                        <div key={i} className={styles.docItem}>
                          <div className={styles.docIcon}>
                            <Image
                              src="/icons/document-yellow.svg"
                              alt=""
                              width={20}
                              height={20}
                            />
                          </div>
                          <div className={styles.docInfo}>
                            <p className={styles.docName}>{doc.name}</p>
                            <p className={styles.docMeta}>
                              {(doc.size / 1024).toFixed(0)} kb ·{" "}
                              {doc.type.split("/")[1].toUpperCase()}
                            </p>
                          </div>
                          <button
                            type="button"
                            className={styles.docSlet}
                            onClick={() =>
                              update(
                                "dokumenter",
                                data.dokumenter.filter((_, j) => j !== i),
                              )
                            }
                          >
                            Slet
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <hr className={styles.divider} />
                <div className={styles.navRow}>
                  <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() => setAktivtTrin(3)}
                  >
                    ← Tilbage
                  </button>
                  <button
                    type="button"
                    className={styles.nextBtn}
                    onClick={() => setAktivtTrin(5)}
                  >
                    Næste trin →
                  </button>
                </div>
              </div>
            )}

            {/* trin 5 */}
            {aktivtTrin === 5 && (
              <div>
                <h2 className={styles.stepHeading}>Tjek dine oplysninger</h2>
                <p className={styles.stepDesc2}>
                  Gennemgå dine oplysninger inden du opretter. Du kan stadig gå
                  tilbage og rette.
                </p>

                {/* Virksomhed */}
                <div className={styles.summaryHeader}>
                  <h3 className={styles.summaryTitle}>Virksomhed</h3>
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => setAktivtTrin(1)}
                  >
                    Rediger
                  </button>
                </div>
                <div className={styles.summarySection}>
                  <div className={styles.summaryGrid}>
                    {[
                      { label: "Virksomhedsnavn", value: data.virksomhedsnavn },
                      { label: "Vat-nummer", value: data.vat },
                      { label: "Hjemmeside", value: data.hjemmeside },
                      { label: "LinkedIn", value: data.linkedin },
                    ].map(
                      (row) =>
                        row.value && (
                          <div key={row.label} className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>
                              {row.label}
                            </span>
                            <span className={styles.summaryValue}>
                              {row.value}
                            </span>
                          </div>
                        ),
                    )}
                    {data.logoUrl && (
                      <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Logo</span>
                        <Image
                          src={data.logoUrl}
                          alt="Logo"
                          width={80}
                          height={80}
                          className={styles.logoPreview}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Kontakt */}
                <div className={styles.summaryHeader}>
                  <h3 className={styles.summaryTitle}>Kontaktperson</h3>
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => setAktivtTrin(2)}
                  >
                    Rediger
                  </button>
                </div>
                <div className={styles.summarySection}>
                  <div className={styles.summaryGrid}>
                    {[
                      { label: "Fulde navn", value: data.kontaktNavn },
                      { label: "Stilling", value: data.kontaktStilling },
                      { label: "Arbejdsmail", value: data.kontaktMail },
                      { label: "Telefonnummer", value: data.kontaktTelefon },
                    ].map(
                      (row) =>
                        row.value && (
                          <div key={row.label} className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>
                              {row.label}
                            </span>
                            <span className={styles.summaryValue}>
                              {row.value}
                            </span>
                          </div>
                        ),
                    )}
                  </div>
                </div>

                {/* Ydelser */}
                <div className={styles.summaryHeader}>
                  <h3 className={styles.summaryTitle}>Ydelser</h3>
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => setAktivtTrin(3)}
                  >
                    Rediger
                  </button>
                </div>
                <div className={styles.summarySection}>
                  <div className={styles.summaryGrid}>
                    {[
                      {
                        label: "Ekspertiseområde",
                        value: data.ekspertise.join(", "),
                      },
                      {
                        label: "Servicetype",
                        value: data.servicetype.join(", "),
                      },
                      { label: "Branche", value: data.branche.join(", ") },
                      { label: "Sprog", value: data.sprog.join(", ") },
                      {
                        label: "Geografisk dækning",
                        value: data.geografi.join(", "),
                      },
                      { label: "Beskrivelse", value: data.beskrivelse },
                      { label: "Ydelser", value: data.ydelser.join(", ") },
                    ].map(
                      (row) =>
                        row.value && (
                          <div key={row.label} className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>
                              {row.label}
                            </span>
                            <span className={styles.summaryValue}>
                              {row.value}
                            </span>
                          </div>
                        ),
                    )}
                  </div>
                </div>

                {/* Certificeringer */}
                <div className={styles.summaryHeader}>
                  <h3 className={styles.summaryTitle}>
                    Certificeringer og dokumenter
                  </h3>
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => setAktivtTrin(4)}
                  >
                    Rediger
                  </button>
                </div>
                <div className={styles.summarySection}>
                  <div className={styles.summaryGrid}>
                    {[
                      {
                        label: "Certificeringer",
                        value: [
                          ...data.certificeringer,
                          ...(data.andreCertificeringer
                            ? [data.andreCertificeringer]
                            : []),
                        ].join(", "),
                      },
                      {
                        label: "Dokumenter",
                        value: data.dokumenter.map((d) => d.name).join(", "),
                      },
                    ].map(
                      (row) =>
                        row.value && (
                          <div key={row.label} className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>
                              {row.label}
                            </span>
                            <span className={styles.summaryValue}>
                              {row.value}
                            </span>
                          </div>
                        ),
                    )}
                  </div>
                </div>

                <hr className={styles.divider} />
                <p className={styles.formNote}>
                  Ved at oprette din profil accepterer du .legals{" "}
                  <a
                    href="https://www.dotlegal.com/partner-terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.formNoteLink}
                  >
                    Partnervilkår
                  </a>{" "}
                  og{" "}
                  <a
                    href="https://www.dotlegal.com/en/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.formNoteLink}
                  >
                    Privatlivspolitik
                  </a>
                </p>
                <div className={styles.navRow}>
                  <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() => setAktivtTrin(4)}
                  >
                    ← Tilbage
                  </button>
                  <button
                    type="button"
                    className={styles.nextBtn}
                    onClick={handleSubmit}
                  >
                    Opret profil
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
