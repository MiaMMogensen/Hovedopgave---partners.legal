"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";

export default function AnsøgPage() {
  const [form, setForm] = useState({
    navn: "",
    virksomhed: "",
    telefon: "",
    mail: "",
    region: "",
  });
  const [status, setStatus] = useState(null);

  const [errors, setErrors] = useState({});

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

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

    if (!form.telefon.trim()) {
      newErrors.telefon = "Udfyld dit telefonnummer";
    } else if (!/^\+?[\d\s\-]{8,}$/.test(form.telefon.trim())) {
      newErrors.telefon = "Indtast et gyldigt telefonnummer";
    }

    if (!form.mail.trim()) {
      newErrors.mail = "Udfyld din arbejdsmail";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.mail.trim())) {
      newErrors.mail = "Indtast en gyldig mailadresse";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStatus("loading");

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
      <section
        className={
          status === "success" ? styles.formSectionSuccess : styles.formSection
        }
      >
        <div className={styles.inner}>
          <div className={styles.formCard}>
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
              <form onSubmit={handleSubmit} noValidate>
                <div className={styles.formGrid}>
                  {/* Række 1 */}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Fulde navn <span className={styles.required}>*</span>
                    </label>
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
                  <a href="/partnervilkaar" className={styles.formNoteLink}>
                    Partnervilkår
                  </a>{" "}
                  og{" "}
                  <a href="/privatlivspolitik" className={styles.formNoteLink}>
                    Privatlivspolitik
                  </a>
                </p>

                <div className={styles.submitWrap}>
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
