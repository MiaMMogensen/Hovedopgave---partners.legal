import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div style={{ position: "relative" }}>
          <div className={styles.blobTop}></div>
          <Image
            src="/img/logo.svg"
            alt=".legal partners logo"
            width={200}
            height={60}
            loading="eager"
          />
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>Info</h4>
          <p>.legal A/S</p>
          <p>hello@dotlegal.com</p>
          <p>+45 7027 0127</p>
          <p>CVR: 40888888</p>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>Kontor</h4>
          <p>Aarhus</p>
          <p>
            Store Torv 14, 2. sal
            <br />
            8000 Aarhus C
          </p>
        </div>

        <div className={styles.col} style={{ position: "relative" }}>
          <div className={styles.blobBottom}></div>
          <h4 className={styles.colTitle}>For Kunder</h4>
          <Link href="/find-partner">Find en partner</Link>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>For Partnere</h4>
          <Link href="/bliv-partner">Bliv partner</Link>
          <Link href="/bliv-partner#fordele">Partnerfordele</Link>
          <Link href="/login">Partnerportal</Link>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>
          .legal er ikke en advokatvirksomhed og er derfor ikke under tilsyn af
          Advokatrådet.
        </p>
        <div className={styles.bottomLinks}>
          <Link href="#">Terms</Link>
          <Link href="#">Security</Link>
          <Link href="#">Privacy policy</Link>
          <Link href="#">Cookie policy</Link>
          <Link href="#">Help center</Link>
        </div>
      </div>
    </footer>
  );
}
