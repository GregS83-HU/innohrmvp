'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { Download, Search, Calendar, FileText, Users, AlertCircle, CheckCircle, User, Clock } from 'lucide-react';

// Define the type for one row of medical_certificates
interface MedicalCertificate {
  id: number;
  employee_name: string | null;
  absence_start_date: string | null;
  absence_end_date: string | null;
  hr_comment: string | null;
  treated: boolean;
  certificate_file: string | null;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CertificateDownloadPage() {
  // today's date in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [noResults, setNoResults] = useState(false);

  const fetchCertificates = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    setError('');
    setNoResults(false);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('medical_certificates')
        .select(
          'id, employee_name, absence_start_date, absence_end_date, hr_comment, treated, certificate_file'
        )
        .gte('absence_start_date', startDate)
        .lte('absence_end_date', endDate);

      if (error) throw error;

      if (!data || data.length === 0) {
        setNoResults(true);
        setCertificates([]);
      } else {
        setCertificates(data);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to fetch certificates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch today's certificates when the page loads
    fetchCertificates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleDownload = async () => {
    if (certificates.length === 0) {
      setError('No certificates to download.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // 1) Create Excel
      const worksheet = XLSX.utils.json_to_sheet(
        certificates.map((c) => ({
          Employee: c.employee_name ?? '',
          AbsenceStart: c.absence_start_date ?? '',
          AbsenceEnd: c.absence_end_date ?? '',
          HRComment: c.hr_comment ?? '',
          Treated: c.treated ? 'Yes' : 'No',
          FileURL: c.certificate_file ?? '',
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Certificates');
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      // 2) Create ZIP
      const zip = new JSZip();
      zip.file('certificates.xlsx', excelBuffer);

      // 3) Download files directly from public URL
      for (const c of certificates) {
        if (!c.certificate_file) continue;

        try {
          const response = await fetch(c.certificate_file);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const blob = await response.blob();

          const filename = decodeURIComponent(
            c.certificate_file.split('/').pop() || `certificate_${c.id}`
          );

          zip.file(filename, blob);
        } catch (err) {
          console.warn(`❌ Failed to fetch ${c.certificate_file}`, err);
        }
      }

      // 4) Generate final ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      downloadBlob(content, `medical_certificates_${startDate}_${endDate}.zip`);
    } catch (e) {
      console.error(e);
      setError('Failed to generate download.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR')
    } catch {
      return dateString
    }
  }

  // Calculate stats
  const treatedCount = certificates.filter(cert => cert.treated).length;
  const pendingCount = certificates.filter(cert => !cert.treated).length;
  const uniqueEmployeesCount = new Set(certificates.map(c => c.employee_name)).size;

  if (loading && certificates.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading certificates...</p>
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
            <Download className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Download Medical Certificates
            </h1>
            <div className="flex items-center justify-center gap-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full">
                <FileText className="w-4 h-4" />
                <span className="font-semibold">{certificates.length}</span>
                <span>total certificates</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-full">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">{pendingCount}</span>
                <span>pending</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4" />
                <span className="font-semibold">{treatedCount}</span>
                <span>treated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Date Selection and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={fetchCertificates}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Search
                  </>
                )}
              </button>
              
              {certificates.length > 0 && (
                <button
                  onClick={handleDownload}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Download ZIP
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {noResults && !error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="font-medium text-yellow-800">
                No certificate found for the selected dates.
              </p>
            </div>
          </div>
        )}

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '1000px' }}>
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-40">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Employee Name
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-32">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Start Date
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-32">
                    End Date
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-40">
                    HR Comment
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-gray-700 w-24">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {certificates.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No certificates found</h3>
                      <p className="text-gray-500">
                        {noResults ? 'Try adjusting your date range.' : 'Select a date range and click search to view medical certificates.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  certificates.map((cert) => (
                    <tr 
                      key={cert.id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        !cert.treated ? 'bg-yellow-25' : ''
                      }`}
                    >
                      <td className="px-4 py-4 font-medium text-gray-800 w-40">
                        <div className="truncate" title={cert.employee_name || ''}>
                          {cert.employee_name || '—'}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 text-gray-700 w-32">
                        {formatDate(cert.absence_start_date)}
                      </td>
                      
                      <td className="px-4 py-4 text-gray-700 w-32">
                        {formatDate(cert.absence_end_date)}
                      </td>
                      
                      <td className="px-4 py-4 text-gray-700 w-40">
                        <div className="truncate" title={cert.hr_comment || ''}>
                          {cert.hr_comment || '—'}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 text-center w-24">
                        {cert.treated ? (
                          <div className="inline-flex items-center justify-center w-6 h-6 bg-green-500 border-green-500 rounded border-2">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-white border-gray-300 hover:border-gray-400 rounded border-2 mx-auto"></div>
                        )}
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
  );
}