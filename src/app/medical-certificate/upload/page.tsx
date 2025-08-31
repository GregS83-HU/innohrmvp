// app/medical-certificate/upload/page.tsx
import dynamic from 'next/dynamic'

// Dynamic import forcé côté client uniquement
const UploadCertificateClient = dynamic(
  () => import('./UploadCertificateClient'),
  { ssr: false } // ❌ pas de server-side render
)

export default function UploadCertificatePage() {
  return <UploadCertificateClient />
}
 