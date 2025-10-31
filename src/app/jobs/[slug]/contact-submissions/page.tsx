// src/app/jobs/[slug]/contact-submissions/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Mail, Phone, Building2, 
  Calendar, MessageSquare, CheckCircle, Clock,
  AlertCircle, Ban, User, Trash2, ExternalLink,
  StickyNote, X, Save
} from 'lucide-react';

interface ContactSubmission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company_name: string;
  comment: string | null;
  gdpr_consent: boolean;
  marketing_consent: boolean;
  trigger: string;
  ip_address: string;
  user_agent: string;
  submitted_at: string;
  processed_at: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

type StatusType = 'all' | 'new' | 'in_progress' | 'contacted' | 'completed' | 'spam';

interface ContactSubmissionsPageProps {
  params: Promise<{ slug: string }>;
}

export default function ContactSubmissionsPage({ params }: ContactSubmissionsPageProps) {
  const { slug } = React.use(params);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusType>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  const statusConfig = {
    new: { label: 'New', color: 'bg-blue-100 text-blue-800', icon: Mail },
    in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    contacted: { label: 'Contacted', color: 'bg-purple-100 text-purple-800', icon: Phone },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    spam: { label: 'Spam', color: 'bg-red-100 text-red-800', icon: Ban },
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchTerm, statusFilter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contact-submissions');
      const result = await response.json();
      
      if (result.success) {
        setSubmissions(result.data);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sub => 
        sub.first_name.toLowerCase().includes(term) ||
        sub.last_name.toLowerCase().includes(term) ||
        sub.email.toLowerCase().includes(term) ||
        sub.company_name.toLowerCase().includes(term)
      );
    }

    setFilteredSubmissions(filtered);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch('/api/contact-submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (response.ok) {
        setSubmissions(prev => 
          prev.map(sub => sub.id === id ? { ...sub, status: newStatus } : sub)
        );
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const saveNote = async () => {
    if (!selectedSubmission) return;
    
    setIsSavingNote(true);
    try {
      const response = await fetch('/api/contact-submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedSubmission.id, notes: noteText }),
      });

      if (response.ok) {
        setSubmissions(prev => 
          prev.map(sub => sub.id === selectedSubmission.id ? { ...sub, notes: noteText } : sub)
        );
        setSelectedSubmission({ ...selectedSubmission, notes: noteText });
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSavingNote(false);
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    
    try {
      const response = await fetch(`/api/contact-submissions?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSubmissions(prev => prev.filter(sub => sub.id !== id));
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
    }
  };

  const openModal = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setNoteText(submission.notes || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSubmission(null);
    setNoteText('');
  };

  const getStatusCounts = () => {
    return {
      all: submissions.length,
      new: submissions.filter(s => s.status === 'new').length,
      in_progress: submissions.filter(s => s.status === 'in_progress').length,
      contacted: submissions.filter(s => s.status === 'contacted').length,
      completed: submissions.filter(s => s.status === 'completed').length,
      spam: submissions.filter(s => s.status === 'spam').length,
    };
  };

  const counts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Submissions</h1>
          <p className="text-gray-600">Manage and track all contact requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          {Object.entries(counts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as StatusType)}
              className={`p-4 rounded-lg border-2 transition-all ${
                statusFilter === status
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</div>
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
              <p className="text-gray-600">Try adjusting your filters or search term</p>
            </div>
          ) : (
            filteredSubmissions.map((submission) => {
              const StatusIcon = statusConfig[submission.status as keyof typeof statusConfig]?.icon || Mail;
              const statusInfo = statusConfig[submission.status as keyof typeof statusConfig] || statusConfig.new;

              return (
                <div
                  key={submission.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {submission.first_name[0]}{submission.last_name[0]}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {submission.first_name} {submission.last_name}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <a href={`mailto:${submission.email}`} className="hover:text-blue-600">
                              {submission.email}
                            </a>
                          </div>
                          
                          {submission.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <a href={`tel:${submission.phone}`} className="hover:text-blue-600">
                                {submission.phone}
                              </a>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            <span>{submission.company_name}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(submission.submitted_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {submission.comment && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                              <p className="text-sm text-gray-700">{submission.comment}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color} flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <select
                      value={submission.status}
                      onChange={(e) => updateStatus(submission.id, e.target.value)}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="contacted">Contacted</option>
                      <option value="completed">Completed</option>
                      <option value="spam">Spam</option>
                    </select>

                    <button
                      onClick={() => openModal(submission)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Submission Details</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Name</label>
                    <p className="font-medium">{selectedSubmission.first_name} {selectedSubmission.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Company</label>
                    <p className="font-medium">{selectedSubmission.company_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p className="font-medium">{selectedSubmission.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Phone</label>
                    <p className="font-medium">{selectedSubmission.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Comment */}
              {selectedSubmission.comment && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Message</h3>
                  <p className="p-4 bg-gray-50 rounded-lg">{selectedSubmission.comment}</p>
                </div>
              )}

              {/* Notes */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Internal Notes</h3>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add internal notes here..."
                />
                <button
                  onClick={saveNote}
                  disabled={isSavingNote}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingNote ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Notes
                </button>
              </div>

              {/* Meta Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-600">Submitted</label>
                    <p>{new Date(selectedSubmission.submitted_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Trigger</label>
                    <p className="capitalize">{selectedSubmission.trigger}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">GDPR Consent</label>
                    <p>{selectedSubmission.gdpr_consent ? '✓ Yes' : '✗ No'}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Marketing Consent</label>
                    <p>{selectedSubmission.marketing_consent ? '✓ Yes' : '✗ No'}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <button
                  onClick={() => deleteSubmission(selectedSubmission.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}