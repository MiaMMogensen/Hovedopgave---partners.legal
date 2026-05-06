"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { usePartners } from "@/app/usePartners";
import styles from "./page.module.css";
import { Suspense } from "react";

const filter_categories = [
  {
    key: "ekspertise",
    label: "Ekspertiseområde",
    options: [
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
    ],
  },
  {
    key: "servicetype",
    label: "Servicetype",
    options: [
      "Rådgivning",
      "Konsulentydelser",
      "Revision",
      "DPO-as-a-service",
      "Leverandørstyring",
      "Managed Services",
      "Juridisk rådgivning",
      "Implementering",
    ],
  },
  {
    key: "branche",
    label: "Branche",
    options: [
      "Finans",
      "Sundhedsvæsen",
      "Teknologi/IT",
      "Offentlig sektor",
      "Produktion",
      "E-handel",
      "Transport og logistik",
    ],
  },
  {
    key: "certificeringer",
    label: "Certificeringer",
    options: [
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
    ],
  },
  {
    key: "geografi",
    label: "Geografi",
    options: [
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
    ],
  },
  {
    key: "sprog",
    label: "Sprog",
    options: [
      "Dansk",
      "Engelsk",
      "Tysk",
      "Norsk",
      "Svensk",
      "Fransk",
      "Hollandsk",
      "Polsk",
    ],
  },
];

const sort_options = [
  { value: "anbefalet", label: "Anbefalet" },
  { value: "nyeste", label: "Nyeste" },
  { value: "alfabetisk", label: "Alfabetisk" },
];

const how_to = [
  {
    icon: "/icons/search.svg",
    title: "Søg og filtrer",
    description:
      "Brug søgning og filtre til at finde partnere der matcher din virksomheds behov.",
  },
  {
    icon: "/icons/contact.svg",
    title: "Tag kontakt",
    description:
      "Klik ind på en partner og kontakt dem direkte via deres kontaktoplysninger.",
  },
  {
    icon: "/icons/check-circle.svg",
    title: "Kom i gang",
    description: "Aftal et møde og få hjælp til dit compliance-arbejde.",
  },
];

