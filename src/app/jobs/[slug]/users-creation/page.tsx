'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Users,
  Plus,
  Loader2,
  AlertCircle,
  Mail,
  Shield,
  ShieldCheck,
  Search,
  Filter,
  UserCircle,
  Calendar,
  Check,
  Edit3,
  Power,
  } from 'lucide-react';
import { AddUserModal } from '../../../../../components/AddUserModal';
import { useLocale } from '../../../../i18n/LocaleProvider';
import { safeErrorInfo } from '../../../../../lib/logSafe';

interface CompanyUser {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
  is_super_admin: boolean;
  is_manager: boolean;
  manager_id: string | null;
  manager_first_name: string | null;
  manager_last_name: string | null;
  employment_start_date: string | null;
  is_active: boolean;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
  isActivating,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  isActivating: boolean;
  isLoading: boolean;
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            isActivating ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isActivating ? (
              <Power className="w-6 h-6 text-green-600" />
            ) : (
              <Power className="w-6 h-6 text-red-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {isActivating ? 'Activate User' : 'Deactivate User'}
            </h3>
            <p className="text-slate-600 text-sm">
              {isActivating
                ? `Are you sure you want to activate ${userName}? They will regain access to the system.`
                : `Are you sure you want to deactivate ${userName}? They will lose access to the system.`}
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2 ${
              isActivating
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isActivating ? 'Activate' : 'Deactivate'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ManagerDropdownPortal({
  open,
  anchorRef,
  managers,
  managerSearch,
  setManagerSearch,
  onSelect,
  updatingManager,
  selectedManagerId,
  onClose,
  t,
}: {
  open: boolean;
  anchorRef: React.MutableRefObject<HTMLElement | null>;
  managers: CompanyUser[];
  managerSearch: string;
  setManagerSearch: (v: string) => void;
  onSelect: (managerId: string) => void;
  updatingManager: boolean;
  selectedManagerId?: string | null;
  onClose: () => void;
  t: (key: string) => string;
}) {
  const portalRef = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState({ top: 0, left: 0, width: 320 });

  useEffect(() => {
    if (!open) return;

    const updatePos = () => {
      const a = anchorRef.current;
      if (!a) return;
      const rect = a.getBoundingClientRect();

      const desiredWidth = 320;
      let left = rect.left + window.scrollX;
      const viewportRight = window.scrollX + window.innerWidth;
      if (left + desiredWidth > viewportRight - 8) {
        left = Math.max(8 + window.scrollX, viewportRight - desiredWidth - 8);
      }
      const top = rect.bottom + window.scrollY + 6;
      const width = Math.min(desiredWidth, window.innerWidth - 16);

      setStyle({ top, left, width });
    };

    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;

    const handleOutside = (e: MouseEvent | TouchEvent) => {
      const node = portalRef.current;
      const anchor = anchorRef.current;
      const target = e.target as Node | null;
      if (!node) return;
      if (node.contains(target)) return;
      if (anchor && anchor.contains(target)) return;
      onClose();
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, anchorRef, onClose]);

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={portalRef}
      style={{ position: 'absolute', top: style.top, left: style.left, width: style.width, zIndex: 9999 }}
      className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      <div className="p-2 border-b border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('companyUsers.managerDropdown.searchPlaceholder')}
            value={managerSearch}
            onChange={(e) => setManagerSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            autoFocus
          />
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {updatingManager ? (
          <div className="px-4 py-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">{t('companyUsers.managerDropdown.updating')}</p>
          </div>
        ) : managers.length > 0 ? (
          managers.map((manager) => (
            <button
              key={manager.user_id}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(manager.user_id);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-brand-50 flex items-center gap-3 transition-colors ${
                selectedManagerId === manager.user_id ? 'bg-brand-50' : ''
              }`}
            >
              <div className="w-8 h-8 bg-brand-50 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-brand-700 font-semibold text-xs">
                  {manager.first_name?.[0] ?? '?'}
                  {manager.last_name?.[0] ?? '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">
                  {manager.first_name} {manager.last_name}
                </p>
                <p className="text-xs text-slate-500 truncate">{manager.email}</p>
              </div>
              {selectedManagerId === manager.user_id && <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />}
            </button>
          ))
        ) : (
          <div className="px-4 py-3 text-center text-slate-500 text-sm">{t('companyUsers.managerDropdown.noManagers')}</div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default function CompanyUsersPage() {
  const params = useParams<{ slug: string }>();
  const companySlug = params.slug;
  const { t } = useLocale();

  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [managerSearch, setManagerSearch] = useState('');
  const [updatingManager, setUpdatingManager] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null);

  // Status update states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string;
    isActivating: boolean;
  }>({
    isOpen: false,
    userId: null,
    userName: '',
    isActivating: false,
  });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const getRoleBadge = (user: CompanyUser) => {
    if (user.is_admin) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-green-800 border border-green-200">
          <ShieldCheck className="w-3 h-3 mr-1" /> {t('companyUsers.roles.admin')}
        </span>
      );
    }
    
    if (user.is_manager) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-brand-800 border border-brand-200">
          <Users className="w-3 h-3 mr-1" /> {t('companyUsers.roles.manager')}
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
        <Shield className="w-3 h-3 mr-1" /> {t('companyUsers.roles.user')}
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('companyUsers.common.na');
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const fetchCompanyId = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('company').select('id').eq('slug', companySlug).single();

      if (error || !data?.id) {
        setError(t('companyUsers.errors.companyNotFound'));
        setLoading(false);
        return;
      }
      setCompanyId(data.id.toString());
    } catch {
      setError(t('companyUsers.errors.fetchCompanyId'));
      setLoading(false);
    }
  }, [companySlug, t]);

  const fetchCompanyUsers = useCallback(async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_company_users', {
        company_id_input: parseInt(companyId, 10),
      });

      if (error) {
        setError(error.message);
        return;
      }

      setUsers(Array.isArray(data) ? (data as CompanyUser[]) : []);
    } catch {
      setError(t('companyUsers.errors.fetchUsers'));
    } finally {
      setLoading(false);
    }
  }, [companyId, t]);

  const updateManager = async (userId: string, newManagerId: string) => {
    setUpdatingManager(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error(t('companyUsers.errors.updateManager'));
      }

      const res = await fetch('/api/users/update-manager', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId, managerId: newManagerId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || t('companyUsers.errors.updateManager'));

      setUpdateSuccess(userId);
      setTimeout(() => setUpdateSuccess(null), 2000);

      await fetchCompanyUsers();
      setEditingUserId(null);
      setManagerSearch('');
    } catch (err) {
      console.error('Error updating manager:', safeErrorInfo(err));
      alert(err instanceof Error ? err.message : t('companyUsers.errors.updateManager'));
    } finally {
      setUpdatingManager(false);
    }
  };

  const handleStatusToggle = (user: CompanyUser) => {
    setConfirmModal({
      isOpen: true,
      userId: user.user_id,
      userName: `${user.first_name} ${user.last_name}`,
      isActivating: !user.is_active,
    });
  };

  const confirmStatusUpdate = async () => {
    if (!confirmModal.userId) return;

    setUpdatingStatus(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Failed to update user status');
      }

      const res = await fetch('/api/users/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: confirmModal.userId,
          isActive: confirmModal.isActivating,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to update user status');

      await fetchCompanyUsers();
      setConfirmModal({ isOpen: false, userId: null, userName: '', isActivating: false });
    } catch (err) {
      console.error('Error updating user status:', safeErrorInfo(err));
      alert(err instanceof Error ? err.message : 'Failed to update user status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getFilteredManagers = (excludeUserId: string) => {
    return users.filter(
      (user) =>
        user.user_id !== excludeUserId &&
        user.is_active &&
        (`${user.first_name} ${user.last_name}`.toLowerCase().includes(managerSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(managerSearch.toLowerCase()))
    );
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setEditingUserId(null);
        setManagerSearch('');
        anchorRef.current = null;
      }
    };

    if (editingUserId) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [editingUserId]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchTerm ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === 'all' ||
      (roleFilter === 'admin' && user.is_admin) ||
      (roleFilter === 'user' && !user.is_admin);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  useEffect(() => {
    fetchCompanyId();
  }, [fetchCompanyId]);

  useEffect(() => {
    if (companyId) fetchCompanyUsers();
  }, [companyId, fetchCompanyUsers]);

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-4" />
          <p className="text-slate-600 text-center">{t('companyUsers.loading')}</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">{t('companyUsers.errorState.title')}</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium transition-colors shadow-sm hover:shadow-md"
          >
            {t('companyUsers.errorState.tryAgain')}
          </button>
        </div>
      </div>
    );

  const editingUser = editingUserId ? users.find((u) => u.user_id === editingUserId) ?? null : null;
  const managersForEditingUser = editingUserId ? getFilteredManagers(editingUserId) : [];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('companyUsers.header.title')}</h1>
                <p className="text-slate-600">{t('companyUsers.header.teamMembers', { count: users.length })}</p>
              </div>
            </div>

            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md transform "
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('companyUsers.header.addUser')}</span>
              <span className="sm:hidden">{t('companyUsers.header.add')}</span>
            </button>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('companyUsers.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 min-w-fit">
                <Power className="w-4 h-4 text-slate-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors bg-white"
                >
                  <option value="active">Active Users</option>
                  <option value="inactive">Inactive Users</option>
                  <option value="all">All Users</option>
                </select>
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-2 min-w-fit">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'user')}
                  className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors bg-white"
                >
                  <option value="all">{t('companyUsers.filter.allRoles')}</option>
                  <option value="admin">{t('companyUsers.filter.admins')}</option>
                  <option value="user">{t('companyUsers.filter.users')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Content */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'active' ? t('companyUsers.empty.noUsersFound') : t('companyUsers.empty.noUsersYet')}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'active' ? t('companyUsers.empty.tryAdjusting') : t('companyUsers.empty.getStarted')}
            </p>
            {!searchTerm && roleFilter === 'all' && statusFilter === 'active' && (
              <button onClick={() => setIsAddUserModalOpen(true)} className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium transition-colors">
                {t('companyUsers.empty.addFirstUser')}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{t('companyUsers.table.name')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{t('companyUsers.table.email')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{t('companyUsers.table.manager')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{t('companyUsers.table.startDate')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{t('companyUsers.table.role')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => (
                      <tr 
                        key={user.user_id} 
                        className={`hover:bg-slate-50 transition-colors group ${!user.is_active ? 'opacity-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleStatusToggle(user)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                              user.is_active ? 'bg-green-600' : 'bg-slate-300'
                            }`}
                            title={user.is_active ? 'Active' : 'Inactive'}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                user.is_active ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center">
                              <span className="text-brand-700 font-semibold text-sm">
                                {user.first_name?.[0]}
                                {user.last_name?.[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{user.first_name} {user.last_name}</p>
                              {!user.is_active && (
                                <span className="text-xs text-red-600 font-medium">Inactive</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail className="w-4 h-4" />
                            <span>{user.email}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative">
                            {user.manager_first_name && user.manager_last_name ? (
                              <button
                                onClick={(e) => {
                                  anchorRef.current = e.currentTarget as HTMLElement;
                                  setEditingUserId(user.user_id);
                                  setManagerSearch('');
                                }}
                                disabled={updatingManager || !user.is_active}
                                className="flex items-center gap-2 text-slate-700 hover:text-brand-600 hover:bg-brand-50 px-2 py-1 rounded-lg transition-colors group/manager disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <UserCircle className="w-4 h-4 text-slate-400 group-hover/manager:text-brand-500" />
                                <span>{user.manager_first_name} {user.manager_last_name}</span>
                                {updateSuccess === user.user_id ? (
                                  <Check className="w-3 h-3 text-green-500" />
                                ) : (
                                  <Edit3 className="w-3 h-3 opacity-0 group-hover/manager:opacity-100 transition-opacity" />
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  anchorRef.current = e.currentTarget as HTMLElement;
                                  setEditingUserId(user.user_id);
                                  setManagerSearch('');
                                }}
                                disabled={updatingManager || !user.is_active}
                                className="text-slate-400 text-sm hover:text-brand-600 hover:bg-brand-50 px-2 py-1 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {t('companyUsers.table.addManager')}
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{formatDate(user.employment_start_date)}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(user)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-4">
              {filteredUsers.map((user) => (
                <div 
                  key={user.user_id} 
                  className={`bg-white rounded-xl p-4 shadow-sm border border-slate-100 ${!user.is_active ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-brand-700 font-semibold">
                        {user.first_name?.[0]}
                        {user.last_name?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-slate-900 truncate">
                            {user.first_name} {user.last_name}
                            {!user.is_active && (
                              <span className="ml-2 text-xs text-red-600 font-medium">Inactive</span>
                            )}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </div>
                        {getRoleBadge(user)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Power className="w-4 h-4" />
                        <span>Status</span>
                      </div>
                      <button
                        onClick={() => handleStatusToggle(user)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                          user.is_active ? 'bg-green-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            user.is_active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <UserCircle className="w-4 h-4" />
                        <span>{t('companyUsers.mobile.manager')}</span>
                      </div>
                      <div className="relative">
                        {user.manager_first_name && user.manager_last_name ? (
                          <button
                            onClick={(e) => {
                              anchorRef.current = e.currentTarget as HTMLElement;
                              setEditingUserId(user.user_id);
                              setManagerSearch('');
                            }}
                            disabled={updatingManager || !user.is_active}
                            className="text-sm font-medium text-slate-900 hover:text-brand-600 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {user.manager_first_name} {user.manager_last_name}
                            {updateSuccess === user.user_id ? <Check className="w-3 h-3 text-green-500" /> : <Edit3 className="w-3 h-3" />}
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              anchorRef.current = e.currentTarget as HTMLElement;
                              setEditingUserId(user.user_id);
                              setManagerSearch('');
                            }}
                            disabled={updatingManager || !user.is_active}
                            className="text-sm text-brand-600 hover:text-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {t('companyUsers.mobile.addManager')}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">{t('companyUsers.mobile.startDate')}</span>
                      <span className="font-medium">{formatDate(user.employment_start_date)}</span>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* EXISTING MODALS */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, userId: null, userName: '', isActivating: false })}
        onConfirm={confirmStatusUpdate}
        userName={confirmModal.userName}
        isActivating={confirmModal.isActivating}
        isLoading={updatingStatus}
      />

      <ManagerDropdownPortal
        open={!!editingUserId}
        anchorRef={anchorRef}
        managers={managersForEditingUser}
        managerSearch={managerSearch}
        setManagerSearch={setManagerSearch}
        onSelect={(managerId) => {
          if (!editingUserId) return;
          updateManager(editingUserId, managerId);
        }}
        updatingManager={updatingManager}
        selectedManagerId={editingUser?.manager_id ?? null}
        onClose={() => {
          setEditingUserId(null);
          setManagerSearch('');
          anchorRef.current = null;
        }}
        t={t}
      />

      <AddUserModal 
        isOpen={isAddUserModalOpen} 
        onClose={() => setIsAddUserModalOpen(false)} 
        onSuccess={fetchCompanyUsers} 
        companyId={companyId || ''} 
      />
    </div>
  );
}