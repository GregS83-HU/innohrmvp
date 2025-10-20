'use client';

import { useState, useEffect } from 'react';
import { Plus, X, CheckCircle, Loader2, Search, Calendar, UserCircle, Users } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useLocale } from 'i18n/LocaleProvider';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId: string;
}

interface CompanyUser {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const AddUserModal = ({ isOpen, onClose, onSuccess, companyId }: AddUserModalProps) => {
  const { t } = useLocale();
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    managerId: '',
    employmentStartDate: '',
    isManager: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Manager dropdown states
  const [managers, setManagers] = useState<CompanyUser[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [managerSearch, setManagerSearch] = useState('');
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Fetch managers when modal opens
  useEffect(() => {
    if (isOpen) {
      if (!formData.password) {
        const newPassword = generatePassword();
        setFormData(prev => ({ ...prev, password: newPassword }));
      }
      fetchManagers();
    }
  }, [isOpen]);

  const fetchManagers = async () => {
    if (!companyId) return;
    
    setLoadingManagers(true);
    try {
      const { data, error } = await supabase.rpc('get_company_users', {
        company_id_input: companyId,
      });

      if (error) {
        console.error('Error fetching managers:', error);
        setError(t('addUserModal.errors.failedToLoadManagers'));
        return;
      }

      setManagers(Array.isArray(data) ? (data as CompanyUser[]) : []);
      
      // Check if there are no managers available
      if (!data || data.length === 0) {
        setError(t('addUserModal.errors.noUsersFound'));
      }
    } catch (err) {
      console.error('Error fetching managers:', err);
      setError(t('addUserModal.errors.failedToLoadManagers'));
    } finally {
      setLoadingManagers(false);
    }
  };

  // Filter managers based on search
  const filteredManagers = managers.filter(manager =>
    `${manager.first_name} ${manager.last_name}`.toLowerCase().includes(managerSearch.toLowerCase()) ||
    manager.email.toLowerCase().includes(managerSearch.toLowerCase())
  );

  // Get selected manager name
  const getSelectedManagerName = () => {
    const manager = managers.find(m => m.user_id === formData.managerId);
    return manager ? `${manager.first_name} ${manager.last_name}` : '';
  };

  // Submit user creation via API route
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate employment start date
    if (!formData.employmentStartDate) {
      setError(t('addUserModal.errors.selectStartDate'));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/users/users-creation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          companyId,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || t('addUserModal.errors.failedToCreate'));

      setSuccess(t('addUserModal.success.message', { password: formData.password }));

      setTimeout(() => {
        setFormData({ 
          email: '', 
          firstName: '', 
          lastName: '', 
          password: '',
          managerId: '',
          employmentStartDate: '',
          isManager: false,
        });
        setSuccess(null);
        setError(null);
        onClose();
        onSuccess();
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('addUserModal.errors.unexpectedError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(formData.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy password');
    }
  };

  const regeneratePassword = () => {
    const newPassword = generatePassword();
    setFormData(prev => ({ ...prev, password: newPassword }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{t('addUserModal.header.title')}</h2>
          <button onClick={onClose} disabled={loading}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold mb-2">{success}</p>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 mb-4">
              <p className="text-sm"><strong>{t('addUserModal.success.email')}</strong> {formData.email}</p>
              <p className="text-sm"><strong>{t('addUserModal.success.password')}</strong> {formData.password}</p>
              <button 
                onClick={copyPassword} 
                className="mt-2 text-blue-600 text-xs hover:text-blue-700 font-medium"
              >
                {copied ? t('addUserModal.success.copied') : t('addUserModal.success.copyCredentials')}
              </button>
            </div>
            <p className="text-xs text-gray-500">{t('addUserModal.success.autoClose')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('addUserModal.fields.email.label')} {t('addUserModal.fields.required')}
              </label>
              <input
                type="email"
                required
                placeholder={t('addUserModal.fields.email.placeholder')}
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {/* First and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('addUserModal.fields.firstName.label')} {t('addUserModal.fields.required')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('addUserModal.fields.firstName.placeholder')}
                  value={formData.firstName}
                  onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('addUserModal.fields.lastName.label')} {t('addUserModal.fields.required')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('addUserModal.fields.lastName.placeholder')}
                  value={formData.lastName}
                  onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Manager Selection & Is Manager Toggle - Combined Row */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  {t('addUserModal.fields.manager.label')}
                </label>
                {/* Is Manager Toggle */}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{t('addUserModal.fields.manager.isManagerToggle')}</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isManager: !prev.isManager }))}
                    disabled={loading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      formData.isManager ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    role="switch"
                    aria-checked={formData.isManager}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isManager ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Manager Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowManagerDropdown(!showManagerDropdown)}
                  disabled={loading || loadingManagers || managers.length === 0}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-gray-400" />
                    <span className={formData.managerId ? 'text-gray-900' : 'text-gray-400'}>
                      {loadingManagers ? t('addUserModal.fields.manager.loading') : (formData.managerId ? getSelectedManagerName() : t('addUserModal.fields.manager.placeholder'))}
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    {formData.managerId && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, managerId: '' }));
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
                        disabled={loading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <span className="text-gray-400">▼</span>
                  </div>
                </button>

                {/* Manager Dropdown List */}
                {showManagerDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder={t('addUserModal.fields.manager.search')}
                          value={managerSearch}
                          onChange={e => setManagerSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    {/* Manager List */}
                    <div className="overflow-y-auto max-h-48">
                      {/* Option "Aucun manager" */}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, managerId: '' }));
                          setShowManagerDropdown(false);
                          setManagerSearch('');
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-100 ${
                          !formData.managerId ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <X className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-600 italic">
                            {t('addUserModal.fields.manager.noManager') || 'Aucun manager'}
                          </p>
                        </div>
                      </button>

                      {filteredManagers.length > 0 ? (
                        filteredManagers.map(manager => (
                          <button
                            key={manager.user_id}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, managerId: manager.user_id }));
                              setShowManagerDropdown(false);
                              setManagerSearch('');
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors ${
                              formData.managerId === manager.user_id ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-semibold text-xs">
                                {manager.first_name[0]}{manager.last_name[0]}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {manager.first_name} {manager.last_name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{manager.email}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-center text-gray-500 text-sm">
                          {t('addUserModal.fields.manager.noResults')}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Visual indicator when Is Manager is enabled */}
              {formData.isManager && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                  <Users className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    {t('addUserModal.fields.manager.isManagerInfo')}
                  </p>
                </div>
              )}
            </div>

            {/* Employment Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('addUserModal.fields.employmentStartDate.label')} {t('addUserModal.fields.required')}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={formData.employmentStartDate}
                  onChange={e => setFormData(prev => ({ ...prev, employmentStartDate: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('addUserModal.fields.password.label')} {t('addUserModal.fields.required')}
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
              <div className="flex justify-between mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="text-xs text-gray-600 hover:text-gray-800"
                >
                  {showPassword ? t('addUserModal.fields.password.hide') : t('addUserModal.fields.password.show')}
                </button>
                <button 
                  type="button" 
                  onClick={regeneratePassword} 
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t('addUserModal.fields.password.regenerate')}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || loadingManagers || managers.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg flex justify-center items-center gap-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  {t('addUserModal.buttons.creating')}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {t('addUserModal.buttons.create')}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};