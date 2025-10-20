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
} from 'lucide-react';
import { AddUserModal } from '../../../../../components/AddUserModal';

// ✅ Updated type for company users with new fields
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
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* --------------------
 ManagerDropdownPortal
 - Renders the manager list into document.body
 - Positions next to the anchor element (anchorRef)
 - Handles outside clicks, Escape, reposition on scroll/resize
---------------------*/
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
}) {
  const portalRef = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState({ top: 0, left: 0, width: 320 });

  useEffect(() => {
    if (!open) return;

    const updatePos = () => {
      const a = anchorRef.current;
      if (!a) return;
      const rect = a.getBoundingClientRect();

      // position the portal under the anchor, align left if possible
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
    // listen to scroll on capture so we catch ancestor scrolling
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
      className="bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      <div className="p-2 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search managers..."
            value={managerSearch}
            onChange={(e) => setManagerSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {updatingManager ? (
          <div className="px-4 py-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Updating...</p>
          </div>
        ) : managers.length > 0 ? (
          managers.map((manager) => (
            <button
              key={manager.user_id}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(manager.user_id);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors ${
                selectedManagerId === manager.user_id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-xs">
                  {manager.first_name?.[0] ?? '?'}
                  {manager.last_name?.[0] ?? '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {manager.first_name} {manager.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{manager.email}</p>
              </div>
              {selectedManagerId === manager.user_id && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
            </button>
          ))
        ) : (
          <div className="px-4 py-3 text-center text-gray-500 text-sm">No managers found</div>
        )}
      </div>
    </div>,
    document.body
  );
}

/* --------------------
 Main component
---------------------*/
export default function CompanyUsersPage() {
  const params = useParams<{ slug: string }>();
  const companySlug = params.slug;

  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

  // Manager edit states
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [managerSearch, setManagerSearch] = useState('');
  const [updatingManager, setUpdatingManager] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  // anchorRef points to the button that opened the dropdown
  const anchorRef = useRef<HTMLElement | null>(null);


  // ✅ Helper function to get role badge
  const getRoleBadge = (user: CompanyUser) => {
    // Admin takes priority over manager
    if (user.is_admin) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
          <ShieldCheck className="w-3 h-3 mr-1" /> Admin
        </span>
      );
    }
    
    // Show manager badge if user is manager but not admin
    if (user.is_manager) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
          <Users className="w-3 h-3 mr-1" /> Manager
        </span>
      );
    }
    
    // Default user badge
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200">
        <Shield className="w-3 h-3 mr-1" /> User
      </span>
    );
  };

  // ✅ Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ✅ Fetch company ID by slug
  const fetchCompanyId = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('company').select('id').eq('slug', companySlug).single();

      if (error || !data?.id) {
        setError('Company not found');
        setLoading(false);
        return;
      }
      setCompanyId(data.id.toString());
    } catch {
      setError('Error fetching company ID');
      setLoading(false);
    }
  }, [companySlug]);

  // ✅ Fetch company users via RPC
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
      setError('Unexpected error fetching users');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // ✅ Update manager
  const updateManager = async (userId: string, newManagerId: string) => {
    setUpdatingManager(true);
    try {
      const res = await fetch('/api/users/update-manager', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, managerId: newManagerId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to update manager');

      // Show success feedback
      setUpdateSuccess(userId);
      setTimeout(() => setUpdateSuccess(null), 2000);

      // Refresh users list
      await fetchCompanyUsers();
      setEditingUserId(null);
      setManagerSearch('');
    } catch (err) {
      console.error('Error updating manager:', err);
      alert(err instanceof Error ? err.message : 'Failed to update manager');
    } finally {
      setUpdatingManager(false);
    }
  };

  // ✅ Filter managers based on search (exclude the user being edited)
  const getFilteredManagers = (excludeUserId: string) => {
    return users.filter(
      (user) =>
        user.user_id !== excludeUserId &&
        (`${user.first_name} ${user.last_name}`.toLowerCase().includes(managerSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(managerSearch.toLowerCase()))
    );
  };

  // ✅ Close dropdown on Escape (keeps original behavior)
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

  // ✅ Filtering logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchTerm ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === 'all' ||
      (roleFilter === 'admin' && user.is_admin) ||
      (roleFilter === 'user' && !user.is_admin);

    return matchesSearch && matchesRole;
  });

  // ✅ Effects
  useEffect(() => {
    fetchCompanyId();
  }, [fetchCompanyId]);

  useEffect(() => {
    if (companyId) fetchCompanyUsers();
  }, [companyId, fetchCompanyUsers]);

  // ✅ Loading state
  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-center">Loading users...</p>
        </div>
      </div>
    );

  // ✅ Error state
  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  // find the user object currently being edited
  const editingUser = editingUserId ? users.find((u) => u.user_id === editingUserId) ?? null : null;
  const managersForEditingUser = editingUserId ? getFilteredManagers(editingUserId) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Company Users</h1>
                <p className="text-gray-600">{users.length} team members</p>
              </div>
            </div>

            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add User</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-2 min-w-fit">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'user')}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="user">Users</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Content */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || roleFilter !== 'all' ? 'No users found' : 'No users yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || roleFilter !== 'all' ? 'Try adjusting your search or filter criteria.' : 'Get started by adding your first team member.'}
            </p>
            {!searchTerm && roleFilter === 'all' && (
              <button onClick={() => setIsAddUserModalOpen(true)} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                Add First User
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Manager</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((user) => (
                      <tr key={user.user_id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {user.first_name?.[0]}
                                {user.last_name?.[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{user.first_name} {user.last_name}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-gray-600">
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
                                disabled={updatingManager}
                                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors group/manager"
                              >
                                <UserCircle className="w-4 h-4 text-gray-400 group-hover/manager:text-blue-500" />
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
                                disabled={updatingManager}
                                className="text-gray-400 text-sm hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                              >
                                + Add manager
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-400" />
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
                <div key={user.user_id} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold">
                        {user.first_name?.[0]}
                        {user.last_name?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">{user.first_name} {user.last_name}</h3>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </div>
                        {getRoleBadge(user)}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-2 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <UserCircle className="w-4 h-4" />
                        <span>Manager:</span>
                      </div>
                      <div className="relative">
                        {user.manager_first_name && user.manager_last_name ? (
                          <button
                            onClick={(e) => {
                              anchorRef.current = e.currentTarget as HTMLElement;
                              setEditingUserId(user.user_id);
                              setManagerSearch('');
                            }}
                            disabled={updatingManager}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 flex items-center gap-1"
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
                            disabled={updatingManager}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            + Add manager
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Start Date:</span>
                      <span className="font-medium">{formatDate(user.employment_start_date)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Manager dropdown portal (single shared portal) */}
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
      />

      {/* Add User Modal */}
      <AddUserModal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} onSuccess={fetchCompanyUsers} companyId={companyId || ''} />
    </div>
  );
}
