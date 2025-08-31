import dynamic from 'next/dynamic'

// wrapper dynamique côté client
const UploadCertificateClient = dynamic(
  () => import('./UploadCertificateClient'),
  { ssr: false } // ❌ force uniquement client-side
)

export default function UploadCertificatePage() {
  return <UploadCertificateClient />
}
