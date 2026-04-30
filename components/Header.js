"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";
import { useEffect, useState } from "react";
import { auth } from "@/app/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

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
