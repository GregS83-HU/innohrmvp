'use client'

import { useState, useEffect } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useLocale } from 'i18n/LocaleProvider'
import * as Popover from '@radix-ui/react-popover'
import { Search, FileText, User, Calendar, MessageCircle, CheckCircle, Clock, Filter, Eye, Upload } from 'lucide-react'

type MedicalCertificate = {
  id: number
  employee_name: string
  certificate_file: string
  absence_start_date: string
  absence_end_date: string
  employee_comment: string | null
  created_at: string
  treated: boolean
  treatment_date: string | null
  document_url?: string | null
  company_id?: number
}

export default function MedicalCertificatesPage() {
  const { t } = useLocale()
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')
  const [showAll, setShowAll] = useState<boolean>(false)
  const [companyId, setCompanyId] = useState<number | null>(null)

  const session = useSession()
  const supabase = useSupabaseClient()

  useEffect(() => {
    if (!session) return

    const fetchCompanyIdAndCertificates = async () => {
      setLoading(true)
      try {
        const { data: userProfile, error: userError } = await supabase
          .from('company_to_users')
          .select('company_id')
          .eq('user_id', session.user.id)
          .single()

        if (userError) {
          console.error(t('medicalCertificates.errors.fetchCompanyId'), userError.message)
          setCertificates([])
          setLoading(false)
          return
        }

        if (!userProfile || !userProfile.company_id) {
          console.warn(t('medicalCertificates.errors.userWithoutCompany'))
          setCertificates([])
          setLoading(false)
          return
        }

        const currentCompanyId = userProfile.company_id
        setCompanyId(currentCompanyId)

        const { data, error } = await supabase
          .from('medical_certificates')
          .select('*')
          .eq('company_id', currentCompanyId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error(t('medicalCertificates.errors.loadCertificates'), error.message)
          setCertificates([])
          return
        }

        const certificatesWithUrl: MedicalCertificate[] = (data || []).map(
          (cert: MedicalCertificate) => {
            let documentUrl = null;
            
            // Extract file path from certificate_file
            let filePath = cert.certificate_file;
            
            if (typeof cert.certificate_file === 'string' && cert.certificate_file.startsWith('{')) {
              try {
                const parsed = JSON.parse(cert.certificate_file);
                filePath = parsed.path || parsed.signedUrl || cert.certificate_file;
              } catch (e) {
                console.error('Error parsing certificate_file:', e);
              }
            }
            
            // Generate public URL
            if (filePath) {
              const { data: publicData } = supabase.storage
                .from('medical-certificates')
                .getPublicUrl(filePath);
              
              documentUrl = publicData.publicUrl;
            }
            
            return {
              ...cert,
              document_url: documentUrl,
              treated: !!cert.treated,
              treatment_date: cert.treatment_date,
            };
          }
        );  

        setCertificates(certificatesWithUrl)
      } catch (err) {
        console.error('Erreur réseau', err)
        setCertificates([])
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyIdAndCertificates()
  }, [session, supabase, t])

  const handleCheckboxChange = async (certId: number, newValue: boolean) => {
    if (!session?.user?.id) {
      alert(t('medicalCertificates.alerts.sessionNotFound'))
      return
    }

    console.log('=== Starting checkbox change ===')
    console.log('CertId:', certId, 'Type:', typeof certId)
    console.log('New value:', newValue)
    console.log('User ID:', session.user.id)

    try {
      const treatmentDate = newValue ? new Date().toISOString() : null
      const userId = session.user.id

      // First, update the medical certificate
      const { data: certData, error: certError } = await supabase
        .from('medical_certificates')
        .update({ 
          treated: newValue,
          treatment_date: treatmentDate
        })
        .eq('id', certId)
        .select()

      if (certError) {
        console.error('Error updating medical certificate:', certError.message)
        alert(t('medicalCertificates.alerts.updateError'))
        return
      }

      console.log('Medical certificate updated successfully')

      // Use RPC function to get leave requests (bypasses RLS issues)
      const { data: leaveRequests, error: leaveCheckError } = await supabase
        .rpc('get_leave_request_by_medical_cert', { cert_id: certId })

      console.log('Leave requests found:', leaveRequests?.length || 0)

      if (leaveCheckError) {
        console.error('Error checking leave requests:', leaveCheckError)
        // Rollback the medical certificate update
        await supabase
          .from('medical_certificates')
          .update({ 
            treated: !newValue,
            treatment_date: !newValue ? new Date().toISOString() : null
          })
          .eq('id', certId)
        alert(t('medicalCertificates.alerts.leaveRequestError'))
        return
      }

      // If there's a linked leave request, update it
      if (leaveRequests && leaveRequests.length > 0) {
        console.log('Found leave request(s), updating...')
        
        // Use RPC function to update (bypasses RLS issues)
        const { error: leaveUpdateError } = await supabase
          .rpc('update_leave_request_by_medical_cert', {
            cert_id: certId,
            is_confirmed: newValue ? true : null,
            validated: newValue ? true : null,
            validated_by_user: newValue ? userId : null,
            validated_at_time: newValue ? new Date().toISOString() : null
          })

        console.log('Leave request update completed, error:', leaveUpdateError)

        if (leaveUpdateError) {
          console.error('Error updating leave request:', leaveUpdateError)
          // Rollback the medical certificate update
          await supabase
            .from('medical_certificates')
            .update({ 
              treated: !newValue,
              treatment_date: !newValue ? new Date().toISOString() : null
            })
            .eq('id', certId)
          alert(t('medicalCertificates.alerts.leaveUpdateError'))
          return
        }

        console.log('Leave request updated successfully!')
      } else {
        console.log('No leave request found for this certificate')
      }

      // Success: update local state
      setCertificates((prev) =>
        prev.map((cert) =>
          cert.id === certId 
            ? { 
                ...cert, 
                treated: newValue,
                treatment_date: treatmentDate
              } 
            : cert
        )
      )

      console.log('=== Checkbox change completed successfully ===')
    } catch (err) {
      console.error('Network error during update:', err)
      alert(t('medicalCertificates.alerts.networkError'))
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('medicalCertificates.table.noData')
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const formatSimpleDate = (dateString: string | null) => {
    if (!dateString) return t('medicalCertificates.table.noData')
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR')
    } catch {
      return dateString
    }
  }

  const filteredCertificates = certificates
    .filter((cert) =>
      cert.employee_name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((cert) => (showAll ? true : !cert.treated))

  const treatedCount = certificates.filter(cert => cert.treated).length
  const pendingCount = certificates.filter(cert => !cert.treated).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">{t('medicalCertificates.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {t('medicalCertificates.title')}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full">
                <FileText className="w-4 h-4" />
                <span className="font-semibold">{certificates.length}</span>
                <span>{t('medicalCertificates.stats.total')}</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-full">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">{pendingCount}</span>
                <span>{t('medicalCertificates.stats.pending')}</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4" />
                <span className="font-semibold">{treatedCount}</span>
                <span>{t('medicalCertificates.stats.treated')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('medicalCertificates.search.placeholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] ${
                showAll 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              {showAll ? t('medicalCertificates.search.hideTreated') : t('medicalCertificates.search.showAll')}
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '1100px' }}>
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-40">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {t('medicalCertificates.table.headers.employeeName')}
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-32">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {t('medicalCertificates.table.headers.startDate')}
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-32">
                    {t('medicalCertificates.table.headers.endDate')}
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-32">
                    {t('medicalCertificates.table.headers.certificate')}
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-32">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {t('medicalCertificates.table.headers.uploadDate')}
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-40">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      {t('medicalCertificates.table.headers.comment')}
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-gray-700 w-24">
                    {t('medicalCertificates.table.headers.status')}
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-40">
                    {t('medicalCertificates.table.headers.treatmentDate')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCertificates.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('medicalCertificates.table.empty.title')}</h3>
                      <p className="text-gray-500">
                        {search ? t('medicalCertificates.table.empty.withSearch') : t('medicalCertificates.table.empty.withoutSearch')}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCertificates.map((cert, index) => (
                    <tr 
                      key={cert.id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        !cert.treated ? 'bg-yellow-25' : ''
                      }`}
                    >
                      <td className="px-4 py-4 font-medium text-gray-800 w-40">
                        <div className="truncate" title={cert.employee_name}>
                          {cert.employee_name}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 text-gray-700 w-32">
                        {formatSimpleDate(cert.absence_start_date)}
                      </td>
                      
                      <td className="px-4 py-4 text-gray-700 w-32">
                        {formatSimpleDate(cert.absence_end_date)}
                      </td>
                      
                      <td className="px-4 py-4 w-32">
                        {cert.document_url ? (
                          <a
                            href={cert.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            {t('medicalCertificates.table.actions.view')}
                          </a>
                        ) : (
                          <span className="text-gray-500">{t('medicalCertificates.table.noData')}</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-gray-700 w-32">
                        {formatSimpleDate(cert.created_at)}
                      </td>
                      
                      <td className="px-4 py-4 w-40">
                        {cert.employee_comment ? (
                          <Popover.Root>
                            <Popover.Trigger asChild>
                              <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" aria-label={t('medicalCertificates.table.actions.viewComment')}>
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            </Popover.Trigger>
                            <Popover.Portal>
                              <Popover.Content 
                                side="top" 
                                align="center" 
                                sideOffset={5}
                                className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50"
                                style={{ 
                                  maxWidth: 'min(400px, 90vw)',
                                  maxHeight: '60vh',
                                  overflowY: 'auto'
                                }}
                              >
                                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                  {cert.employee_comment}
                                </div>
                                <Popover.Arrow className="fill-white stroke-gray-200" />
                              </Popover.Content>
                            </Popover.Portal>
                          </Popover.Root>
                        ) : (
                          <span className="text-gray-500">{t('medicalCertificates.table.noData')}</span>
                        )}
                      </td>
                      
                      <td className="px-4 py-4 text-center w-24">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cert.treated}
                            onChange={(e) => handleCheckboxChange(cert.id, e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`relative w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                            cert.treated 
                              ? 'bg-green-500 border-green-500' 
                              : 'bg-white border-gray-300 hover:border-gray-400'
                          }`}>
                            {cert.treated && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </label>
                      </td>
                      
                      <td className="px-4 py-4 w-40">
                        <span className={cert.treated ? 'text-green-700 font-medium' : 'text-gray-500'}>
                          {formatDate(cert.treatment_date)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}