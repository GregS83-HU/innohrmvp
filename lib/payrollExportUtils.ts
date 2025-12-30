// lib/payrollExportUtils.ts
// Client-side utilities for generating payroll Excel exports

import * as XLSX from 'xlsx';
import type { PayrollExportData, ExportFormat } from '../types/payroll';

interface ExportOptions {
  format: ExportFormat;
  month: number;
  year: number;
  data: PayrollExportData[];
}

/**
 * Generate Excel file for payroll export
 */
export function generatePayrollExcel(options: ExportOptions): Blob {
  const { format, month, year, data } = options;
  
  const workbook = XLSX.utils.book_new();
  
  switch (format) {
    case 'generic':
      addGenericSheet(workbook, data, month, year);
      break;
    case 'kulcs_soft':
      addKulcsSoftSheet(workbook, data, month, year);
      break;
    case 'nexon':
      addNexonSheet(workbook, data, month, year);
      break;
    case 'sap':
      addSAPSheet(workbook, data, month, year);
      break;
    default:
      // Add all formats
      addGenericSheet(workbook, data, month, year);
      addKulcsSoftSheet(workbook, data, month, year);
      addNexonSheet(workbook, data, month, year);
      addSAPSheet(workbook, data, month, year);
  }
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Generic format - human-readable
 */
function addGenericSheet(workbook: XLSX.WorkBook, data: PayrollExportData[], month: number, year: number) {
  const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long' });
  
  // Prepare data for sheet
  const sheetData = [
    [`Payroll Export - ${monthName} ${year}`],
    [],
    [
      'Employee ID', 'Last Name', 'First Name', 'TAJ Number', 'Tax ID',
      'Position', 'Department', 'Employment Type', 'Contract Type',
      'Gross Salary (HUF)', 'Currency', 'Bank IBAN', 'Bank Name',
      'Worked Days', 'Leave Days', 'Actual Worked Days', 'Weekly Hours'
    ]
  ];
  
  data.forEach(emp => {
    const countryData = emp.country_specific_data || {};
    sheetData.push([
      emp.user_id,
      emp.user_lastname,
      emp.user_firstname,
      countryData.taj_number || '',
      countryData.tax_id || '',
      emp.position_title,
      emp.department || '',
      emp.employment_type,
      emp.contract_type,
      emp.salary_amount,
      emp.salary_currency,
      emp.bank_account_iban || '',
      emp.bank_name || '',
      emp.worked_days,
      emp.leave_days,
      emp.actual_worked_days,
      emp.weekly_hours
    ]);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 36 }, // Employee ID
    { wch: 20 }, // Last Name
    { wch: 20 }, // First Name
    { wch: 12 }, // TAJ
    { wch: 12 }, // Tax ID
    { wch: 25 }, // Position
    { wch: 15 }, // Department
    { wch: 15 }, // Employment Type
    { wch: 15 }, // Contract Type
    { wch: 15 }, // Salary
    { wch: 8 },  // Currency
    { wch: 30 }, // IBAN
    { wch: 20 }, // Bank
    { wch: 12 }, // Worked Days
    { wch: 12 }, // Leave Days
    { wch: 15 }, // Actual Days
    { wch: 12 }  // Hours
  ];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, `Payroll ${month}-${year}`);
}

/**
 * Kulcs-Soft Bérkalkulátor format
 */
