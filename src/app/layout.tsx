import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ClientProvider from "./ClientProvider";
import { LocaleProvider } from "../i18n/LocaleProvider";
import { messages } from "../i18n/messages";
import CookieConsent from "../../components/CookieConsent";
import { SpeedInsights } from "@vercel/speed-insights/next"

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "HRInno",
  description: "Get your CV scored free with AI — no account needed. HRInno also runs recruitment, payroll, time & attendance, absences, and performance for growing teams.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sora.variable} ${inter.variable}`}>
      <body>
        <LocaleProvider messages={messages}>
          <ClientProvider>
            {/*}<DemoWarningBanner /> {*/}
            <Header />
            <main style={{ padding: "2rem" }}>{children}</main>
            <Footer />
            <CookieConsent /> {/* ✅ Add here, after Footer */}
          </ClientProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
