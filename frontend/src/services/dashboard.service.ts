import api from './api';
import type { DashboardStats } from '../types';

class DashboardService {
  /**
   * Get dashboard overview statistics
   */
  async getOverview(): Promise<DashboardStats> {
    const response = await api.get('/dashboard/overview');
    return response.data;
  }
}

export default new DashboardService();
