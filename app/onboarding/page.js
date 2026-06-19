"use client"; /* klientkomponent der bruger tre hooks - useState til state, useRef til filupload-inputtet og useEffect til bekræftelsesdialigen */

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { db } from "@/app/firebaseConfig";
import { ref, push } from "firebase/database";
import styles from "./page.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation"; /* bruges til at navigere programmatisk i bekræftelsesdialogen */

/* array med de fem trin brugt til at generere progress-indikatoren */
/* defineret udenfor komponenten så de kun oprettes én gang */
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

/* et mapping-objekt der forbinder hvert ekspertiseområde med relevante ydelser */
/* når partneren vælger et ekspertiseområde bruges dette objekt til automatisk at foreslå relevante ydelser. Det sikrer ensartede data på tværs af alle partnere */
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

/* et objekt med tooltip-indhold per trin */
/* nøglerne er trinnumre og værdierne er arrays af tip-objekter */
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

/* tips_titles er et separat objekt med overskriften for hvert trins tooltip */
const tips_titles = {
  1: "Hvad skal du bruge?",
  2: "Hvem skal kontaktes?",
  3: "Tips til beskrivelsen",
  4: "Hvorfor certificeringer?",
};

/* en genanvendelig dropdown-komponent med en lokal open state */
/* single = false er en default prop-værdi - hvis single ikke angives er den false og dropdown tillader multiple valg */
function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
  single = false,
}) {
  const [open, setOpen] = useState(false);

  /* toggle håndterer to tilstande. Hvis single er true vælges kun ét element og dropdown lukkes. Hvis false tjekkes om elementet allerede er valgt - hvis ja fjernes det med .filter(), hvis nej tilføjes det med spread-operatoren */
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

  /* knappen viser enten placeholder-tekst eller de valgte værdier joined med komma */
  /* dropdown listen vises kun når open er true */
  /* hvert option er en label med en checkbox - det gør at hele labelområdet er klikbart */
  /* checked={selected.includes(opt)} binder checkboxen til state */
  return (
    <div className={styles.dropdownWrap}>
      <button
        type="button"
        className={`${styles.dropdownBtn} ${open ? styles.dropdownBtnOpen : ""}`}
        onClick={() => setOpen((p) => !p)}
        /* toggle til at åbne og lukke dropdown */
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
      {/* hvis dropdown er åben loopes over alle mulige valg og der laves en liste */}
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

/* suggestions beregnes direkte fra query - ikke i useMemo fordi den er simpel nok */
/* den filtrerer ydelser_suggestions til dem der indeholder søgeteksten og ikke allerede er valgt via !value.includes(s) */
/* komponenten modtager to props, value er det nuværende array af tilføjede ydelser og onChange er en callback funktion der kaldes når arrayet skal opdateres */
function ChipInput({ value, onChange }) {
  const [query, setQuery] = useState("");
  /* state til søgeteksten i inputfeltet */

  /* beregner forslag baseret på søgeteksten */
  /* hvis søgefeltet er tomt er suggestions et tomt array */
  /* hvis der er søgetekst filtreres ydelser_suggestions arrayet */
  /* den filtrerer ydelser_suggestions til dem der indeholder søgeteksten og ikke allerede er valgt via !value.includes(s) */
  const suggestions = query
    ? ydelser_suggestions.filter(
        (s) =>
          s.toLowerCase().includes(query.toLowerCase()) && !value.includes(s),
      )
    : [];

  /* add tilføjer et element til listen af ydelser hvis det ikke allerede er der og rydder søgefeltet */
  /* if (!value.includes(item)) tjekker om elementet ikke allerede er i listen — så der ikke kommer dubletter */
  /* onChange([...value, item]) kalder onChange callback-funktionen med et nyt array der indeholder alle de eksisterende ydelser spredt ud med ...value og det nye element item tilføjet til sidst */
  function add(item) {
    if (!value.includes(item)) onChange([...value, item]);
    setQuery("");
  }

  /* remove filtrerer elementet fra listen */
  function remove(item) {
    onChange(value.filter((v) => v !== item));
  }

  /* handleKeyDown lytter efter Enter-tasten - e.preventDefault() forhindrer formularindsendelse ved Enter */
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
        {/* forslagslisten vises kun hvis der er mindst ét forslag */}
        {suggestions.length > 0 && (
          <div className={styles.chipSuggestions}>
            {/* looper over forslagene og laver en knap for hvert. Når brugeren klikker på et forslag kaldes add(s) som tilføjer det til listen */}
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
      {/* chip rækken med de tilføjede ydelser vises kun hvis der er mindst én ydelse i listen */}
      {value.length > 0 && (
        <div className={styles.chipsRow}>
          {/* looper over de tilføjede ydelser og laver en chip for hver */}
          {value.map((v) => (
            <span key={v} className={styles.chip}>
              {v}
              <button
                type="button"
                className={styles.chipRemove}
                onClick={() => remove(v)}
                /* kalder remove funktionen med ydelsens navn når brugeren klikker x som filterer ydelsen fra listen */
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
  /* fire state-variabler */
  const [aktivtTrin, setAktivtTrin] = useState(1);
  /* styrer hvilket trin der vises */
  const [showTip, setShowTip] = useState(false); /* styrer tooltip visning */
  const [submitted, setSubmitted] = useState(false);
  /* bruges til at vise bekræftelsessiden og deaktivere bekræftelsesdialogen efter indsendelse */
  const [trinErrors, setTrinErrors] = useState({});
  /* et objekt med fejlbeskeder per felt */
  const router = useRouter();

  /* første useEffect håndterer hvad der sker når brugeren forsøger at forlade siden - lukke fanen, genindlæse siden eller navigere til en ekstern URL */
  /* e.returnValue = "" er nødvendigt i nogle browsere for at triggere dialogen */
  /* kører kun igen når aktivtTrin eller submitted ændrer sig */
  useEffect(() => {
    /* funktion der kører lige inden siden forlades */
    const handleBeforeUnload = (e) => {
      /* dialogen vises kun hvis brugeren er kommet forbi trin 1 og ikke allerede har indsendt formularen */
      if (aktivtTrin > 1 && !submitted) {
        e.preventDefault();
        /* forhindrer siden i at forlade med det samme */
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    /* tilføjer lytteren på hele vinduet så den fanger alle forsøg på at forlade siden */
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    /* cleanup funktionen der fjernet lytteren når komponenten unmountes så den ikke fortsætter med at køre i baggrunden */
  }, [aktivtTrin, submitted]);

  /* anden useEffect håndterer Next.js intern navigation via Links */
  /* e.target.closest("a") finder det nærmeste <a> element fra det klikkede element - det fungerer selv om brugeren klikker på et ikon inde i et link */
  /* href.startsWith("#") ekskluderer ankerlinks */
  /* true som tredjse argument til addEventListener bruger capture-fasen - det betyder eventet fanges inden det når linket og man kan forhindre navigation */
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

  /* et samlet state-objekt med alle formularfelter */
  /* arrays initialiseres som tomme arrays frem for strings */
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

  /* en ref til det skjulte fil-input - bruges til at trigge filvalg programmatisk når brugeren klikker på upload-området */
  const docInputRef = useRef(null);

  /* en hjælpefunktion der opdaterer et enkelt felt i data-objektet via computed property syntax */
  /* ...prev bevarer alle øvrige felter uændret */
  function update(field, value) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  /* Array.from(e.target.files) konverterer FileList - et browser-specifikt objekt - til et almindeligt JavaScript-array */
  /* de nye filer spredes ind i det ekisterende dokumenter array */
  /* docInputRef.current.value = "" nulstiller fil-inputtet så den samme fil kan vælges igen */
  function handleDocUpload(e) {
    const files = Array.from(e.target.files);
    setData((prev) => ({
      ...prev,
      dokumenter: [...prev.dokumenter, ...files],
    }));
    docInputRef.current.value = "";
  }

  /* validering er opdelt per trin */
  function validerOgGåVidere(næsteTrin) {
    const errors = {};

    /* trin 1 validerer virksomhedsnavn og VAT */
    /* regex til VAT - ^[A-Z]{0,2} tillader op til to store bogstaver i starten fx DK */
    /* \d{6,12}$ kæver 6-12 cifre */
    /* .replace(/\s/g, "") fjerne alle mellemrum inden validering så "DK 12 34 56 78" og "DK12345678" begge er gyldige */
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

    /* trin 3 validerer arrays ved at tjekke .length - et tomt array har length 0 hvilket er falsy */
    /* beskrivelsen valideres for minimumslængde på 20 tegn */
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

    /* hvis der er fejl sættes de i state og funktionen stoppes */
    /* ellers ryddes alle fejl og det næste trin aktiveres */
    if (Object.keys(errors).length > 0) {
      setTrinErrors(errors);
      return;
    }
    setTrinErrors({});
    setAktivtTrin(næsteTrin);
  }

  /* push opretter automatisk et unikt id for partneren i Firebase frem for set der kræver et manuelt id */
  /* kontaktoplysninger gemmes som et nested objekt */
  /* certificeringer kombineres med fritekst via spread-operatoren - data.andreCertificeringer ? [data.andreCertificeringer] : [] konverterer fritekststrengen til et array hvis den er udfyldt, ellers spredes et tomt array */
  /* systemfelter som status, featured, kompetencer og oprettetTimestamp tilføjes automatisk uden brugerinput */
  /* oprettet formateres som en læsbar streng via toLocaleDateString */
  /* setSubmitted(true) skifter til bekræftelsessiden */
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

  /* bekræftelsessiden */
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
          {/* progress-cirklen har tre tilstande styret af to ternære operatorer. Aktiv - det nuværende trin. Done - et tidligere trin. Default - et fremtidigt trin. Når et trin er gennemført vises et SVG flueben frem for trinnummeret */}
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
                {/* stregen mellem trin vises kun hvis det ikke er det sidste trin - index < TRIN.length - 1 */}
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
            {/* tooltip vises kun på trin 1-4 - aktivtTrin < 5 */}
            {/* onMouseEnter og onMouseLeave styrer visningen */}
            {/* tips[aktivtTrin] henter tips for det aktuelle trin fra tips-objektet ved hjælp af trinnumeret som nøgle */}
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
                    {/* onChange kører hver gang brugeren skriver noget i feltet */}
                    {/* update kalder update hjælpefunktionen med feltnavnet og den nye værdi - opdaterer virksomhedsnavn i data state objektet */}
                    {/* setTrinErrors rydder fejlbeskeden for virksomhedsnavn. ...prev bevarer alle øvrige fejlbeskeder uændret, kun virksomhedsnavn sættes til undefined */}
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
                    {/* onChange gør tre ting. Opdaterer ekspertise via update. Rydder fejlbeskeden. Henter de foreslåede ydelser fra ekspertise_ydelser mappingen med v[0] - det første valgte element */}
                    {/* ?? [] giver et tomt array som fallback. setData opdaterer både ekspertise og ydelser i én operation - .filter(y) => !prev.ydelser.includes(y)) sikrer at ingen ydelser tilføjes to gange */}
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
                    {/* looper over alle mulige certificeringer og laver en checkboks for hver */}
                    {certificering_options.map((cert) => (
                      <label key={cert} className={styles.checkLabel}>
                        <input
                          type="checkbox"
                          checked={data.certificeringer.includes(cert)}
                          /* binder checkboksen til state - checkboksen er markeret hvis certificeringen allerede er i data.certificeringer arrayet */
                          onChange={() => {
                            const current = data.certificeringer;
                            /* gemmer det nuværende certificeringer-array i en variabel så jeg kan arbejde med det */
                            update(
                              "certificeringer",
                              /* en ternær operator der enten fjerner eller tilføjer certificeringen */
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
                  {/* upload-området er en synlig div der ved klik programmatisk klikker på det skjulte fil-input via docInputRef.current?.click() */}
                  {/* ?. er optional chaining der undgår fejl hvis ref ikke er sat endnu */}
                  {/* multiple tillader valg af flere filet */}
                  {/* accept=".pdf,image/*" begrænser filtyper til PDF og billeder */}
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
                          {/* slet-knappen filterer dokumentet fra ved at sammenligne indekset j med det aktuelle indeks i */}
                          {/* _ er konventionen for en parameter der ikke bruges - her er det selve dokumentet som vi ikke behøver */}
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
                    {/* certificeringer kombineres igen med fritekstfelter via spread og joines til en kommasepareret streng */}
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
                      {
                        /* row.value && (...) viser kun rækken hvis der er en værdi - tomme felter vises ikke i opsummeringen */
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
