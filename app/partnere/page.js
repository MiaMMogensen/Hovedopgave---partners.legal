"use client";

import {
  useState,
  useMemo,
  useRef,
  useEffect,
} from "react"; /* fire hooks fra React */
import {
  useSearchParams,
  useRouter,
} from "next/navigation"; /* useSearchParams til at læse URL-parametre og useRouter til at navigere programmatisk */
import Link from "next/link";
import Image from "next/image";
import { usePartners } from "@/app/usePartners";
import styles from "./page.module.css";
import { Suspense } from "react"; /* importeres fordi useSearchParams kræver at komponenten er pakket ind i en Suspense-grænse */

/* et array af objekter der definerer alle filterkategorier */
/* hvert objekt har en key der matcher feltet i partnerobjektet, en visningstlabel og et array af mulige værdier */
/* ved at definere filtrene som data kan man nemt tilføje eller fjerne kategorier uden at ændre i filtreringslogikken */
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

/* to sorteringsmuligheder. value bruges i logikken og label vises i UI'et */
const sort_options = [
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

/* en genanvendelig komponent der renderes én gang per filterkategori */
function FilterGroup({ category, activeFilters, onToggle }) {
  const [isOpen, setIsOpen] = useState(true);
  /* starter som true så alle filtergrupper er åbne som standard */

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
      {/* {isOpen && (...)} skjuler options-listen når gruppen er lukket */}
      {isOpen && (
        <div className={styles.filterGroupOptions}>
          {category.options.map((option) => (
            <label key={option} className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={activeFilters.includes(option)}
                /* activeFilters.includes(option) binder checkboxen til den aktive filter-state i forælderkomponenten */
                onChange={() => onToggle(option)}
                /* onToggle er en callback-funktion der kaldes med option-værdien - det er props-drilling frem for at håndtere state lokalt */
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
  /* læser URL-parametre - ?q=GDPR giver urlQuery = "GDPR" */
  const router = useRouter();

  const { partners, loading } = usePartners();

  /* søgeteksten initialiseres med URL-parameteret så siden kan linkes til med en forudvalgt søgning */
  const urlQuery = searchParams.get("q") || "";
  const [searchText, setSearchText] = useState(urlQuery);

  /* useState med en initializer-funktion - den kører kun én gang ved mount frem for ved hver render */
  /* hvis der er et URL-query forsøger den at matche det mod filter-options og forforudfylder de matchende filtre */
  const [activeFilters, setActiveFilters] = useState(() => {
    /* opretter et tomt objekt der gradvist fyldes med filterkategorier */
    const initial = {};
    /* opretter et tomt array for hver filterkategori, hvilket sikrer at alle kategorier eksisterer fra start */
    filter_categories.forEach((c) => {
      initial[c.key] = [];
    });
    /* tjekker om der er et søgeord i URL'en */
    if (urlQuery) {
      /* hvis der er et URL søgeord gennemgås alle filterkategorier og deres options filtreres efter om de indeholder søgeordet */
      filter_categories.forEach((c) => {
        const match = c.options.filter((o) =>
          o.toLowerCase().includes(urlQuery.toLowerCase()),
        );
        /* hvis der er matches sættes de som aktive filtre */
        if (match.length) initial[c.key] = match;
      });
    }
    /* returnerer det færdige filter objekt som startværdi for activeFilters state */
    return initial;
  });

  const [sortBy, setSortBy] = useState("nyeste");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);
  /* en ref der peger på sorterings-dropdown containeren */

  /* useEffect lytter på klik på hele dokumentet og lukker dropdown hvis klikket sker uden for containeren */
  /* sortRef.current.contains(e.target) tjekker om det klikkede element er et barn af dropdown-containeren */
  /* cleanup-funktionen fjerner lytteren */
  useEffect(() => {
    function handleClickOutside(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* konverterer det nestede filter-objekt til et fladt array af { key, value } objekter */
  /* Object.entries giver [["ekspertise", ["GDPR]], ["branche", ["Finans"]]] */
  const allActiveFilters = Object.entries(activeFilters).flatMap(
    /* .flatMap mapper hvert entry til et array af objekter og flader dem ud. Resultatet bruges til at vise de aktive filtre som chips og til at tjekke om der er aktive filtre */
    ([key, values]) => values.map((v) => ({ key, value: v })),
  );

  /* tilføjer eller fjerner en filterværdi fra én specifik filterkategori */
  /* opdaterer én filterkategori - tilføjer eller fjerner en option */
  /* ...prev bevarer alle øvrige kategorier uændret */
  /* [categoryKey] er computed property syntax der bruger kategorinøglen dynamisk */
  function toggleFilter(categoryKey, option) {
    /* opdaterer filter state med en funktion der tager den nuværende state som prev - det sikrer at vi altid arbejder med den nyeste state */
    setActiveFilters((prev) => {
      /* henter det nuværende array af aktive filtre for den specifikke kategori */
      const current = prev[categoryKey];
      return {
        ...prev,
        /* computed propety syntax der opdaterer kun den specifikke kategori dynamisk */
        /* den ternære operator tjekker om optionen allerede er aktiv - hvis ja filtreres den fra, hvis nej tilføjes den med spread operatoren */
        [categoryKey]: current.includes(option)
          ? current.filter((v) => v !== option)
          : [...current, option],
      };
    });
  }

  /* fjerner kun én specifik option fra én kategori - bruges når brugeren klikker x på et chip */
  function removeFilter(categoryKey, option) {
    setActiveFilters((prev) => ({
      ...prev,
      [categoryKey]: prev[categoryKey].filter((v) => v !== option),
    }));
  }

  /* nulstiller alle filtre og søgetekst og fjerne URL-parametre via router-replace - replace frem for push så den ryddede tilstand ikke tilføjes til browser-historikken */
  function clearAll() {
    const empty = {};
    filter_categories.forEach((c) => {
      empty[c.key] = [];
    });
    setActiveFilters(empty);
    setSearchText("");
    router.replace("/partnere");
  }

  /* matchesText er true hvis søgefeltet er tomt eller søgeteksten matches i ét af fire felter */
  /* .some() på arrays tjekker om mindst ét element matcher - det er effektivt fordi den stopper så snart den finder et match */
  /* useMemo cacher filtreringsresultatet så det kun genberegnes når en af dependencies ændrer sig og ikke ved hver render */
  const filteredPartners = useMemo(() => {
    /* filtrerer alle partnere og beholder kun dem der matcher både søgetekst og aktive filtre. let frem for const forsi result sorteres bagefter */
    let result = partners.filter((p) => {
      /* !searchtext er true hvis søgefeltet er tomt, så vises alle partnere uden at tjekke de øvrige betingelser */
      const matchesText =
        !searchText ||
        /* tjekker om søgeteksten findes i virksomhedsnavnet */
        p.virksomhedsnavn?.toLowerCase().includes(searchText.toLowerCase()) ||
        /* tjekker om søgeteksten indeholder mindst ét element i ekspertise arrayet */
        p.ekspertise?.some((t) =>
          t.toLowerCase().includes(searchText.toLowerCase()),
        ) ||
        p.ydelser?.some((t) =>
          t.toLowerCase().includes(searchText.toLowerCase()),
        ) ||
        p.beskrivelse?.toLowerCase().includes(searchText.toLowerCase());
      /* matchestext er true hvis bare ét af de fire filter matcher søgeteksten */

      /* tjekker om partnern matcher alle aktive filterkategorier */
      /* .every() returnerer kun true hvis alle kategorier returnerer true - én kategori der ikke matcher er nok til at partneren filtreres fra */
      const matchesFilters = filter_categories.every((cat) => {
        /* henter de aktive filtre for den specifikke kategori */
        const active = activeFilters[cat.key];
        /* hvis ingen filtre er aktive i denne kategori returneres true automatisk */
        if (!active || active.length === 0) return true;
        /* henter partnerens værdier for den specifikke kategori med ?? [] som fallback hvis feltet ikke eksisterer */
        const partnerValues = p[cat.key] ?? [];
        /* tjekker om partneren har mindst én af de valgte filterværdier. Partneren skal bare have én af de valgte værdier */
        return active.some((f) => partnerValues.includes(f));
      });
      /* partneren vises kun hvis begge betingelser er opfyldt */
      return matchesText && matchesFilters;
    });

    /* [...result] laver en kopi inden sorteringen - man må ikke mutere det originale array direkte */
    /* .localeCompare håndterer dansk alfabetisk sortering korrekt - det tager hensyn til specialtegn som æ, ø, å */
    if (sortBy === "alfabetisk") {
      result = [...result].sort((a, b) =>
        a.virksomhedsnavn?.localeCompare(b.virksomhedsnavn),
      );
    }

    /* nyeste sorterer efter oprettetTimestamp i faldende rækkefølge. ?? 0 giver fallback hvis timestamp mangler */
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
            autoComplete="off" /* deaktiverer browserens autofuldførelse da den kan forstyrre søgeoplevelsen */
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
              {/* looper over alle filterkategorier og laver en FilterGroup komponent for hver */}
              {filter_categories.map((cat) => (
                <FilterGroup
                  /* unik nøgle til React så den kan identificere hvert element i listen */
                  key={cat.key}
                  /* sender hele kategori objektet ned som prop - indeholder label og options */
                  category={cat}
                  /* sender kun de aktive filtre for den specifikke kategori ned */
                  activeFilters={activeFilters[cat.key]}
                  /* sender en callback funktion ned som FilterGroup kalder når brugeren klikker på en checkboks */
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
                {/* ref={sortRef} peger på hele sorterings-containeren */}
                {/* sort_options.find((o) => o.value === sortBy)?.label finder og viser labelen for den aktive sortering */}
                {/* flueben-ikonet vises kun tydeligt på den aktive mulighed via sortCheckActive klassen */}
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
              {/* chips vises kun når de er aktive filtre. key={f.key}-${f.value} kombinerer kategori og værdi til en unik nøgle - det er nødvendigt fordi samme værdier kan eksisterer i forskellige kategorier */}
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
                  <p className={styles.emptyHint}>
                    Prøv at justere dine filtre eller søgeord for at finde flere
                    resultater.
                  </p>
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
                          /* viser en fallback hvis partneren ikke har et logo */
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

/* useSearchParams kræver at komponenten er pakket i Suspense fordi den læser URL-parametre der kan ændre sig under streaming i Next.js */
/* fallback vises mens komponenten indlæses */
/* det er en separation der adskiller den statiske wrapper fra det dynamiske indhold */
export default function PartnersPage() {
  return (
    <Suspense fallback={<div>Henter partnere...</div>}>
      <PartnersContent />
    </Suspense>
  );
}
