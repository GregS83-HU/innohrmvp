import type { Metadata } from "next";
import "./globals.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ClientProvider from "./ClientProvider";
import { LocaleProvider } from "../i18n/LocaleProvider";
import { messages } from "../i18n/messages";
import CookieConsent from "../../components/CookieConsent";
import DemoWarningBanner from "../../components/DemoWarningBanner";


export const metadata: Metadata = {
  title: "InnoHR",
  description: "HR was never as easy as NOW",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
