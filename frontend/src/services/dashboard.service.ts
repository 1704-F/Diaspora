import api from './api';
import type { DashboardStats } from '../types';

class DashboardService {
  /**
   * Get dashboard overview statistics
   */
  async getOverview(tenantId: string): Promise<DashboardStats> {
    const response = await api.get(`/associations/${tenantId}/dashboard/overview`);
    return response.data;
  }
}

export default new DashboardService();
