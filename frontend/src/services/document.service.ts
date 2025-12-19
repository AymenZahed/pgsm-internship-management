import api, { ApiResponse } from '@/lib/api';

export interface Document {
  id: string;
  user_id: string;
  application_id?: string;
  type: 'cv' | 'cover_letter' | 'certificate' | 'id_card' | 'transcript' | 'insurance' | 'other';
  name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  status: 'pending' | 'verified' | 'rejected';
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

export type ProfileDocumentType = 'cv' | 'transcript' | 'id_card' | 'insurance' | 'certificate' | 'other';

export const documentService = {
  async uploadDocument(file: File, type: string, applicationId?: string) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);
    if (applicationId) {
      formData.append('application_id', applicationId);
    }

    const response = await api.post<ApiResponse<{ id: string; name: string; path: string }>>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Profile-level documents (tied to user profile, not a specific application)
  async uploadProfileDocument(file: File, type: ProfileDocumentType, name?: string) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);
    if (name) {
      formData.append('name', name);
    }

    const response = await api.post<ApiResponse<{ id: string; name: string; path: string }>>(
      '/users/profile/documents',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  async getProfileDocuments(type?: ProfileDocumentType) {
    const response = await api.get<ApiResponse<Document[]>>('/users/profile/documents', {
      params: { type },
    });
    return response.data;
  },

  async deleteProfileDocument(id: string) {
    const response = await api.delete<ApiResponse>(`/users/profile/documents/${id}`);
    return response.data;
  },

  async getMyDocuments(type?: string) {
    const response = await api.get<ApiResponse<Document[]>>('/documents', { params: { type } });
    return response.data;
  },

  async getDocumentById(id: string) {
    const response = await api.get<ApiResponse<Document>>(`/documents/${id}`);
    return response.data;
  },

  async downloadDocument(id: string) {
    const response = await api.get(`/documents/${id}/download`, { responseType: 'blob' });
    return response.data;
  },

  async deleteDocument(id: string) {
    const response = await api.delete<ApiResponse>(`/documents/${id}`);
    return response.data;
  },

  async verifyDocument(id: string, status: 'verified' | 'rejected') {
    const response = await api.put<ApiResponse>(`/documents/${id}/verify`, { status });
    return response.data;
  },
};
