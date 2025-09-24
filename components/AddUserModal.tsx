'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Eye, EyeOff, Copy, CheckCircle, Loader2 } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId: string;
}

export const AddUserModal = ({ isOpen, onClose, onSuccess, companyId }: AddUserModalProps) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  useEffect(() => {
    if (isOpen && !formData.password) {
      const newPassword = generatePassword();
      setFormData(prev => ({ ...prev, password: newPassword }));
    }
  }, [isOpen, formData.password]);

  // Submit user creation via API route
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/users-creation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, companyId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      setSuccess(`User created successfully! Temporary password: ${formData.password}`);

      setTimeout(() => {
        setFormData({ email: '', firstName: '', lastName: '', password: '' });
        setSuccess(null);
        onClose();
        onSuccess();
      }, 3000);

    } catch (err: any) {
      setError(err.message);
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
          <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
          <button onClick={onClose} disabled={loading}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold mb-2">{success}</p>
            <div className="bg-white rounded border p-3 mb-4">
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Password:</strong> {formData.password}</p>
              <button onClick={copyPassword} className="mt-2 text-blue-600 text-xs">
                {copied ? 'Copied!' : 'Copy credentials'}
              </button>
            </div>
            <p className="text-xs text-gray-500">This window will close automatically</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <input
              type="email"
              required
              placeholder="Email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border rounded-lg"
              disabled={loading}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="First Name"
                value={formData.firstName}
                onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-4 py-3 border rounded-lg"
                disabled={loading}
              />
              <input
                type="text"
                required
                placeholder="Last Name"
                value={formData.lastName}
                onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-4 py-3 border rounded-lg"
                disabled={loading}
              />
            </div>
            <div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 border rounded-lg"
                disabled={loading}
              />
              <div className="flex justify-between mt-2">
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
                <button type="button" onClick={regeneratePassword} className="text-xs text-blue-600">
                  Regenerate Password
                </button>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
