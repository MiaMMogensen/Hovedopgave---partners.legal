"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth, db } from "@/app/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";
import styles from "./page.module.css";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Udfyld din email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Indtast en gyldig mailadresse";
    }
    if (!password.trim()) {
      newErrors.password = "Udfyld din adgangskode";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const uid = userCredential.user.uid;
      const userRef = ref(db, `users/${uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        setErrors({
          general: "Bruger ikke fundet i systemet. Kontakt support.",
        });
        setLoading(false);
        return;
      }

      const { rolle } = snapshot.val();
      if (rolle === "admin") router.push("/admin");
      else if (rolle === "partner") router.push("/partner-portal");
      else setErrors({ general: "Ukendt brugerrolle. Kontakt support." });
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

        <form onSubmit={handleLogin} className={styles.form} noValidate>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="fx navn@virksomhed.dk"
              className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
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

          {errors.general && (
            <p className={styles.errorMsg}>{errors.general}</p>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Logger ind..." : "Log ind"}
          </button>
        </form>

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
