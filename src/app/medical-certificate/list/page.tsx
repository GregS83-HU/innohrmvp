'use client'

import { useState, useEffect } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import * as Popover from '@radix-ui/react-popover'
import { Search } from 'lucide-react'

type MedicalCertificate = {
  id: number
  employee_name: string
  certificate_file: string
  absence_start_date: string
  absence_end_date: string
  employee_comment: string | null
  created_at: string
  treated: boolean
  document_url?: string
}

export default function MedicalCertificatesPage() {
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')
  const [showAll, setShowAll] = useState<boolean>(false) // <-- nouvel état

  const session = useSession()
  const supabase = useSupabaseClient()

  useEffect(() => {
    if (!session) return

    const fetchCertificates = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('medical_certificates')
          .select('*')

        if (error) {
          console.error('Erreur chargement certificats:', error)
          setCertificates([])
          return
        }

        // On utilise directement l'URL complète stockée en base
        const certificatesWithUrl: MedicalCertificate[] = (data || []).map(
          (cert: MedicalCertificate) => ({
            ...cert,
            document_url: cert.certificate_file,
            treated: !!cert.treated,
          })
        )

        setCertificates(certificatesWithUrl)
      } catch (err) {
        console.error('Erreur réseau', err)
        setCertificates([])
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [session, supabase])

  const handleCheckboxChange = async (certId: number, newValue: boolean) => {
    try {
      const { data, error } = await supabase
        .from('medical_certificates')
        .update({ treated: newValue })
        .eq('id', certId)
        .select()
      
      if (error) {
        console.error('Erreur mise à jour traité:', error)
      } else {
        // Mise à jour locale immédiate
        setCertificates((prev) =>
          prev.map((cert) =>
            cert.id === certId ? { ...cert, treated: newValue } : cert
          )
        )
      }
    } catch (err) {
      console.error('Erreur réseau lors de update treated:', err)
    }
  }

  /** ==== Application des filtres ==== */
  const filteredCertificates = certificates
    .filter((cert) =>
      cert.employee_name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((cert) => (showAll ? true : !cert.treated)) // <-- filtrage par défaut

  return (
    <div style={{ overflowX: 'auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
        📄 Medical Certificates
      </h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search by employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            maxWidth: 400,
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: 6,
          }}
        />

        <button
          onClick={() => setShowAll((prev) => !prev)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: 6,
            background: showAll ? '#0070f3' : '#f0f0f0',
            color: showAll ? 'white' : 'black',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          {showAll ? 'Hide treated' : 'See all certificates'}
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 600,
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={thStyle}>Employee Name</th>
              <th style={thStyle}>Absence start date</th>
              <th style={thStyle}>Absence end date</th>
              <th style={thStyle}>Medical Certificate</th>
              <th style={thStyle}>Employee Comment</th>
              <th style={thStyle}>Treated</th>
            </tr>
          </thead>
          <tbody>
            {filteredCertificates.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 16 }}>
                  No Medical Certificate found
                </td>
              </tr>
            ) : (
              filteredCertificates.map((cert) => (
                <tr key={cert.id} style={{ borderBottom: '1px solid #ccc' }}>
                  <td style={tdStyle}>{cert.employee_name}</td>
                  <td style={tdStyle}>{cert.absence_start_date}</td>
                  <td style={tdStyle}>{cert.absence_end_date}</td>
                  <td style={tdStyle}>
                    {cert.document_url ? (
                      <a
                        href={cert.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#0070f3',
                          textDecoration: 'underline',
                          fontWeight: 'bold',
                        }}
                      >
                        See Certificate
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td style={tdStyle}>
                    {cert.employee_comment ? (
                      <Popover.Root>
                        <Popover.Trigger asChild>
                          <button style={iconBtnStyle} aria-label="Voir commentaire">
                            <Search size={16} />
                          </button>
                        </Popover.Trigger>
                        <Popover.Portal>
                          <Popover.Content side="top" align="center" sideOffset={5}>
                            <div style={popoverStyle}>
                              {cert.employee_comment}
                              <Popover.Arrow
                                offset={5}
                                width={10}
                                height={5}
                                style={{ fill: 'white', stroke: '#ccc' }}
                              />
                            </div>
                          </Popover.Content>
                        </Popover.Portal>
                      </Popover.Root>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="checkbox"
                      checked={cert.treated}
                      onChange={(e) =>
                        handleCheckboxChange(cert.id, e.target.checked)
                      }
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

/* ==== Styles ==== */
const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px',
  fontWeight: 'bold',
}

const tdStyle: React.CSSProperties = {
  padding: '8px',
  verticalAlign: 'middle',
}

const iconBtnStyle: React.CSSProperties = {
  background: '#f0f0f0',
  border: '1px solid #ccc',
  borderRadius: 4,
  padding: '4px',
  cursor: 'pointer',
}

const popoverStyle: React.CSSProperties = {
  background: 'white',
  padding: 12,
  border: '1px solid #ccc',
  borderRadius: 6,
  boxShadow: '0px 4px 8px rgba(0,0,0,0.15)',
  maxWidth: 'min(400px, 90vw)',
  whiteSpace: 'pre-wrap',
}
