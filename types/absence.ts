// File: types/absence.ts
export interface LeaveBalance {
  leave_type_id: string;
  leave_type_name: string;
  leave_type_name_hu: string;
  leave_type_color: string;
  total_days: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
}

export interface LeaveRequest {
  id: string;
  leave_type_id: string;
  leave_type_name: string;
  leave_type_name_hu: string;
  leave_type_color: string;
  start_date: string;
  end_date: string;
  total_days: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason?: string;
  created_at: string;
  reviewed_at?: string;
  review_notes?: string;
  medical_certificate_id?: string;
  is_medical_confirmed?: boolean;
  hr_validated?: boolean;
}

export interface LeaveType {
  id: string;
  name: string;
  name_hu: string;
  color: string;
  is_paid: boolean;
  requires_medical_certificate: boolean;
  max_days_per_year?: number;
}

export interface PendingApproval {
  id: string;
  user_id: string;  // ADDED
  employee_name: string;
  employee_email: string;
  leave_type_name: string;
  leave_type_name_hu: string;
  leave_type_color: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string;
  created_at: string;
}
