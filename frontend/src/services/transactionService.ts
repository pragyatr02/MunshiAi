import api from './api';
import { Transaction } from '../types';

export interface ProcessTransactionPayload {
  text?: string;
  customer_id?: string | number;
  customer_name?: string;
  amount?: number;
  transaction_type?: string;
  money_direction?: string;
  description?: string;
  items?: Array<{
    product_id?: string | number;
    product_name?: string;
    quantity?: number;
    price?: number;
  }>;
}

export interface ConfirmTransactionPayload {
  draft_id?: string | number;
  transaction_id?: string | number;
  customer_id?: string | number;
  customer_name?: string;
  amount?: number;
  transaction_type?: string;
  money_direction?: string;
  payment_status?: string;
  items?: Array<{
    product_id?: string | number;
    product_name?: string;
    quantity?: number;
    price?: number;
  }>;
}

export const transactionService = {
  async getTransactions(params?: { customer_id?: string | number; limit?: number; offset?: number }): Promise<Transaction[]> {
    const response = await api.get<Transaction[] | { transactions: Transaction[] }>('/transactions', { params });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray((response.data as { transactions?: Transaction[] }).transactions)) {
      return (response.data as { transactions: Transaction[] }).transactions;
    }
    return [];
  },

  async getTransactionById(id: string | number): Promise<Transaction> {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  async deleteTransaction(id: string | number): Promise<{ message?: string; success?: boolean }> {
    const response = await api.delete<{ message?: string; success?: boolean }>(`/transactions/${id}`);
    return response.data;
  },

  async processTransaction(
  payload: ProcessTransactionPayload | { text: string }
): Promise<unknown> {
  const data = {
    ...payload,
    ...(typeof payload === 'object' && 'transaction_type' in payload && payload.transaction_type
      ? {
          transaction_type: payload.transaction_type.toUpperCase(),
        }
      : {}),
    ...(typeof payload === 'object' && 'money_direction' in payload && payload.money_direction
      ? {
          money_direction: payload.money_direction.toUpperCase(),
        }
      : {}),
  };

  const response = await api.post('/transactions/', data);
  return response.data;
},
  async confirmTransaction(payload: ConfirmTransactionPayload): Promise<Transaction> {
    const response = await api.post<Transaction>('/transactions/confirm', payload);
    return response.data;
  },
};

export default transactionService;
