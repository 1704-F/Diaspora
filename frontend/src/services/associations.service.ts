import api from './api';
import type { Association, AssociationStats } from '../types';

class AssociationsService {
  /**
   * Get all associations for current user
   */
  async getAll(): Promise<Association[]> {
    const response = await api.get('/associations');
    return response.data;
  }

  /**
   * Get association by ID
   */
  async getById(id: string): Promise<Association> {
    const response = await api.get(`/associations/${id}`);
    return response.data;
  }

  /**
   * Get association statistics
   */
  async getStats(id: string): Promise<AssociationStats> {
    const response = await api.get(`/associations/${id}/stats`);
    return response.data;
  }
}

export default new AssociationsService();
