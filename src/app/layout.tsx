import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InnoHR",
  description: "HR was never as easy as NOW",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <header style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/">Accueil</Link>
            <Link href="/OpendedPositions">Positions disponibles</Link>
            {/* Ajoute d’autres liens si besoin */}
          </nav>
        </header>
        <main style={{ padding: '1rem' }}>{children}</main>
      </body>
    </html>
  )
}

/*export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );*/