function addKulcsSoftSheet(workbook: XLSX.WorkBook, data: PayrollExportData[], month: number, year: number) {
  const sheetData = [
    [
      'Dolgozói azonosító', 'Vezetéknév', 'Keresztnév', 'TAJ szám', 'Adóazonosító jel',
      'Munkakör', 'Szervezeti egység', 'Foglalkoztatás típusa', 'Szerződés típusa',
      'Bruttó fizetés', 'Fizetési időszak', 'Bankszámlaszám', 'Bank neve',
      'Ledolgozott napok', 'Szabadság napok', 'Tényleges munkanapok',
      'Adókulcs', 'Családi kedvezmény (gyerekek száma)',
      'Nyugdíjpénztár típusa', 'Egészségbiztosítási szám'
    ]
  ];
  
  const employmentTypeMap: Record<string, string> = {
    'full_time': 'Teljes munkaidő',
    'part_time': 'Részmunkaidő',
    'contractor': 'Megbízási',
    'intern': 'Gyakornok',
    'temporary': 'Ideiglenes'
  };
  
  const contractTypeMap: Record<string, string> = {
    'permanent': 'Határozatlan idejű',
    'fixed_term': 'Határozott idejű',
    'probation': 'Próbaidős'
  };
  
  data.forEach(emp => {
    const countryData = emp.country_specific_data || {};
    sheetData.push([
      emp.user_id,
      emp.user_lastname,
      emp.user_firstname,
      countryData.taj_number || '',
      countryData.tax_id || '',
      emp.position_title,
      emp.department || '',
      employmentTypeMap[emp.employment_type] || emp.employment_type,
      contractTypeMap[emp.contract_type] || emp.contract_type,
      emp.salary_amount,
      'Havi',
      emp.bank_account_iban || '',
      emp.bank_name || '',
      emp.worked_days,
      emp.leave_days,
      emp.actual_worked_days,
      countryData.tax_bracket || '1',
      countryData.family_tax_allowance || 0,
      countryData.pension_fund === 'private' ? 'Magán' : 'Állami',
      countryData.health_insurance_number || ''
    ]);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  worksheet['!cols'] = Array(20).fill({ wch: 15 });
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Kulcs-Soft Import');
}

/**
 * Nexon format
 */
function addNexonSheet(workbook: XLSX.WorkBook, data: PayrollExportData[], month: number, year: number) {
  const sheetData = [
    [
      'EmpID', 'Surname', 'FirstName', 'SSN', 'TaxID',
      'JobTitle', 'OrgUnit', 'EmpType', 'GrossSalary', 'Currency',
      'IBAN', 'WorkedDays', 'AbsenceDays', 'TaxClass',
      'FamilyAllowance', 'PensionType'
    ]
  ];
  
  data.forEach(emp => {
    const countryData = emp.country_specific_data || {};
    sheetData.push([
      emp.user_id.substring(0, 8),
      emp.user_lastname,
      emp.user_firstname,
      countryData.taj_number || '',
      countryData.tax_id || '',
      emp.position_title,
      emp.department || '',
      emp.employment_type.toUpperCase(),
      emp.salary_amount,
      'HUF',
      emp.bank_account_iban || '',
      emp.worked_days,
      emp.leave_days,
      countryData.tax_bracket || '1',
      countryData.family_tax_allowance || 0,
      (countryData.pension_fund || 'government').toUpperCase().charAt(0)
    ]);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  worksheet['!cols'] = Array(16).fill({ wch: 12 });
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Nexon Import');
}

/**
 * SAP HCM format
 */
function addSAPSheet(workbook: XLSX.WorkBook, data: PayrollExportData[], month: number, year: number) {
  const sheetData = [
    [
      'Personnel Number', 'Last Name', 'First Name', 'National ID', 'Tax Number',
      'Position', 'Cost Center', 'Employee Group', 'Employee Subgroup',
      'Basic Pay', 'Pay Scale Group', 'Bank Account', 'Bank Key',
      'Calendar Days', 'Absence Days', 'Payroll Days',
      'Tax Class', 'Number of Children', 'Health Insurance Fund'
    ]
  ];
  
  const employmentGroupMap: Record<string, string> = {
    'full_time': '1',
    'part_time': '2',
    'contractor': '9',
    'intern': '3',
    'temporary': '5'
  };
  
  const contractSubgroupMap: Record<string, string> = {
    'permanent': 'A1',
    'fixed_term': 'A2',
    'probation': 'A3'
  };
  
  data.forEach(emp => {
    const countryData = emp.country_specific_data || {};
    
    // Generate 8-digit personnel number (simplified)
    const personnelNumber = String(Math.abs(hashCode(emp.user_id))).padStart(8, '0').substring(0, 8);
    
    sheetData.push([
      personnelNumber,
      emp.user_lastname.toUpperCase(),
      emp.user_firstname.toUpperCase(),
      countryData.taj_number || '',
      countryData.tax_id || '',
      emp.position_title,
      emp.department || '',
      employmentGroupMap[emp.employment_type] || '1',
      contractSubgroupMap[emp.contract_type] || 'A1',
      emp.salary_amount,
      'M1',
      emp.bank_account_iban || '',
      emp.bank_name || '',
      emp.worked_days,
      emp.leave_days,
      emp.actual_worked_days,
      countryData.tax_bracket || '1',
      countryData.family_tax_allowance || 0,
      countryData.health_insurance_number || ''
    ]);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  worksheet['!cols'] = Array(19).fill({ wch: 14 });
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SAP Import');
}

/**
 * Simple hash function for generating personnel numbers
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Download Excel file
 */
export function downloadPayrollExcel(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export payroll data to Excel and download
 */
export async function exportAndDownloadPayroll(options: ExportOptions) {
  const monthName = new Date(options.year, options.month - 1).toLocaleString('en-US', { month: 'long' });
  const fileName = `Payroll_HU_${monthName}_${options.year}_${options.format}.xlsx`;
  
  const blob = generatePayrollExcel(options);
  downloadPayrollExcel(blob, fileName);
}