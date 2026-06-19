/* rod-layoutet der omslutter alle sider i applikationen */
/* det definerer den grundlæggende HTML-struktur, indlæser fonte, sætter metadata og tilføjer header og footer på alle sider */
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Poppins, Caveat } from "next/font/google";
import ConditionalFooter from "@/components/ConditionalFooter";

/* fonte */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

/* Next.js App Router bruger metadata eksport til at sætte <title> og <meta desciption> tags automatisk */
/* det er en Server Component-funktion der ikke kræver "use client" */
export const metadata = {
  title: "Partners.legal",
  description:
    "Subdomæne til .legal domænet, hvor kunder kan finde partnere og partnere kan onboardes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="da" className={`${poppins.variable} ${caveat.variable}`}>
      <body>
        <Header />
        <main style={{ marginTop: "90px" }}>{children}</main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
