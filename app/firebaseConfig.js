/* firebase konfigurationsfil der initialiserer forbindelsen til firebase og eksporterer de to services der bruges i projektet - authentication og realtime database */
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

/* Konfigurationsobjektet indeholder alle de nøgler Firebase kræver for at identificere projektet. Alle værdier hentes fra environment variables via process.env frem for at være hardcodet direkte i koden. NEXT_PUBLIC_ præfikset er Next.js-konventionen for environment variables der skal være tilgængelige i browseren — uden præfikset er de kun tilgængelige på serveren. Disse variabler er sat i en .env.local fil lokalt og i Vercel under Settings → Environment Variables i produktion */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/* getApps() returnerer et array af alle initialiserede Firebase apps. !getApps().length tjekker om arrayet er tomt — altså om Firebase endnu ikke er initialiseret. Hvis ja initialiseres en ny app med initializeApp. Hvis nej bruges den eksisterende app via getApps()[0]. Dette er et vigtigt mønster i Next.js fordi moduler kan blive importeret flere gange under server-side rendering — uden denne check ville Firebase forsøge at initialisere sig selv to gange og kaste en fejl */
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

/* getAuth(app) returnerer Firebase Authentication-instansen. getDatabase(app) returnerer Realtime Database-instansen. Begge eksporteres som navngivne exports så de kan importeres direkte i alle andre filer — fx import { auth, db } from "@/app/firebaseConfig" */
export const auth = getAuth(app);
export const db = getDatabase(app);
