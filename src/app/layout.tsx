import type { Metadata } from "next";
import "./globals.css";
import Header from "../../components/Header";
import ClientProvider from "./ClientProvider";
import { LocaleProvider } from "../i18n/LocaleProvider";
import { messages } from "../i18n/messages";

export const metadata: Metadata = {
  title: "InnoHR",
  description: "HR was never as easy as NOW",
};

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LocaleProvider messages={messages}>
          <ClientProvider>
            <Header />
            <main style={{ padding: '2rem' }}>
              {children}
            </main>
          </ClientProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}