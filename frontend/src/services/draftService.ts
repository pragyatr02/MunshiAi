import api from './api';
import { DraftTransaction, Transaction } from '../types';

export interface ClarifyDraftPayload {
  message?: string;
  clarification?: string;
  answer?: string;
  answers?: Record<string, string>;
  customer_name?: string;
  amount?: number;
  direction?: string;
}

export const draftService = {
  async getDraftById(id: string | number): Promise<DraftTransaction> {
    const response = await api.get<DraftTransaction>(`/drafts/${id}`);
    return response.data;
  },

  async confirmDraft(id: string | number, overrides?: Partial<DraftTransaction>): Promise<Transaction> {
    const response = await api.post<Transaction>(`/drafts/${id}/confirm`, overrides || {});
    return response.data;
  },

  async clarifyDraft(id: string | number, payload: ClarifyDraftPayload | string): Promise<DraftTransaction> {
    const body = typeof payload === 'string' ? { message: payload, clarification: payload } : payload;
    const response = await api.post<DraftTransaction>(`/drafts/${id}/clarify`, body);
    return response.data;
  },

  async rejectDraft(id: string | number, reason?: string): Promise<{ success: boolean; message?: string }> {
    const response = await api.post<{ success: boolean; message?: string }>(`/drafts/${id}/reject`, { reason });
    return response.data;
  },
};

export default draftService;
