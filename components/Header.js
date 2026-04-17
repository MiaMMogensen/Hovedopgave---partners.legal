"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";

export default function Header() {
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
        <Link href="/find-partner" className={styles.navLink}>
          Find en partner
        </Link>
        <Link href="/bliv-partner" className={styles.navLink}>
          Bliv partner
        </Link>
        <Link href="/login" className={styles.navBtn}>
          <Image
            src="/icons/login.png"
            alt="partners.legal logo"
            width={12}
            height={16}
            className={styles.logo}
          />
          Log ind
        </Link>
      </nav>
    </header>
  );
}
