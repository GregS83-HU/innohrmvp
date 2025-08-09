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
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem 2rem',
            borderBottom: '1px solid #ccc',
          }}
        >
          {/* Logo / nom de l'app */}
          <div style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
            <Link href="/">
                <img src="/InnoHRLogo.jpeg" alt="InnoHR" style={{ height: 50 }} />
            </Link>
          </div>

          {/* Menu à droite */}
          <nav style={{ marginLeft: 'auto', display: 'flex', gap: '1.5rem' }}>
            <Link href="/">Home</Link>
            <Link href="/openedpositions">Available Positions</Link>
            {/* Ajoute d'autres liens ici */}
          </nav>
        </header>

        <main style={{ padding: '2rem' }}>{children}</main>
      </body>
    </html>
  )
}