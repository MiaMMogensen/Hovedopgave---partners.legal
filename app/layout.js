import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Poppins, Caveat } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

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
        <Footer />
      </body>
    </html>
  );
}
