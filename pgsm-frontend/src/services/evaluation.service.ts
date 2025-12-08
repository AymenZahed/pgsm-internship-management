import api, { ApiResponse } from '@/lib/api';

export interface Evaluation {
  id: string;
  internship_id: string;
  student_id: string;
  evaluator_id: string;
  type: 'mid-term' | 'final' | 'monthly';
  overall_score?: number;
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
  evaluator_first_name?: string;
  evaluator_last_name?: string;
  first_name?: string;
  last_name?: string;
  hospital_name?: string;
}

export const evaluationService = {
  async createEvaluation(data: {
    internship_id: string;
    type: string;
    technical_skills_score: number;
    patient_relations_score: number;
    teamwork_score: number;
    professionalism_score: number;
    strengths?: string;
    weaknesses?: string;
    recommendations?: string;
    feedback?: string;
  }) {
    const response = await api.post<ApiResponse<{ id: string; overall_score: number }>>('/evaluations', data);
    return response.data;
  },

  async getDoctorEvaluations(status?: string) {
    const response = await api.get<ApiResponse<Evaluation[]>>('/evaluations/my-evaluations', { params: { status } });
    return response.data;
  },

  async getStudentEvaluations() {
    const response = await api.get<ApiResponse<{ evaluations: Evaluation[]; stats: any }>>('/evaluations/student');
    return response.data;
  },

  async getPendingEvaluations() {
    const response = await api.get<ApiResponse<any[]>>('/evaluations/pending');
    return response.data;
  },

  async getEvaluationById(id: string) {
    const response = await api.get<ApiResponse<Evaluation>>(`/evaluations/${id}`);
    return response.data;
  },

  async updateEvaluation(id: string, data: Partial<Evaluation>) {
    const response = await api.put<ApiResponse>(`/evaluations/${id}`, data);
    return response.data;
  },
};
