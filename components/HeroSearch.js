"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePartners } from "@/app/usePartners";
import styles from "./HeroSearch.module.css";

export default function HeroSearch() {
  const router = useRouter();
  const { partners } = usePartners();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);

  const ql = query.toLowerCase();
  const matchedPartners = query
    ? partners.filter(
        (p) =>
          p.virksomhedsnavn?.toLowerCase().includes(ql) ||
          p.ekspertise?.some((t) => t.toLowerCase().includes(ql)),
      )
    : [];

  const hasResults = matchedPartners.length > 0;

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInput(e) {
    setQuery(e.target.value);
    setIsOpen(e.target.value.length > 0);
  }

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
          placeholder="Søg på navn eller kompetence..."
          className={styles.input}
          autoComplete="off"
        />
      </div>

      {isOpen && query && (
        <div className={styles.dropdown}>
          {matchedPartners.slice(0, 4).map((p) => (
            <button
              key={p.id}
              className={styles.dropdownItem}
              onClick={() => handlePartnerClick(p.id)}
            >
              <div className={styles.itemLeft}>
                <span className={styles.itemName}>{p.virksomhedsnavn}</span>
                <span className={styles.itemTags}>
                  {p.ekspertise?.join(" · ")} · {p.geografi?.[0]}
                </span>
              </div>
              <span className={styles.itemArrow}>›</span>
            </button>
          ))}

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
