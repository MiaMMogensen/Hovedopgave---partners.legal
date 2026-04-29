"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePartners } from "@/app/usePartners";
import styles from "./page.module.css";

const status_filters = ["Alle", "Aktivering", "Aktiv", "På pause", "Afsluttet"];

const status_colors = {
  Aktivering: styles.statusAktivering,
  Aktiv: styles.statusAktiv,
  "På pause": styles.statusPause,
  Afsluttet: styles.statusAfsluttet,
};

const kundecase_colors = {
  "Ikke startet": styles.kundecaseIkke,
  Identificeret: styles.kundecaseIdentificeret,
  "I gang": styles.kundecaseIgang,
  Gennemført: styles.kundecaseGennemfort,
};

export default function AdminPage() {
  const { partners, loading } = usePartners();
  const [activeFilter, setActiveFilter] = useState("Alle");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    return {
      Aktivering: partners.filter((p) => p.status === "Aktivering").length,
      Aktiv: partners.filter((p) => p.status === "Aktiv").length,
      "På pause": partners.filter((p) => p.status === "På pause").length,
      Afsluttet: partners.filter((p) => p.status === "Afsluttet").length,
    };
  }, [partners]);

  const filtered = useMemo(() => {
    return partners.filter((p) => {
      const matchesFilter =
        activeFilter === "Alle" || p.status === activeFilter;
      const matchesSearch =
        !search ||
        p.virksomhedsnavn?.toLowerCase().includes(search.toLowerCase()) ||
        p.kontakt?.email?.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [partners, activeFilter, search]);

  return (
    <div className={styles.layout}>
      {/* sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <p className={styles.sidebarTitle}>Adminpanel</p>
          <p className={styles.sidebarDesc}>Administrer partnere</p>
          <div className={styles.sidebarNav}>
            <div className={`${styles.navItem} ${styles.navItemActive}`}>
              <Image src="/icons/profile.svg" alt="" width={16} height={16} />
              Partnere
            </div>
          </div>
        </div>

        {/* Stats kort */}
        <div className={styles.statCards}>
          <div className={`${styles.statCard} ${styles.statCardAktivering}`}>
            <p className={styles.statLabel}>Aktivering</p>
            <p className={styles.statNum}>{counts.Aktivering}</p>
          </div>
          <div className={`${styles.statCard} ${styles.statCardAktiv}`}>
            <p className={styles.statLabel}>Aktive</p>
            <p className={styles.statNum}>{counts.Aktiv}</p>
          </div>
          <div className={`${styles.statCard} ${styles.statCardPause}`}>
            <p className={styles.statLabel}>På pause</p>
            <p className={styles.statNum}>{counts["På pause"]}</p>
          </div>
          <div className={`${styles.statCard} ${styles.statCardAfsluttet}`}>
            <p className={styles.statLabel}>Afsluttet</p>
            <p className={styles.statNum}>{counts.Afsluttet}</p>
          </div>
        </div>

        <div className={styles.sidebarUser}>
          <div className={styles.userAvatar}>BØ</div>
          <div>
            <p className={styles.userName}>Brian Østberg</p>
            <p className={styles.userOrg}>.legal</p>
          </div>
        </div>
      </aside>

      {/* indhold */}
      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <h1 className={styles.pageTitle}>Partneroversigt</h1>
          <p className={styles.pageDesc}>Administrer dine partnere.</p>
        </div>

        {/* Filtre + søgning */}
        <div className={styles.filterBar}>
          <div className={styles.filterBtns}>
            {status_filters.map((f) => (
              <button
                key={f}
                className={`${styles.filterBtn} ${activeFilter === f ? styles.filterBtnActive : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className={styles.searchWrap}>
            <Image src="/icons/search.svg" alt="" width={16} height={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Søg partner..."
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Tabel */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHead}>
                <th>Partner</th>
                <th>Kompetencer</th>
                <th>Partnerstatus</th>
                <th>Første kundecase</th>
                <th>Oprettet</th>
                <th>Handling</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className={styles.loading}>
                    Henter partnere...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.loading}>
                    Ingen partnere fundet
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className={styles.tableRow}>
                    <td>
                      <p className={styles.partnerName}>{p.virksomhedsnavn}</p>
                      <p className={styles.partnerEmail}>
                        <Image
                          src="/icons/email.svg"
                          alt=""
                          width={12}
                          height={12}
                        />
                        {p.kontakt?.email}
                      </p>
                    </td>
                    <td>
                      <div className={styles.kompetencerWrap}>
                        {(p.kompetencer ?? []).slice(0, 3).map((k) => (
                          <span key={k} className={styles.kompetenceTag}>
                            {k}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${status_colors[p.status] ?? ""}`}
                      >
                        <span className={styles.statusDot} />
                        {p.status ?? "—"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.kundecaseBadge} ${kundecase_colors[p.forsteKundecase] ?? ""}`}
                      >
                        {p.forsteKundecase ?? "Ikke startet"}
                      </span>
                    </td>
                    <td className={styles.oprettetCell}>{p.oprettet ?? "—"}</td>
                    <td>
                      <Link href={`/admin/${p.id}`} className={styles.seBtn}>
                        Se partner
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
