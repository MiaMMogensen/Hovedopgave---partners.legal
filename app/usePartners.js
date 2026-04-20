"use client";
import { useEffect, useState } from "react";
import { db } from "./firebaseConfig";
import { ref, onValue } from "firebase/database";

export function usePartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const partnersRef = ref(db, "partners");
    const unsubscribe = onValue(partnersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        setPartners(list);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { partners, loading };
}
