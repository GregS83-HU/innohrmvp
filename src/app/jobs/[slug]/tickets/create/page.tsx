'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Ticket,
  ArrowLeft,
  Upload,
  X,
  FileText,
  AlertCircle,
  Loader2,
  Check
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AttachmentFile extends File {
  id: string;
}

export default function CreateTicketPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const companySlug = params.slug;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: ''
  });
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Categories for the dropdown
  const categories = [
    'Technical Support',
    'Bug Report',
    'Feature Request',
    'Account Issue',
    'Billing',
    'General Inquiry',
    'Other'
  ];

  // Fetch company ID and current user
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push(`/jobs/${companySlug}/login`);
          return;
        }

        // Get user details
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (userError || !userData) {
          setError('User not found');
          return;
        }

        setCurrentUser(userData);

        // Get company ID
        const { data: companyData, error: companyError } = await supabase
          .from('company')
          .select('id')
          .eq('slug', companySlug)
          .single();

        if (companyError || !companyData) {
          setError('Company not found');
          return;
        }

        setCompanyId(companyData.id.toString());
      } catch (err) {
        setError('Failed to load initial data');
      }
    };

    fetchInitialData();
  }, [companySlug, router]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: AttachmentFile[] = [];

    files.forEach((file) => {
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError(`File "${file.name}" is too large. Maximum size is 5MB.`);
        return;
      }

      // Add unique ID to file
      const fileWithId = Object.assign(file, { id: Math.random().toString(36).substr(2, 9) });
      validFiles.push(fileWithId);
    });

    setAttachments(prev => [...prev, ...validFiles]);
    // Clear the input
    event.target.value = '';
  };

  // Remove attachment
  const removeAttachment = (fileId: string) => {
    setAttachments(prev => prev.filter(file => file.id !== fileId));
  };

  // Upload files to Supabase Storage
  const uploadFiles = async (ticketId: string) => {
    const uploadPromises = attachments.map(async (file) => {
      const fileName = `${currentUser.id}/${ticketId}/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('ticket-attachments')
        .upload(fileName, file);

      if (error) throw error;

      // Save attachment record to database
      const { error: dbError } = await supabase
        .from('ticket_attachments')
        .insert({
          ticket_id: ticketId,
          file_name: file.name,
          file_path: data.path,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: currentUser.id
        });

      if (dbError) throw dbError;
    });

    await Promise.all(uploadPromises);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !currentUser) return;

    setLoading(true);
    setError(null);

    try {
      // Create ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          category: formData.category || null,
          company_id: companyId,
          user_id: currentUser.id,
          user_email: currentUser.email,
          user_name: `${currentUser.user_firstname} ${currentUser.user_lastname}`
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Upload attachments if any
      if (attachments.length > 0) {
        await uploadFiles(ticketData.id);
      }

      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/jobs/${companySlug}/tickets`);
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Ticket Created Successfully!
          </h2>
          <p className="text-gray-600 mb-4">
            Your support ticket has been submitted and our team will respond soon.
          </p>
          <div className="animate-pulse text-blue-600">Redirecting...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Create Support Ticket
              </h1>
              <p className="text-gray-600">Describe your issue and we'll help you resolve it</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">Error</h4>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Brief description of your issue"
                />
              </div>

              {/* Priority and Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="priority" className="block text-sm font-semibold text-gray-900 mb-2">
                    Priority *
                  </label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-900 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Please provide detailed information about your issue..."
                />
              </div>

              {/* File Attachments */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Attachments <span className="font-normal text-gray-500">(Max 5MB per file)</span>
                </label>
                
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept="*/*"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      <span className="text-blue-600 font-semibold">Click to upload</span> or drag and drop files here
                    </p>
                  </label>
                </div>

                {/* Attachment List */}
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(file.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title || !formData.description}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Ticket'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}