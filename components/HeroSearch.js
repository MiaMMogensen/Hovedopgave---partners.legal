/* søgefeltet på forsiden der viser en live dropdown med matchende partnere mens brugeren skriver */
/* den navigerer enten direkte til en partners profil eller til partnerfortegnelsen med søgeteksten som URL-parameter */

"use client"; /* klientkomponent */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePartners } from "@/app/usePartners";
import styles from "./HeroSearch.module.css";

export default function HeroSearch() {
  const router = useRouter();
  const { partners } = usePartners();
  const [query, setQuery] = useState(""); /* query er søgeteksten */
  const [isOpen, setIsOpen] = useState(false);
  /* isOpen styrer om dropdown er synlig */
  const wrapRef = useRef(null);
  /* wrapRef peger på hele søge-containeren og bruges til at detektere klik udenfor */

  /* ql beregnes én gang frem for at kalde .toLowerCase() på query i hvert filter-tjek */
  /* matchesPartners er et tomt array hvis query er tom - det forhindrer unødvendig filtrering */
  /* Søgningen matcher på fire felter - virksomhedsnavn, ekspertise, ydelser og beskrivelse */
  /* .some() på arrays stopper så sanrt et element matcher */
  const ql = query.toLowerCase();
  const matchedPartners = query
    ? partners.filter(
        (p) =>
          p.virksomhedsnavn?.toLowerCase().includes(ql) ||
          p.ekspertise?.some((t) => t.toLowerCase().includes(ql)) ||
          p.ydelser?.some((t) => t.toLowerCase().includes(ql)) ||
          p.beskrivelse?.toLowerCase().includes(ql),
      )
    : [];

  const hasResults = matchedPartners.length > 0;

  /* samme klik-udenfor møsnter som sort-dropdown på partnerfortegnelsen */
  /* wrapRef.current.contains(e.target) tjekker om det klikkede element er inden i søge containeren - hvis nej lukkes dropdown */
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* opdaterer query og åbner dropdown hvis der er tekst. Lukker dropdown hvis feltet tømmes */
  function handleInput(e) {
    setQuery(e.target.value);
    setIsOpen(e.target.value.length > 0);
  }

  /* navigerer til partnerfortegnelsen med søgeteksten som URL-parameter */
  /* encodeURIComponent sikrer at specialtegn i søgeteksten er URL-sikre */
  /* hvis feltet et tomt navigeres til partnerfortegnelsen uden parameter */
  function handleSeeAll() {
    if (query) {
      router.push(`/partnere?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/partnere");
    }
  }

  function handlePartnerClick(id) {
    router.push(`/partnere/${id}`);
  }

  /* Enter navigerer til partnerfortegnelsen med søgeteksten */
  /* Escape lukker dropdown - det er en standard UX konvention for modaler og dropdowns */
  function handleKeyDown(e) {
    if (e.key === "Enter") handleSeeAll();
    if (e.key === "Escape") setIsOpen(false);
  }

  return (
    <div className={styles.searchWrap} ref={wrapRef}>
      <div className={styles.inputRow}>
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          /* genåbner dropdown når brugeren klikker tilbage i søgefeltet hvis der allerede er en søgetekst fx hvis de klikkede væk og klikker tilbage */
          placeholder="Søg på navn eller kompetence..."
          className={styles.input}
          autoComplete="off"
        />
      </div>

      {isOpen && query && (
        <div className={styles.dropdown}>
          {/* .slice(0, 4) begrænser dropdown til maksimalt fire resultater så den ikke bliver for lang. Hvert resultat er en button der navigerer til partnerens profil ved klik */}
          {matchedPartners.slice(0, 4).map((p) => (
            <button
              key={p.id}
              className={styles.dropdownItem}
              onClick={() => handlePartnerClick(p.id)}
            >
              <div className={styles.itemLeft}>
                <span className={styles.itemName}>{p.virksomhedsnavn}</span>
                <span className={styles.itemTags}>
                  {/* p.ekspertise?.join(" . ") joiner ekspertiseområderne med en prik-separator */}
                  {p.ekspertise?.join(" · ")} · {p.geografi?.[0]}
                </span>
              </div>
              <span className={styles.itemArrow}>›</span>
            </button>
          ))}

          {/* &ldquo; og &rdquo; er HTML entiteter for typografisk korrekte anførselstegn */}
          {/* ingen resultater beskeden vises kun hvis der ikke er matches */}
          {/* "Se alle resultater" knappen vises kun når der er matches og navigerer til partnerfortegnelsen med søgeteksten */}
          {!hasResults && (
            <p className={styles.noResults}>
              Ingen resultater for &ldquo;{query}&rdquo;
            </p>
          )}

          {hasResults && (
            <button className={styles.seeAll} onClick={handleSeeAll}>
              Se alle resultater for &ldquo;{query}&rdquo;
              <span className={styles.itemArrow}>›</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
