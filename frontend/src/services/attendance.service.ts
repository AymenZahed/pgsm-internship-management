import api, { ApiResponse } from '@/lib/api';

export interface Attendance {
  id: string;
  internship_id: string;
  student_id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: 'pending' | 'present' | 'absent' | 'late' | 'excused' | 'approved' | 'rejected';
  hours_worked?: number;
  notes?: string;
  validated_by?: string;
  validated_at?: string;
  hospital_name?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
}

export const attendanceService = {
  async recordAttendance(data: {
    internship_id: string;
    date: string;
    check_in?: string;
    check_out?: string;
    notes?: string;
  }) {
    const response = await api.post<ApiResponse<{ id: string }>>('/attendance', data);
    return response.data;
  },

  async getMyAttendance(params?: { internship_id?: string; month?: number; year?: number }) {
    const response = await api.get<ApiResponse<{ attendance: Attendance[]; stats: any }>>('/attendance/my-attendance', { params });
    return response.data;
  },

  async getPendingAttendance() {
    const response = await api.get<ApiResponse<Attendance[]>>('/attendance/pending');
    return response.data;
  },

  async getAttendanceHistory(params?: { student_id?: string; date_from?: string; date_to?: string }) {
    const response = await api.get<ApiResponse<Attendance[]>>('/attendance/history', { params });
    return response.data;
  },

  async validateAttendance(id: string, data: { status: string; notes?: string }) {
    const response = await api.put<ApiResponse>(`/attendance/${id}/validate`, data);
    return response.data;
  },
};
