import type { Metadata } from "next";
import "./globals.css";
//import Header from "./Header";
import Header from "../../components/Header"
import ClientProvider from "./ClientProvider";
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: "InnoHR",
  description: "HR was never as easy as NOW",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <ClientProvider>
          <Header />
          <main style={{ padding: '2rem' }}>{children}</main>
        </ClientProvider>
      </body>
    </html>
  );
}