import api from './api';
import { QueryResponse } from '../types';

export interface QueryPayload {
  query: string;
}

export const queryService = {
  async askMunshi(queryText: string): Promise<QueryResponse> {
    const payload = {
      query: queryText,
      prompt: queryText,
      question: queryText,
    };
    const response = await api.post<QueryResponse>('/query', payload);
    return response.data;
  },
};

export default queryService;
