"use client"; /* klientkomponent fordi den bruger React hooks og håndterer brugerinteraktion */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth, db } from "@/app/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth"; /* Firebase Authentication-funktion der verificerer email og adgangskode */
import {
  ref,
  get,
} from "firebase/database"; /* get bruges til en enkelt læsning fra databasen - i modsætning til onValue opretter get ikke en realtidslytter men henter data én gang */
import styles from "./page.module.css";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  /* Next-js router bruges til at navigere brugeren til den rette side efter login */
  /* fire state-variabler - email og password til formularfelterne, erros til fejlbeskeder og loading til at deaktivere knappen og vise "Logger ind..." mens login-processen kører */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);

  /* e.preventDefault() forhindrer siden i at genindlæses */
  /* setErros({}) rydder alle tidligere fejlbeskeder inden ny validering */
  async function handleLogin(e) {
    e.preventDefault();
    setErrors({});

    /* klientside validering køres inden Firebase kontaktes. Det sparer et unødvendigt API-kald hvis felterne er tomme */
    /* email valideres med regex */
    /* password valideres kun for om det er tomt - selve korrekthedstjekket sker i firebase */
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Udfyld din email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Indtast en gyldig mailadresse";
    }
    if (!password.trim()) {
      newErrors.password = "Udfyld din adgangskode";
    }

    /* hvis der er fejl sættes de i state og funktionen stoppes. Ellers sættes loading til true */
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true); /* ellers sættes loading til true */

    /* kalder Firebase Authentication med email og adgangskode */
    /* hvis login lykkes returneres et userCredential objekt */
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const uid = userCredential.user.uid;
      /* uid er brugerens unikke id i Firebase Authentication */

      /* opretter en reference til brugerens node i Realtime Database og henter data én gang med get */
      /* det er en enkelt læsning frem for en realtidslytter fordi man kun har brug for rollen én gang ved login */
      const userRef = ref(db, `users/${uid}`);
      const snapshot = await get(userRef);

      /* tjekker om brugeren eksisterer i databasen */
      /* det er muligt at en bruger eksisterer i Firabse Authentication men ikke i Realtime Database, fx hvis noget gik galt ved oprettelsen. I det tilfælde vises en fejlbesked og loading sættes tilbage til false */
      if (!snapshot.exists()) {
        setErrors({
          general: "Bruger ikke fundet i systemet. Kontakt support.",
        });
        setLoading(false);
        return;
      }

      /* destrukturer rollen fra databasedata */
      /* baseret på rollen navigeres brugeren til den rette portal */
      /* hvis rollen hverken er "admin" eller "partner", fx hvis der er en stavefejl i databasen, vises en fejlbesked */
      const { rolle } = snapshot.val();
      if (rolle === "admin") router.push("/admin");
      else if (rolle === "partner") router.push("/partner-portal");
      else setErrors({ general: "Ukendt brugerrolle. Kontakt support." });
      /*catch fanger Firebase-fejl der opstår under login. Fejlkoderne er specifikke strenge som Firebase returnerer */
      /* auth/user-not-found og auth/wrong-password er ældre fejlkoder og auth/invalid-credential er den nyere der dækker begge tilfælde — alle tre giver den samme brugervenlige fejlbesked. auth/too-many-requests opstår når Firebase blokerer login efter for mange fejlede forsøg. Den generelle fejl fanger alt andet. setLoading(false) er vigtigt her — uden det ville knappen forblive deaktiveret efter en fejl */
    } catch (err) {
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setErrors({ general: "Forkert email eller adgangskode. Prøv igen." });
      } else if (err.code === "auth/too-many-requests") {
        setErrors({ general: "For mange forsøg. Prøv igen om lidt." });
      } else {
        setErrors({ general: "Noget gik galt. Prøv igen." });
      }
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.loginWrap}>
        <div className={styles.iconWrap}>
          <Image src="/icons/login.svg" alt="" width={35} height={35} />
        </div>

        <h1 className={styles.title}>Log ind</h1>
        <p className={styles.desc}>Log ind på partnerportalen</p>

        {/* noValidate deaktiverer browserens indbyggede validering så min egen validering bruges i stedet */}
        <form onSubmit={handleLogin} className={styles.form} noValidate>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            {/* input feltet er kontrolleret via value={email} */}
            <input
              type="email"
              value={email}
              /* onChange opdaterer email-state og rydder fejlbeskeden for email-feltet via spread-operatoren */
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({
                  ...prev,
                  email: undefined,
                })); /* ...prev bevarer øvrige fejl */
              }}
              placeholder="fx navn@virksomhed.dk"
              className={`${styles.input} ${errors.email ? styles.inputError : ""}`} /* CSS-klassen inputerror tilføjes betinget. Fejlbeskeden vises kun hvis errors.email har en værdi */
            />
            {errors.email && <p className={styles.errorMsg}>{errors.email}</p>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Adgangskode</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="••••••••"
              className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
            />
            {errors.password && (
              <p className={styles.errorMsg}>{errors.password}</p>
            )}
            <Link href="#" className={styles.forgotLink}>
              Glemt adgangskode?
            </Link>
          </div>

          {/* general-fejlen vises uden for de individuelle felter - den bruges til Firebase-fejl der ikke er knyttet til et specifikt felt */}
          {errors.general && (
            <p className={styles.errorMsg}>{errors.general}</p>
          )}

          {/* knappen er deaktiveret mens loading er true og teksten skifter til "Logger ind..." for at give brugeren visuel feedback */}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Logger ind..." : "Log ind"}
          </button>
        </form>

        {/* en visuel separator med teksten "eller" i midten og streger på begge sider. Stregerne er spans der styles med CSS til at se ud som linjer */}
        <div className={styles.dividerRow}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>eller</span>
          <span className={styles.dividerLine} />
        </div>

        <p className={styles.signupText}>
          Ikke partner endnu?{" "}
          <Link href="/book-mode" className={styles.signupLink}>
            Ansøg om partnerskab
          </Link>
        </p>
      </div>
    </main>
  );
}
