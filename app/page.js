"use client";
import { useEffect } from "react";
import { db } from "./firebaseConfig";
import { ref, set } from "firebase/database";

export default function Home() {
  useEffect(() => {
    set(ref(db, "test/connection"), {
      status: "Firebase virker!",
    });
  }, []);

  return <div>Tester Firebase forbindelse...</div>;
}
