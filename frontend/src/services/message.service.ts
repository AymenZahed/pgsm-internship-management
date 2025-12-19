import api, { ApiResponse } from '@/lib/api';

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  participants: {
    id: string;
    first_name: string;
    last_name: string;
    avatar?: string;
    role: string;
  }[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  attachments?: {
    id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
  }[];
}

export const messageService = {
  async getConversations() {
    const response = await api.get<ApiResponse<Conversation[]>>('/messages/conversations');
    return response.data;
  },

  async getOrCreateConversation(userId: string) {
    const response = await api.post<ApiResponse<{ id: string; isNew: boolean }>>('/messages/conversations', { user_id: userId });
    return response.data;
  },

  async getMessages(conversationId: string, params?: { page?: number; limit?: number }) {
    const response = await api.get<ApiResponse<Message[]>>(`/messages/conversations/${conversationId}/messages`, { params });
    return response.data;
  },

  async sendMessage(conversationId: string, content: string, attachments?: File[]) {
    const formData = new FormData();
    formData.append('conversation_id', conversationId);
    formData.append('content', content);
    
    if (attachments) {
      attachments.forEach((file) => {
        formData.append('attachment', file);
      });
    }

    const response = await api.post<ApiResponse<{ id: string }>>('/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getUnreadCount() {
    const response = await api.get<ApiResponse<{ unread: number }>>('/messages/unread');
    return response.data;
  },
};
