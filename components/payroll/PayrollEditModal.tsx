'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    Loader2,
    Save,
    Edit3,
    Briefcase,
    CreditCard,
    Building2,
    Shield,
    AlertCircle,
    DollarSign
} from 'lucide-react';
import type {
    EmployeePayroll,
    HungarianPayrollData,
    CreatePayrollRequest,
} from '../../types/payroll';
import { useLocale } from 'i18n/LocaleProvider';
import CompensationManager from './CompensationManager';


interface PayrollEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
    currentUserId: string;
    onSuccess?: () => void;
}

/* =========================================================
   Helpers
========================================================= */

const EMPTY_COUNTRY_DATA: HungarianPayrollData = {
    taj_number: '',
    tax_id: '',
    tax_bracket: '1',
    personal_income_tax_rate: 15,
    employee_social_contribution: 18.5,
    employer_social_contribution: 13,
    family_tax_allowance: 0,
    pension_fund: 'government',
};

const createBaseFormData = (userId: string): CreatePayrollRequest => ({
    user_id: userId,
    country_code: 'HU',
    employment_type: 'full_time',
    contract_type: 'permanent',
    contract_start_date: new Date().toISOString().split('T')[0],
    position_title: '',
    department: '',
    work_location: '',
    weekly_hours: 40,
    salary_amount: 0,
    salary_currency: 'HUF',
    salary_period: 'monthly',
    payment_method: 'bank_transfer',
    bank_account_iban: '',
    bank_name: '',
    country_specific_data: EMPTY_COUNTRY_DATA,
    benefits: [],
});


const normalizePayroll = (
    base: CreatePayrollRequest,
    incoming: Partial<CreatePayrollRequest>
): CreatePayrollRequest => ({
    ...base,
    ...incoming,

    position_title: incoming?.position_title ?? '',
    department: incoming?.department ?? '',
    work_location: incoming?.work_location ?? '',
    bank_account_iban: incoming?.bank_account_iban ?? '',
    bank_name: incoming?.bank_name ?? '',

    weekly_hours: incoming?.weekly_hours ?? 40,
    salary_amount: incoming?.salary_amount ?? 0,

    contract_start_date:
        incoming?.contract_start_date ??
        new Date().toISOString().split('T')[0],

    country_specific_data: {
        ...EMPTY_COUNTRY_DATA,
        ...(incoming?.country_specific_data ?? {}),
        taj_number: incoming?.country_specific_data?.taj_number ?? '',
        tax_id: incoming?.country_specific_data?.tax_id ?? '',
        family_tax_allowance:
            incoming?.country_specific_data?.family_tax_allowance ?? 0,
    },
});

/* =========================================================
   Component
========================================================= */

