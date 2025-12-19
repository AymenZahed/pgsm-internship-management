import api, { ApiResponse } from '@/lib/api';
export interface Student {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  phone?: string;
  student_number?: string;
  faculty?: string;
  department?: string;
  academic_year?: string;
  internship?: {
    id: string;
    status: 'upcoming' | 'active' | 'completed' | 'cancelled';
    progress: number;
    start_date: string;
    end_date: string;
    service_name?: string;
    tutor_name?: string;
  };
}

export interface StudentStats {
  total: number;
  active: number;
  completed: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: 'pending' | 'present' | 'absent' | 'late' | 'excused' | 'approved' | 'rejected';
  hours_worked?: number;
  notes?: string;
}

export interface LogbookEntry {
  id: string;
  date: string;
  title: string;
  activities: string;
  skills_learned?: string;
  reflections?: string;
  challenges?: string;
  supervisor_comments?: string;
  status: 'draft' | 'pending' | 'approved' | 'revision_requested';
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Evaluation {
  id: string;
  type: 'mid-term' | 'final' | 'monthly';
  overall_score: number;
  technical_skills_score?: number;
  patient_relations_score?: number;
  teamwork_score?: number;
  professionalism_score?: number;
  strengths?: string;
  weaknesses?: string;
  recommendations?: string;
  feedback?: string;
  status: 'draft' | 'submitted' | 'acknowledged';
  created_at: string;
  evaluator_name?: string;
}

export interface Application {
  id: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'withdrawn';
  cover_letter?: string;
  motivation?: string;
  experience?: string;
  offer_title?: string;
  hospital_name?: string;
  created_at: string;
  updated_at: string;
}

export interface GetStudentsParams {
  search?: string;
  department?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface GetAttendanceParams {
  startDate?: string;
  endDate?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface GetLogbookParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const studentService = {
  // Get all students for hospital
  async getHospitalStudents(params?: GetStudentsParams) {
    const response = await api.get<ApiResponse>('/hospitals/students', { params });
    return response.data;
  },

  // Get student dashboard data
  async getDashboard() {
    try {
      const response = await api.get<ApiResponse>('/students/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching student dashboard:', error);
      return {
        success: false,
        message: 'Failed to load dashboard'
      };
    }
  },

  // Get student statistics for hospital
  async getHospitalStudentStats() {
    try {
      const response = await api.get<ApiResponse>('/hospitals/statistics');
      if (response.data.success) {
        // Transform backend data to frontend format
        const backendData = response.data.data;
        const overallStats = backendData.overallStats;

        return {
          success: true,
          data: {
            total: overallStats?.total_internships || 0,
            active: 0, // Need to calculate from active internships
            completed: overallStats?.completed_internships || 0
          }
        };
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        success: false,
        message: 'Failed to load statistics'
      };
    }
  },

  // Get student by ID
  async getStudentById(id: string) {
    try {
      // We need to get student data from internships endpoint
      const response = await api.get<ApiResponse>('/hospitals/students');
      if (response.data.success && Array.isArray(response.data.data)) {
        const student = response.data.data.find((s: any) => s.id === id || s.student_id === id);
        if (student) {
          // Transform backend data to frontend format
          const transformedStudent = {
            id: student.id || student.student_id,
            name: `${student.first_name} ${student.last_name}`,
            email: student.email,
            phone: student.phone,
            avatar: student.avatar,
            university: student.faculty || 'University',
            faculty: student.faculty,
            department: student.department || student.service_name,
            status: student.status || 'active',
            progress: student.progress || 0,
            startDate: student.start_date,
            endDate: student.end_date,
            tutor: student.tutor_name || 'Not assigned',
            emergencyContact: student.emergency_contact,
            address: student.address
          };

          return {
            success: true,
            data: transformedStudent
          };
        }
      }
      return {
        success: false,
        message: 'Student not found'
      };
    } catch (error) {
      console.error('Error fetching student:', error);
      return {
        success: false,
        message: 'Failed to load student data'
      };
    }
  },

  // Get student attendance
  async getStudentAttendance(studentId: string, params?: GetAttendanceParams) {
    try {
      // Using the attendance endpoint from backend
      const response = await api.get<ApiResponse>('/attendance', {
        params: { student_id: studentId, ...params }
      });

      if (response.data.success) {
        return response.data;
      }
      return {
        success: false,
        message: 'Failed to load attendance'
      };
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return {
        success: false,
        message: 'Failed to load attendance records'
      };
    }
  },

  // Get student logbook
  async getStudentLogbook(studentId: string, params?: GetLogbookParams) {
    try {
      const response = await api.get<ApiResponse>('/logbook', {
        params: { student_id: studentId, ...params }
      });

      if (response.data.success) {
        return response.data;
      }
      return {
        success: false,
        message: 'Failed to load logbook'
      };
    } catch (error) {
      console.error('Error fetching logbook:', error);
      return {
        success: false,
        message: 'Failed to load logbook entries'
      };
    }
  },

  // Get student evaluations
  async getStudentEvaluations(studentId: string) {
    try {
      const response = await api.get<ApiResponse>('/evaluations', {
        params: { student_id: studentId }
      });

      if (response.data.success) {
        return response.data;
      }
      return {
        success: false,
        message: 'Failed to load evaluations'
      };
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      return {
        success: false,
        message: 'Failed to load evaluations'
      };
    }
  },

  // Get student applications
  async getStudentApplications(studentId: string) {
    try {
      const response = await api.get<ApiResponse>('/applications', {
        params: { student_id: studentId }
      });

      if (response.data.success) {
        return response.data;
      }
      return {
        success: false,
        message: 'Failed to load applications'
      };
    } catch (error) {
      console.error('Error fetching applications:', error);
      return {
        success: false,
        message: 'Failed to load applications'
      };
    }
  },

  // Get internships for the currently logged-in student
  async getMyInternships(status?: 'active' | 'completed') {
    try {
      const response = await api.get<ApiResponse>('/students/my-internships', {
        params: status ? { status } : undefined,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching my internships:', error);
      return {
        success: false,
        message: 'Failed to load internships',
      };
    }
  },

  // Get a specific internship for the currently logged-in student
  async getMyInternshipById(id: string) {
    try {
      const response = await api.get<ApiResponse>(`/students/my-internships/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching internship details:', error);
      return {
        success: false,
        message: 'Failed to load internship details',
      };
    }
  },

  // Validate attendance
  async validateAttendance(attendanceId: string, data: { status: 'approved' | 'rejected' }) {
    try {
      const response = await api.patch<ApiResponse>(`/attendance/${attendanceId}/validate`, data);
      return response.data;
    } catch (error) {
      console.error('Error validating attendance:', error);
      return {
        success: false,
        message: 'Failed to validate attendance'
      };
    }
  },

  // Review logbook entry
  async reviewLogbookEntry(entryId: string, data: { status: 'approved' | 'rejected'; comments?: string }) {
    try {
      const response = await api.patch<ApiResponse>(`/logbook/${entryId}/review`, data);
      return response.data;
    } catch (error) {
      console.error('Error reviewing logbook:', error);
      return {
        success: false,
        message: 'Failed to review logbook entry'
      };
    }
  },

  // Get departments for filtering
  async getDepartments() {
    try {
      const response = await api.get<ApiResponse>('/hospitals/students');
      if (response.data.success && response.data.departments) {
        return {
          success: true,
          data: response.data.departments
        };
      }
      return {
        success: false,
        message: 'Failed to load departments'
      };
    } catch (error) {
      console.error('Error fetching departments:', error);
      return {
        success: false,
        message: 'Failed to load departments'
      };
    }
  },

  // Get logbook entry by ID
  async getLogbookEntryById(entryId: string) {
    try {
      const response = await api.get<ApiResponse>(`/logbook/${entryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching logbook entry:', error);
      return {
        success: false,
        message: 'Failed to load logbook entry'
      };
    }
  },

  // Send message to student (placeholder - would use message endpoint)
  async sendMessage(studentId: string, message: string) {
    try {
      // Using messages endpoint
      const response = await api.post<ApiResponse>('/messages', {
        receiver_id: studentId,
        content: message
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        message: 'Failed to send message'
      };
    }
  }
};