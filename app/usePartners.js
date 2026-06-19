/* den globale custom hook der henter alle partnere fra Firebase Realtime Database i realtid */
/* den bruges på forsiden, partnerfortegnelsen og adminpanelet - alle steder der har brug for hele partnerlisten */

"use client"; /* nødvendig fordi hooken bruger useState og useEffect der kun virker i browseren */

import { useEffect, useState } from "react";
import { db } from "./firebaseConfig"; /* Firebase forbindelsen fra firebaseConfig */
import {
  ref,
  onValue,
} from "firebase/database"; /* ref og onValue er Firebase funktioner til at oprette referencer og lytte på data */

/* hooken eksporteres som en navngiven eksport */
/* partners initialiseres som et tomt array - det er vigtigt fordi kode der bruger hooken vil kalde .filter() og .map() på det med det samme */
/* loading initialiseres som true fordi data ikke er hentet endnu */
export function usePartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ref(db, "partners") opretter en reference til partners-noden i roden af databasen */
  /* onValue opretter en realtidslytter - callback funktionen kaldes automatisk hver gang data ændrer sig i Firebase. Det betyder at hvis admin opdaterer en partner vil alle sider der brger hooken automatisk opdateres */
  useEffect(() => {
    const partnersRef = ref(db, "partners");
    const unsubscribe = onValue(partnersRef, (snapshot) => {
      /* snapshot.val() returnerer hele partners-noden som et JavaScript-objekt med Firebase genererede id'er som nøgler */
      const data = snapshot.val();
      /* if (data) tjekker om der er data - noden kan være tom */
      if (data) {
        /* Object.entries(data) konverterer objektet til et array af [id, val] par */
        /* .map(([id, val]) => ({ id, ...val })) destrukturerer hvert par og kombinerer id'et med partnerens øvrige felter til et enkelt objekt */
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        setPartners(list);
      }
      setLoading(false); /* kører uanset om data eksisterer eller ej */
    });
    return () =>
      unsubscribe(); /* fjerner lytteren når en komponent der bruger hooken unmountes */
  }, []); /* det tomme dependency array [] gør at lytteren kun oprettes én gang */

  return {
    partners,
    loading,
  }; /* returnerer begge værdier som et objekt så de kan destructures */
}
