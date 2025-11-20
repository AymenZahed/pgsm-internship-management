import api from './api';

class ApplicationService {
  // Get all applications with optional filters
  async getApplications(params = {}) {
    const response = await api.get('/applications', { params });
    return {
      data: response.data.applications,
      pagination: response.pagination
    };
  }
  
  // Get application by ID
  async getApplicationById(applicationId) {
    const response = await api.get(`/applications/${applicationId}`);
    return response.data;
  }
  
  // Create a new application
  async createApplication(applicationData) {
    const response = await api.post('/applications', applicationData);
    return response.data;
  }
  
  // Update an existing application
  async updateApplication(applicationId, applicationData) {
    const response = await api.put(`/applications/${applicationId}`, applicationData);
    return response.data;
  }
  
  // Delete an application
  async deleteApplication(applicationId) {
    await api.delete(`/applications/${applicationId}`);
  }
  
  // Submit an application
  async submitApplication(applicationId) {
    const response = await api.post(`/applications/${applicationId}/submit`);
    return response.data;
  }
  
  // Withdraw an application
  async withdrawApplication(applicationId, reason = '') {
    const response = await api.post(`/applications/${applicationId}/withdraw`, { reason });
    return response.data;
  }
  
  // Update application status (admin/hospital)
  async updateApplicationStatus(applicationId, status, feedback = '') {
    const response = await api.patch(`/applications/${applicationId}/status`, {
      status,
      feedback
    });
    return response.data;
  }
  
  // Get applications for current user (student)
  async getMyApplications(params = {}) {
    const response = await api.get('/me/applications', { params });
    return {
      data: response.data.applications,
      pagination: response.pagination
    };
  }
  
  // Get applications for an internship (hospital)
  async getInternshipApplications(internshipId, params = {}) {
    const response = await api.get(`/internships/${internshipId}/applications`, { params });
    return {
      data: response.data.applications,
      pagination: response.pagination
    };
  }
  
  // Upload application documents
  async uploadDocuments(applicationId, documents) {
    const formData = new FormData();
    
    // Append each file to the form data
    Object.entries(documents).forEach(([key, file]) => {
      formData.append(key, file);
    });
    
    const response = await api.post(`/applications/${applicationId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.documents;
  }
  
  // Get application documents
  async getApplicationDocuments(applicationId) {
    const response = await api.get(`/applications/${applicationId}/documents`);
    return response.data.documents;
  }
  
  // Delete application document
  async deleteDocument(applicationId, documentId) {
    await api.delete(`/applications/${applicationId}/documents/${documentId}`);
  }
  
  // Get application timeline
  async getApplicationTimeline(applicationId) {
    const response = await api.get(`/applications/${applicationId}/timeline`);
    return response.data.events;
  }
  
  // Add a note to an application (admin/hospital)
  async addApplicationNote(applicationId, note) {
    const response = await api.post(`/applications/${applicationId}/notes`, { note });
    return response.data;
  }
  
  // Get application notes
  async getApplicationNotes(applicationId) {
    const response = await api.get(`/applications/${applicationId}/notes`);
    return response.data.notes;
  }
  
  // Get application statistics
  async getApplicationStats() {
    const response = await api.get('/applications/stats');
    return response.data;
  }
  
  // Export applications to CSV
  async exportApplications(params = {}) {
    const response = await api.get('/applications/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
  
  // Get application form fields
  async getApplicationFormFields() {
    const response = await api.get('/applications/form-fields');
    return response.data.fields;
  }
  
  // Validate application form
  async validateApplicationForm(formData) {
    const response = await api.post('/applications/validate', formData);
    return response.data;
  }
}

export default new ApplicationService();
