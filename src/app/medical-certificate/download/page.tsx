'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCertificates = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('medical_certificates')
        .select('id, employee_name, absence_start_date, absence_end_date, hr_comment, treated, certificate_file')
        .gte('absence_start_date', startDate)
        .lte('absence_end_date', endDate);

      if (error) throw error;
      setCertificates(data || []);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch certificates.');
    } finally {
      setLoading(false);
    }
  };

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
      // 1) Créer Excel
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
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      // 2) Créer ZIP
      const zip = new JSZip();
      zip.file('certificates.xlsx', excelBuffer);

      // 3) Télécharger les fichiers directement depuis leur URL publique
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
          console.warn(`❌ Impossible de télécharger ${c.certificate_file}`, err);
        }
      }

      // 4) Générer le ZIP final
      const content = await zip.generateAsync({ type: 'blob' });
      downloadBlob(content, `medical_certificates_${startDate}_${endDate}.zip`);
    } catch (e) {
      console.error(e);
      setError('Failed to generate download.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Download Medical Certificates</h1>

      {/* Date selectors */}
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={fetchCertificates}
          className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
        >
          Search
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Results table */}
      {certificates.length > 0 && (
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Employee</th>
                <th className="border px-4 py-2">Start</th>
                <th className="border px-4 py-2">End</th>
                <th className="border px-4 py-2">HR Comment</th>
                <th className="border px-4 py-2">Treated</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((c) => (
                <tr key={c.id}>
                  <td className="border px-4 py-2">{c.employee_name}</td>
                  <td className="border px-4 py-2">{c.absence_start_date}</td>
                  <td className="border px-4 py-2">{c.absence_end_date}</td>
                  <td className="border px-4 py-2">{c.hr_comment}</td>
                  <td className="border px-4 py-2 text-center">
                    <input type="checkbox" checked={c.treated} readOnly />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Download button */}
      {certificates.length > 0 && (
        <button
          onClick={handleDownload}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
        >
          {loading ? 'Preparing...' : 'Download'}
        </button>
      )}
    </div>
  );
}
