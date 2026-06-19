/* wrapper komponent der beslutter om footeren skal vises eller skjules baseret på den aktuelle URL */

"use client"; /* nødvendigt fordi usePathname er en hook der kun virker i browseren */

import { usePathname } from "next/navigation"; /* returnerer den aktuelle URL sti som en streng */
import Footer from "./Footer";

/* pathname.startsWith() tjekker om stien begynder med den givne streng */
export default function ConditionalFooter() {
  const pathname = usePathname();
  const hide =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/partner-portal") ||
    pathname.startsWith("/onboarding");
  if (hide) return null; /* returnerer null hvis footeren skal skjules */
  return <Footer />;
}