function FilterGroup({ category, activeFilters, onToggle }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.filterGroup}>
      <button
        className={styles.filterGroupHeader}
        onClick={() => setIsOpen((p) => !p)}
      >
        <span
          className={`${styles.filterGroupArrow} ${isOpen ? styles.arrowOpen : ""}`}
        >
          ›
        </span>
        <span className={styles.filterGroupLabel}>{category.label}</span>
      </button>
      {isOpen && (
        <div className={styles.filterGroupOptions}>
          {category.options.map((option) => (
            <label key={option} className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={activeFilters.includes(option)}
                onChange={() => onToggle(option)}
                className={styles.checkbox}
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function PartnersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { partners, loading } = usePartners();

  const urlQuery = searchParams.get("q") || "";
  const [searchText, setSearchText] = useState(urlQuery);

  const [activeFilters, setActiveFilters] = useState(() => {
    const initial = {};
    filter_categories.forEach((c) => {
      initial[c.key] = [];
    });
    if (urlQuery) {
      filter_categories.forEach((c) => {
        const match = c.options.filter((o) =>
          o.toLowerCase().includes(urlQuery.toLowerCase()),
        );
        if (match.length) initial[c.key] = match;
      });
    }
    return initial;
  });

  const [sortBy, setSortBy] = useState("anbefalet");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allActiveFilters = Object.entries(activeFilters).flatMap(
    ([key, values]) => values.map((v) => ({ key, value: v })),
  );

  function toggleFilter(categoryKey, option) {
    setActiveFilters((prev) => {
      const current = prev[categoryKey];
      return {
        ...prev,
        [categoryKey]: current.includes(option)
          ? current.filter((v) => v !== option)
          : [...current, option],
      };
    });
  }

  function removeFilter(categoryKey, option) {
    setActiveFilters((prev) => ({
      ...prev,
      [categoryKey]: prev[categoryKey].filter((v) => v !== option),
    }));
  }

  function clearAll() {
    const empty = {};
    filter_categories.forEach((c) => {
      empty[c.key] = [];
    });
    setActiveFilters(empty);
    setSearchText("");
    router.replace("/partnere");
  }

  const filteredPartners = useMemo(() => {
    let result = partners.filter((p) => {
      const matchesText =
        !searchText ||
        p.virksomhedsnavn?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.ekspertise?.some((t) =>
          t.toLowerCase().includes(searchText.toLowerCase()),
        ) ||
        p.ydelser?.some((t) =>
          t.toLowerCase().includes(searchText.toLowerCase()),
        ) ||
        p.beskrivelse?.toLowerCase().includes(searchText.toLowerCase());

      const matchesFilters = filter_categories.every((cat) => {
        const active = activeFilters[cat.key];
        if (!active || active.length === 0) return true;
        const partnerValues = p[cat.key] ?? [];
        return active.some((f) => partnerValues.includes(f));
      });

      return matchesText && matchesFilters;
    });

    if (sortBy === "alfabetisk") {
      result = [...result].sort((a, b) =>
        a.virksomhedsnavn?.localeCompare(b.virksomhedsnavn),
      );
    }

    if (sortBy === "nyeste") {
      result = [...result].sort(
        (a, b) => (b.oprettetTimestamp ?? 0) - (a.oprettetTimestamp ?? 0),
      );
    }

    return result;
  }, [partners, searchText, activeFilters, sortBy]);

  const hasActiveFilters = allActiveFilters.length > 0 || searchText;

  return (
    <main>
      {/* hero */}
      <section className={styles.hero}>
        <p className={styles.catLabel}>Partnerunivers</p>
        <h1 className={styles.heroTitle}>Find en partner</h1>
        <p className={styles.heroDesc}>
          Søg og filtrer blandt alle godkendte .legal-partnere og find den rette
          ekspert til din virksomhed.
        </p>
        <div className={styles.heroSearch}>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Søg på navn eller kompetence..."
            className={styles.heroInput}
            autoComplete="off"
          />
        </div>
      </section>

      {/* filtrering og resultater */}
      <section className={styles.filterSection}>
        <div className={styles.inner}>
          <div className={styles.layout}>
            {/* venstre filterpanel */}
            <aside className={styles.sidebar}>
              <div className={styles.sidebarHeader}>
                <div className={styles.sidebarTitleRow}>
                  <Image
                    src="/icons/filter.svg"
                    alt=""
                    width={18}
                    height={18}
                  />
                  <p className={styles.sidebarTitle}>Filtre</p>
                </div>
              </div>
              {filter_categories.map((cat) => (
                <FilterGroup
                  key={cat.key}
                  category={cat}
                  activeFilters={activeFilters[cat.key]}
                  onToggle={(option) => toggleFilter(cat.key, option)}
                />
              ))}
            </aside>

            {/* resultater */}
            <div className={styles.results}>
              {/* Antal resultater og sortér dropdown */}
              <div className={styles.resultsHeader}>
                <p className={styles.resultCount}>
                  {loading
                    ? "Henter partnere..."
                    : `${filteredPartners.length} partner${filteredPartners.length !== 1 ? "e" : ""} fundet`}
                </p>
                <div className={styles.sortRow} ref={sortRef}>
                  <button
                    className={styles.sortDropdownBtn}
                    onClick={() => setSortOpen((p) => !p)}
                  >
                    <span className={styles.sortBtnLabel}>Sortér efter:</span>
                    {sort_options.find((o) => o.value === sortBy)?.label}
                    <span
                      className={`${styles.sortArrow} ${sortOpen ? styles.sortArrowOpen : ""}`}
                    >
                      ›
                    </span>
                  </button>
                  {sortOpen && (
                    <div className={styles.sortDropdown}>
                      {sort_options.map((o) => (
                        <button
                          key={o.value}
                          className={styles.sortOption}
                          onClick={() => {
                            setSortBy(o.value);
                            setSortOpen(false);
                          }}
                        >
                          <span
                            className={`${styles.sortCheck} ${sortBy === o.value ? styles.sortCheckActive : ""}`}
                          >
                            ✓
                          </span>
                          {o.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Aktive filtre som chips der kan klikkes væk */}
              {allActiveFilters.length > 0 && (
                <div className={styles.chipsRow}>
                  {allActiveFilters.map((f) => (
                    <span key={`${f.key}-${f.value}`} className={styles.chip}>
                      {f.value}
                      <button
                        className={styles.chipRemove}
                        onClick={() => removeFilter(f.key, f.value)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button className={styles.clearChips} onClick={clearAll}>
                    Ryd filtre
                  </button>
                </div>
              )}

              {/* Partnergrid — 2 kort per række */}
              {!loading && filteredPartners.length === 0 ? (
                <div className={styles.empty}>
                  <p>Ingen partnere matcher din søgning.</p>
                  <button className={styles.clearBtn} onClick={clearAll}>
                    Ryd filtre
                  </button>
                </div>
              ) : (
                <div className={styles.grid}>
                  {filteredPartners.map((p) => (
                    <div key={p.id} className={styles.partnerCard}>
                      <div className={styles.cardTop}>
                        {p.logo ? (
                          <Image
                            src={p.logo}
                            alt={p.virksomhedsnavn}
                            width={80}
                            height={80}
                            className={styles.partnerLogo}
                          />
                        ) : (
                          <div className={styles.logoFallback}>
                            {p.virksomhedsnavn?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className={styles.partnerName}>
                            {p.virksomhedsnavn}
                          </p>
                          <p className={styles.partnerLoc}>
                            <Image
                              src="/icons/location.svg"
                              alt=""
                              width={13}
                              height={13}
                            />
                            {p.geografi?.[0]}
                          </p>
                        </div>
                      </div>
                      <div className={styles.partnerTags}>
                        {p.ekspertise?.map((t) => (
                          <span key={t} className={styles.ptag}>
                            {t}
                          </span>
                        ))}
                      </div>
                      <p className={styles.partnerDesc}>{p.beskrivelse}</p>
                      <Link href={`/partnere/${p.id}`} className={styles.cta}>
                        Se profil
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* sådan finder du en partner */}
      <section className={styles.howTo}>
        <div className={styles.inner}>
          <h2 className={styles.howToTitle}>
            Sådan finder du den rette partner
          </h2>
          <div className={styles.howToGrid}>
            {how_to.map((s) => (
              <div key={s.title} className={styles.howToCard}>
                <div className={styles.howToIcon}>
                  <Image src={s.icon} alt="" width={35} height={35} />
                </div>
                <div>
                  <h3 className={styles.howToCardTitle}>{s.title}</h3>
                  <p className={styles.howToCardDesc}>{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function PartnersPage() {
  return (
    <Suspense fallback={<div>Henter partnere...</div>}>
      <PartnersContent />
    </Suspense>
  );
}
