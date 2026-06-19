/* globale navigation der vises øverst på alle sider via layout.js */
/* den lytter på Firebase Authentication og skifter dynamisk mellem "Log ind" og "Log ud" baseret på om brugeren er logget ind */

"use client"; /* klientkomponent fordi den bruger hooks og lytter på Firebase Authentication */

import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";
import { useEffect, useState } from "react";
import { auth } from "@/app/firebaseConfig";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth"; /* onAuthStateChanged lytter på login-state. signOut logger brugeren ud */
import { useRouter } from "next/navigation";

export default function Header() {
  const [user, setUser] =
    useState(
      null,
    ); /* er null når ingen er logget ind og et Firebase user objekt når nogen er logget ind */
  const router =
    useRouter(); /* bruges til at navigere til login siden efter logout */

  /* opretter en realtidslytter på Firebase Authentication */
  /* setUser sendes direkte som callback - det er en kortere måde at skrive (user) => setUser(user) */
  /* når en bruger logger ind eller ud kaldes setUser automatisk med det nye user objekt eller null */
  /* cleanup funktionen fjerner lytteren når headeren unmountes */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  /* logger brugeren ud via Firabse og navigerer til login siden */
  /* await sikrer at logout er gennemført inden navigationen sker */
  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <Image
          src="/img/logo.svg"
          loading="eager"
          alt="partners.legal logo"
          width={150}
          height={112}
          className={styles.logo}
        />
      </Link>
      <nav className={styles.nav}>
        <Link href="/partnere" className={styles.navLink}>
          Find en partner
        </Link>
        <Link href="/bliv-partner" className={styles.navLink}>
          Bliv partner
        </Link>
        {/* ternær operator der viser enten en "Log ud" knap eller et "Log ind" link baseret på user state. Begge bruger samme styling via navBtn klassen og samme ikon - det eneste der ændrer sig er teksten og handlingen */}
        {user ? (
          <button onClick={handleLogout} className={styles.navBtn}>
            <Image src="/icons/login.png" alt="" width={12} height={16} />
            Log ud
          </button>
        ) : (
          <Link href="/login" className={styles.navBtn}>
            <Image src="/icons/login.png" alt="" width={12} height={16} />
            Log ind
          </Link>
        )}
      </nav>
    </header>
  );
}