export default function PayrollEditModal({
    isOpen,
    onClose,
    userId,
    userName,
    currentUserId,
    onSuccess,
}: PayrollEditModalProps) {
    const { t } = useLocale();
    const [payrollId, setPayrollId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [payroll, setPayroll] = useState<EmployeePayroll | null>(null);
    const [isNew, setIsNew] = useState(false);

    const [formData, setFormData] = useState<CreatePayrollRequest>(() =>
        createBaseFormData(userId)
    );

    const updateCountryData = <
        K extends keyof HungarianPayrollData
    >(
        field: K,
        value: HungarianPayrollData[K]
    ) => {
        setFormData((prev) => ({
            ...prev,
            country_specific_data: {
                ...prev.country_specific_data,
                [field]: value,
            },
        }));
    };

    useEffect(() => {
        if (!isOpen) return;

        const fetchPayrollData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/payroll?user_id=${userId}`);
                if (!response.ok)
                    throw new Error(t('payrollModal.errors.fetchError'));

                const result = await response.json();

                if (result.data && result.data.length > 0) {
                    const existingPayroll = result.data[0];
                    setPayroll(existingPayroll);
                    setPayrollId(existingPayroll.id); // NEW: Save ID
                    setIsNew(false);
                    setFormData(
                        normalizePayroll(createBaseFormData(userId), existingPayroll)
                    );
                } else {
                    setIsNew(true);
                    setPayroll(null);
                    setFormData(createBaseFormData(userId));
                }
            } catch (err) {
                console.error('Error fetching payroll:', err);
                setError(
                    err instanceof Error
                        ? err.message
                        : t('payrollModal.errors.loadError')
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPayrollData();
    }, [isOpen, userId, t]);

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            if (!formData.position_title)
                throw new Error(t('payrollModal.validation.positionRequired'));
            if (formData.salary_amount <= 0)
                throw new Error(t('payrollModal.validation.salaryRequired'));

            const countryData =
                formData.country_specific_data as HungarianPayrollData;

            if (!countryData.taj_number || countryData.taj_number.length !== 9)
                throw new Error(t('payrollModal.validation.tajInvalid'));
            if (!countryData.tax_id || countryData.tax_id.length !== 10)
                throw new Error(t('payrollModal.validation.taxIdInvalid'));

            const url = isNew
                ? `/api/payroll?current_user_id=${currentUserId}`
                : `/api/payroll/${payroll?.id}?current_user_id=${currentUserId}`;

            const response = await fetch(url, {
                method: isNew ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || t('payrollModal.errors.saveError')
                );
            }

            onSuccess?.();
            onClose();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : t('payrollModal.errors.saveError')
            );
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Edit3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {isNew ? t('payrollModal.title.add') : t('payrollModal.title.edit')}
                            </h2>
                            <p className="text-sm text-gray-600">{userName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                            <p className="text-gray-600">{t('payrollModal.loading')}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold">{t('payrollModal.errorTitle')}</p>
                                        <p className="text-sm">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Employment Details Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">{t('payrollModal.sections.employment.title')}</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('payrollModal.sections.employment.fields.employmentType')} <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.employment_type}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    employment_type: e.target.value as CreatePayrollRequest['employment_type'],
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="full_time">{t('payrollModal.sections.employment.options.fullTime')}</option>
                                            <option value="part_time">{t('payrollModal.sections.employment.options.partTime')}</option>
                                            <option value="contract">{t('payrollModal.sections.employment.options.contract')}</option>
                                            <option value="intern">{t('payrollModal.sections.employment.options.intern')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('payrollModal.sections.employment.fields.contractType')} <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.contract_type}
                                            onChange={(e) => setFormData({ ...formData, contract_type: e.target.value as CreatePayrollRequest['contract_type'] })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="permanent">{t('payrollModal.sections.employment.options.permanent')}</option>
                                            <option value="fixed_term">{t('payrollModal.sections.employment.options.fixedTerm')}</option>
                                            <option value="temporary">{t('payrollModal.sections.employment.options.temporary')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('payrollModal.sections.employment.fields.positionTitle')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.position_title}
                                            onChange={(e) => setFormData({ ...formData, position_title: e.target.value })}
                                            placeholder={t('payrollModal.sections.employment.placeholders.positionTitle')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('payrollModal.sections.employment.fields.department')}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            placeholder={t('payrollModal.sections.employment.placeholders.department')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('payrollModal.sections.employment.fields.workLocation')}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.work_location}
                                            onChange={(e) => setFormData({ ...formData, work_location: e.target.value })}
                                            placeholder={t('payrollModal.sections.employment.placeholders.workLocation')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('payrollModal.sections.employment.fields.contractStartDate')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.contract_start_date}
                                            onChange={(e) => setFormData({ ...formData, contract_start_date: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('payrollModal.sections.employment.fields.weeklyHours')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.weekly_hours}
                                            onChange={(e) => setFormData({ ...formData, weekly_hours: parseInt(e.target.value) })}
                                            min="1"
                                            max="80"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Compensation Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <CreditCard className="w-5 h-5 text-green-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">{t('payrollModal.sections.compensation.title')}</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('payrollModal.sections.compensation.fields.salaryAmount')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.salary_amount}
                                            onChange={(e) => setFormData({ ...formData, salary_amount: parseFloat(e.target.value) })}
                                            placeholder={t('payrollModal.sections.compensation.placeholders.salaryAmount')}
                                            min="0"
                                            step="1000"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('payrollModal.sections.compensation.fields.currency')} <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.salary_currency}
                                            onChange={(e) => setFormData({ ...formData, salary_currency: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="HUF">HUF</option>
                                            <option value="EUR">EUR</option>
                                            <option value="USD">USD</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('payrollModal.sections.compensation.fields.salaryPeriod')} <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.salary_period}
                                            onChange={(e) => setFormData({ ...formData, salary_period: e.target.value as CreatePayrollRequest['salary_period'] })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="hourly">{t('payrollModal.sections.compensation.options.hourly')}</option>
                                            <option value="monthly">{t('payrollModal.sections.compensation.options.monthly')}</option>
                                            <option value="annually">{t('payrollModal.sections.compensation.options.annually')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('payrollModal.sections.compensation.fields.paymentMethod')} <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.payment_method}
                                            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as CreatePayrollRequest['payment_method'] })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="bank_transfer">{t('payrollModal.sections.compensation.options.bankTransfer')}</option>
                                            <option value="check">{t('payrollModal.sections.compensation.options.check')}</option>
                                            <option value="cash">{t('payrollModal.sections.compensation.options.cash')}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Banking Information Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Building2 className="w-5 h-5 text-purple-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">{t('payrollModal.sections.banking.title')}</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('payrollModal.sections.banking.fields.iban')}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.bank_account_iban}
                                            onChange={(e) => setFormData({ ...formData, bank_account_iban: e.target.value })}
                                            placeholder={t('payrollModal.sections.banking.placeholders.iban')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('payrollModal.sections.banking.fields.bankName')}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.bank_name}
                                            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                            placeholder={t('payrollModal.sections.banking.placeholders.bankName')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Hungarian Tax Information Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield className="w-5 h-5 text-red-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">{t('payrollModal.sections.hungarianTax.title')}</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('payrollModal.sections.hungarianTax.fields.tajNumber')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={(formData.country_specific_data as HungarianPayrollData).taj_number}
                                            onChange={(e) => updateCountryData('taj_number', e.target.value)}
                                            placeholder={t('payrollModal.sections.hungarianTax.placeholders.tajNumber')}
                                            maxLength={9}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{t('payrollModal.sections.hungarianTax.hints.tajNumber')}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('payrollModal.sections.hungarianTax.fields.taxId')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={(formData.country_specific_data as HungarianPayrollData).tax_id}
                                            onChange={(e) => updateCountryData('tax_id', e.target.value)}
                                            placeholder={t('payrollModal.sections.hungarianTax.placeholders.taxId')}
                                            maxLength={10}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{t('payrollModal.sections.hungarianTax.hints.taxId')}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('payrollModal.sections.hungarianTax.fields.taxBracket')} <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={(formData.country_specific_data as HungarianPayrollData).tax_bracket}
                                            onChange={(e) =>
                                                updateCountryData(
                                                    'tax_bracket',
                                                    e.target.value as HungarianPayrollData['tax_bracket']
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >

                                            <option value="1">{t('payrollModal.sections.hungarianTax.options.taxBracket1')}</option>
                                            <option value="2">{t('payrollModal.sections.hungarianTax.options.taxBracket2')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('payrollModal.sections.hungarianTax.fields.familyTaxAllowance')}
                                        </label>
                                        <input
                                            type="number"
                                            value={(formData.country_specific_data as HungarianPayrollData).family_tax_allowance}
                                            onChange={(e) => updateCountryData('family_tax_allowance', parseFloat(e.target.value))}
                                            min="0"
                                            step="1"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{t('payrollModal.sections.hungarianTax.hints.familyTaxAllowance')}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('payrollModal.sections.hungarianTax.fields.pensionFund')} <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={(formData.country_specific_data as HungarianPayrollData).pension_fund}
                                            onChange={(e) =>
                                                updateCountryData(
                                                    'pension_fund',
                                                    e.target.value as HungarianPayrollData['pension_fund']
                                                )
                                            }

                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="government">{t('payrollModal.sections.hungarianTax.options.government')}</option>
                                            <option value="private">{t('payrollModal.sections.hungarianTax.options.private')}</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h4 className="font-semibold text-blue-900 mb-2">{t('payrollModal.sections.hungarianTax.rates.title')}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                                <div>
                                                    <p className="text-blue-700">{t('payrollModal.sections.hungarianTax.rates.personalIncomeTax')}</p>
                                                    <p className="font-semibold text-blue-900">
                                                        {(formData.country_specific_data as HungarianPayrollData).personal_income_tax_rate}%
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-blue-700">{t('payrollModal.sections.hungarianTax.rates.employeeSocialContribution')}</p>
                                                    <p className="font-semibold text-blue-900">
                                                        {(formData.country_specific_data as HungarianPayrollData).employee_social_contribution}%
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-blue-700">{t('payrollModal.sections.hungarianTax.rates.employerSocialContribution')}</p>
                                                    <p className="font-semibold text-blue-900">
                                                        {(formData.country_specific_data as HungarianPayrollData).employer_social_contribution}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Compensation Section */}
                            {payrollId && !isNew && (
                                <div className="border-t pt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <DollarSign className="w-5 h-5 text-purple-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Additional Compensation
                                        </h3>
                                    </div>

                                    <CompensationManager
                                        payrollId={payrollId}
                                        baseSalary={formData.salary_amount}
                                        currency={formData.salary_currency}
                                        currentUserId={currentUserId}
                                        onUpdate={() => {
                                            // Optional: Refresh data
                                            console.log('Compensation updated');
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                    <p className="text-sm text-gray-500">{t('payrollModal.footer.requiredFields')}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={saving}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors disabled:opacity-50"
                        >
                            {t('payrollModal.footer.buttons.cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || loading}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t('payrollModal.footer.buttons.saving')}
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {isNew ? t('payrollModal.footer.buttons.create') : t('payrollModal.footer.buttons.saveChanges')}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,

        document.body
    );
}
