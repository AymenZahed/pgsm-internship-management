import api, { ApiResponse } from '@/lib/api';

export interface LogbookEntry {
  id: string;
  internship_id: string;
  student_id: string;
  date: string;
  title?: string;
  activities: string;
  skills_learned?: string;
  reflections?: string;
  challenges?: string;
  supervisor_comments?: string;
  status: 'draft' | 'pending' | 'approved' | 'revision_requested';
  reviewed_by?: string;
  reviewed_at?: string;
  hospital_name?: string;
  reviewer_first_name?: string;
  reviewer_last_name?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
}

export const logbookService = {
  async createEntry(data: {
    internship_id: string;
    date: string;
    title?: string;
    activities: string;
    skills_learned?: string;
    reflections?: string;
    challenges?: string;
  }) {
    const response = await api.post<ApiResponse<{ id: string }>>('/logbook', data);
    return response.data;
  },

  async getMyEntries(params?: { internship_id?: string; status?: string }) {
    const response = await api.get<ApiResponse<LogbookEntry[]>>('/logbook/my-entries', { params });
    return response.data;
  },

  async getEntryById(id: string) {
    const response = await api.get<ApiResponse<LogbookEntry>>(`/logbook/${id}`);
    return response.data;
  },

  async updateEntry(id: string, data: Partial<LogbookEntry>) {
    const response = await api.put<ApiResponse>(`/logbook/${id}`, data);
    return response.data;
  },

  async deleteEntry(id: string) {
    const response = await api.delete<ApiResponse>(`/logbook/${id}`);
    return response.data;
  },

  async getPendingEntries() {
    const response = await api.get<ApiResponse<LogbookEntry[]>>('/logbook/pending');
    return response.data;
  },

  async getReviewedEntries() {
    const response = await api.get<ApiResponse<LogbookEntry[]>>('/logbook/reviewed');
    return response.data;
  },

  async reviewEntry(id: string, data: { status: 'approved' | 'revision_requested'; supervisor_comments?: string }) {
    const response = await api.put<ApiResponse>(`/logbook/${id}/review`, data);
    return response.data;
  },
};
