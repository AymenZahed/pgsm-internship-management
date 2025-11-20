import api from './api';

class InternshipService {
  // Get all internships with optional filters
  async getInternships(params = {}) {
    const response = await api.get('/internships', { params });
    return {
      data: response.data.internships,
      pagination: response.pagination
    };
  }
  
  // Get internship by ID
  async getInternshipById(internshipId) {
    const response = await api.get(`/internships/${internshipId}`);
    return response.data;
  }
  
  // Create a new internship
  async createInternship(internshipData) {
    const response = await api.post('/internships', internshipData);
    return response.data;
  }
  
  // Update an existing internship
  async updateInternship(internshipId, internshipData) {
    const response = await api.put(`/internships/${internshipId}`, internshipData);
    return response.data;
  }
  
  // Delete an internship
  async deleteInternship(internshipId) {
    await api.delete(`/internships/${internshipId}`);
  }
  
  // Get internships for a specific hospital
  async getHospitalInternships(hospitalId, params = {}) {
    const response = await api.get(`/hospitals/${hospitalId}/internships`, { params });
    return {
      data: response.data.internships,
      pagination: response.pagination
    };
  }
  
  // Get internships for current user (student)
  async getMyInternships(params = {}) {
    const response = await api.get('/me/internships', { params });
    return {
      data: response.data.internships,
      pagination: response.pagination
    };
  }
  
  // Apply for an internship
  async applyForInternship(internshipId, applicationData) {
    const response = await api.post(`/internships/${internshipId}/apply`, applicationData);
    return response.data;
  }
  
  // Get internship applications
  async getInternshipApplications(internshipId, params = {}) {
    const response = await api.get(`/internships/${internshipId}/applications`, { params });
    return {
      data: response.data.applications,
      pagination: response.pagination
    };
  }
  
  // Get available internship specializations
  async getSpecializations() {
    const response = await api.get('/internships/specializations');
    return response.data.specializations;
  }
  
  // Get internship statistics
  async getInternshipStats() {
    const response = await api.get('/internships/stats');
    return response.data;
  }
  
  // Get internship calendar
  async getInternshipCalendar(params = {}) {
    const response = await api.get('/internships/calendar', { params });
    return response.data.events;
  }
  
  // Export internships to CSV
  async exportInternships(params = {}) {
    const response = await api.get('/internships/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
  
  // Upload internship documents
  async uploadDocuments(internshipId, documents) {
    const formData = new FormData();
    
    // Append each file to the form data
    Object.entries(documents).forEach(([key, file]) => {
      formData.append(key, file);
    });
    
    const response = await api.post(`/internships/${internshipId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.documents;
  }
  
  // Get internship documents
  async getInternshipDocuments(internshipId) {
    const response = await api.get(`/internships/${internshipId}/documents`);
    return response.data.documents;
  }
  
  // Delete internship document
  async deleteDocument(internshipId, documentId) {
    await api.delete(`/internships/${internshipId}/documents/${documentId}`);
  }
  
  // Get internship reviews
  async getInternshipReviews(internshipId, params = {}) {
    const response = await api.get(`/internships/${internshipId}/reviews`, { params });
    return {
      data: response.data.reviews,
      pagination: response.pagination
    };
  }
  
  // Submit internship review
  async submitReview(internshipId, reviewData) {
    const response = await api.post(`/internships/${internshipId}/reviews`, reviewData);
    return response.data;
  }
}

export default new InternshipService();
