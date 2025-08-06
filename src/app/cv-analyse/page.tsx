// src/app/cv-analyse/page.tsx
import dynamic from 'next/dynamic'

const CVAnalyseClient = dynamic(() => import('./CVAnalyseClient'), { ssr: false })

export default function CVAnalysePage() {
  return <CVAnalyseClient />
}