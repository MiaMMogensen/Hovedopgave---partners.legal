"use client"; /* siden er en klientkomponent fordi den bruger React hooks og håndterer brugerinteraktion */

import { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";

export default function AnsøgPage() {
  /* et enkelt state objekt der indeholder alle formularfelter. Det er en fordel frem for separate state-variabler per felt fordi det gør det nemmere at sende alle data salet til API'et */
  /* alle felter initialiseres som tomme strenge */
  const [form, setForm] = useState({
    navn: "",
    virksomhed: "",
    telefon: "",
    mail: "",
    region: "",
  });

  /* status kan være null, "loading", "success" eller "error" og styrer hvad der vises i UI'et */
  const [status, setStatus] = useState(null);
  /* errors et et objekt der indeholder fejlbeskeder per felt */
  const [errors, setErrors] = useState({});

  /* opdaterer det relevante felt i form-objektet baseret på inputfeltets name attribut */
  /* [e.target.name] er computed propety syntax - det bruger værdien af e.target.name som nøgle i objektet */
  /* ...prev bevarer alle øvrige felter uændret. Samtidig ryddes fejlbeskeden for det pågældende felt ved at sætte den til undefines - det giver brugeren øjeblikkelig feedback når de begynder at rette en fejl */
  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  }

  /* e.preventDefault() forhindrer browserens standard formularindsendelse der ville genindlæse siden */
  async function handleSubmit(e) {
    e.preventDefault();

    /* validerer navn i to trin. Første if tjekker om feltet er tomt - .trim() fjerner whitespace så et felt med kun mellemrum betragtes som tomt */
    /* else if tjekker om der er mindst to ord via .split(" ").length < 2 - det kræver både fornavn og efternavn */
    const newErrors = {};

    if (!form.navn.trim()) {
      newErrors.navn = "Udfyld dit fulde navn";
    } else if (form.navn.trim().split(" ").length < 2) {
      newErrors.navn = "Indtast både fornavn og efternavn";
    }

    if (!form.virksomhed.trim()) {
      newErrors.virksomhed = "Udfyld dit virksomhedsnavn";
    } else if (form.virksomhed.trim().length < 2) {
      newErrors.virksomhed = "Virksomhedsnavnet er for kort";
    }

    /* validerer telefonnummer med regex */
    /* ^\+? betyder at strengen må starte med et valgfrit plustegn */
    /* [\d\s\-]{8,}$ betyder mindst 8 tegn der er cifre /d. mellemrum /s eller bindestreger /-. */
    /* det tillader formater som +45 12 34 56 78 og 12345678 */
    if (!form.telefon.trim()) {
      newErrors.telefon = "Udfyld dit telefonnummer";
    } else if (!/^\+?[\d\s\-]{8,}$/.test(form.telefon.trim())) {
      newErrors.telefon = "Indtast et gyldigt telefonnummer";
    }

    /* validerer email med regex */
    if (!form.mail.trim()) {
      newErrors.mail = "Udfyld din arbejdsmail";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.mail.trim())) {
      newErrors.mail = "Indtast en gyldig mailadresse";
    }

    /* hvis der er fejl sættes error state til det nye fejlobjekt og funktionen stoppes */
    /* return er vigtigt - uden det ville koden fortsætte og forsøge at sende formularen */
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    /* rydder fejl og sætter status til "loading" så knappen viser "Sender..." og er deaktiveret */
    setErrors({});
    setStatus("loading");

    /* fetch sender en POST-request til API-routen med formulardata som JSON */
    /* JSON-stringify(form) konverterer form-objektet til en JSON-streng */
    /* res.ok er true hvis HTTP-statuskoden er 200-299 */
    /* try/catch fanger netværksfejl der opstår hvis requesten slet ikke kan sendes, fx hvis brugeren er offline */
    try {
      const res = await fetch("/api/send-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setStatus("success");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main>
      {/* hero-sektionen skjules når formularen er indsent succesfuldt */}
      {status !== "success" && (
        <>
          {/* hero */}
          <section className={styles.hero}>
            <div className={styles.heroInner}>
              <p className={styles.catLabel}>Partnerprogram</p>
              <h1 className={styles.heroTitle}>
                Ansøg om at blive partner i dag - det er gratis
              </h1>
              <p className={styles.heroDesc}>
                Er du interesseret i at blive partner? Kontakt os for et
                uforpligtende møde, hvor vi kan diskutere mulighederne for et
                fremtidigt samarbejde.
              </p>
            </div>
          </section>
        </>
      )}

      {/* formular */}
      {/* sektionens CSS-klasse skifter baseret på status - det giver mulighed for at style formularen og bekræftelsessiden forskelligt */}
      <section
        className={
          status === "success" ? styles.formSectionSuccess : styles.formSection
        }
      >
        <div className={styles.inner}>
          <div className={styles.formCard}>
            {/* den ternære operator viser enten bekræftelsessiden eller formularen baseret på status */}
            {status === "success" ? (
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
                <h2 className={styles.successTitle}>Tak for din henvendelse</h2>
                <p className={styles.successDesc}>
                  Vi har modtaget dine oplysninger og kontakter dig inden for 5
                  hverdage for at aftale et møde.
                </p>
                <hr className={styles.successDivider} />
                <p className={styles.nextStepsLabel}>Hvad sker der nu?</p>
                <div className={styles.nextSteps}>
                  {[
                    /* procestrinene er defineret inline som et array direkte i JSX og mappes til trin-elementer */
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
                      title: "Vi kontakter dig",
                      desc: "Vi ringer eller skriver til dig inden for 5 hverdage for at aftale et mødetidspunkt.",
                    },
                    {
                      num: "3",
                      done: false,
                      active: false,
                      title: "Møde med .legal",
                      desc: "Vi afklarer sammen om et partnerskab er det rette match for din virksomhed.",
                    },
                    {
                      num: "4",
                      done: false,
                      active: false,
                      title: "Onboarding-link på mail",
                      desc: "Hvis vi indgår en aftale sender vi dig et link til onboarding hvor du kan oprette din partnerprofil.",
                    },
                  ].map((step) => (
                    <div key={step.num} className={styles.nextStep}>
                      {/* CSS-klassen bestemmes af en nested ternær operator - hvis step.done er true bruges stepCircleDone, hvis step.active er true bruges stepCircleActive, ellers ingen ekstra klasse */}
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
                <div className={styles.oplysningerWrap}>
                  <p className={styles.oplysningerTitle}>Dine oplysninger</p>
                  <table className={styles.oplysningerTable}>
                    <tbody>
                      {/* viser brugerens indtastede oplysninger i en tabel */}
                      {/* ...(form.region ? [...] : []) er conditional spread - hvis region er udfyld spredes det ind i arrayet, ellers spredes et tomt array ind */}
                      {[
                        { label: "Navn", value: form.navn },
                        { label: "Virksomhed", value: form.virksomhed },
                        { label: "Arbejdsmail", value: form.mail },
                        { label: "Telefon", value: form.telefon },
                        ...(form.region
                          ? [{ label: "Region", value: form.region }]
                          : []),
                      ].map((row) => (
                        <tr key={row.label} className={styles.oplysningerRow}>
                          <td className={styles.oplysningerLabel}>
                            {row.label}
                          </td>
                          <td className={styles.oplysningerValue}>
                            {row.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <hr className={styles.successDivider} />
                <div className={styles.successActions}>
                  <Link href="/" className={styles.successBtnOutline}>
                    Tilbage til forsiden
                  </Link>
                  <Link
                    href="/bliv-partner"
                    className={styles.successBtnPrimary}
                  >
                    Læs mere om partnerprogrammet
                  </Link>
                </div>
              </div>
            ) : (
              /* noValidate på form-elementet deaktiverer browserens indbyggede validerens så min egen validering i handleSubmit bruges i stedet */
              <form onSubmit={handleSubmit} noValidate>
                <div className={styles.formGrid}>
                  {/* Række 1 */}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Fulde navn <span className={styles.required}>*</span>
                    </label>
                    {/* hvert inputfelt er kontrolleret — value={form.navn} binder feltet til state og onChange={handleChange} opdaterer state når brugeren skriver. name="navn" er det der gør at handleChange kan identificere hvilket felt der opdateres via e.target.name. CSS-klassen inputError tilføjes betinget hvis der er en fejl for det felt. Fejlbeskeden vises kun hvis errors.navn har en værdi.  */}
                    <input
                      type="text"
                      name="navn"
                      value={form.navn}
                      onChange={handleChange}
                      placeholder="fx. Mikkel Hansen"
                      className={`${styles.input} ${errors.navn ? styles.inputError : ""}`}
                    />
                    {errors.navn && (
                      <p className={styles.fieldError}>{errors.navn}</p>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Virksomhedsnavn <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      name="virksomhed"
                      value={form.virksomhed}
                      onChange={handleChange}
                      placeholder="fx Compliance Partners"
                      className={`${styles.input} ${errors.virksomhed ? styles.inputError : ""}`}
                    />
                    {errors.virksomhed && (
                      <p className={styles.fieldError}>{errors.virksomhed}</p>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Telefon <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="tel"
                      name="telefon"
                      value={form.telefon}
                      onChange={handleChange}
                      placeholder="fx. +45 12 34 56 78"
                      className={`${styles.input} ${errors.telefon ? styles.inputError : ""}`}
                    />
                    {errors.telefon && (
                      <p className={styles.fieldError}>{errors.telefon}</p>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Arbejdsmail <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="email"
                      name="mail"
                      value={form.mail}
                      onChange={handleChange}
                      placeholder="fx mikkelhansen@mail.dk"
                      className={`${styles.input} ${errors.mail ? styles.inputError : ""}`}
                    />
                    {errors.mail && (
                      <p className={styles.fieldError}>{errors.mail}</p>
                    )}
                  </div>

                  {/* Række 3 */}
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Stat / Region</label>
                    <input
                      type="text"
                      name="region"
                      value={form.region}
                      onChange={handleChange}
                      placeholder="fx. Region Midtjylland"
                      className={styles.input}
                    />
                  </div>
                </div>

                <hr className={styles.divider} />

                <p className={styles.formNote}>
                  Ved at klikke på opret nedenfor accepterer du .legals{" "}
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

                <div className={styles.submitWrap}>
                  {/* knappen er dekativeret mens formularen sendes via disabled={status === "loading"}. Teksten skifter dynamisk baseret på status */}
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? "Sender..." : "Indsend ansøgning"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
