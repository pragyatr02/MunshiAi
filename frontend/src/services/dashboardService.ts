import api from './api';
import { DashboardData } from '../types';

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    const response = await api.get<DashboardData>('/dashboard');
    return response.data;
  },
};

export default dashboardService;
