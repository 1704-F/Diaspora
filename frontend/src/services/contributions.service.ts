import api from './api';
import type {
  Contribution,
  ContributionStats,
  ContributionPayment,
  PaginatedResponse,
  Member,
} from '../types';

export interface CreateContributionDto {
  type: string;
  name: string;
  description?: string;
  amount: number;
  currency?: string;
  frequency: string;
  dueDate?: string;
}

export interface UpdateContributionDto {
  name?: string;
  description?: string;
  amount?: number;
  frequency?: string;
  dueDate?: string;
  isActive?: boolean;
}

class ContributionsService {
  /**
   * Get all contributions
   */
  async getAll(params?: any): Promise<PaginatedResponse<Contribution>> {
    const response = await api.get('/contributions', { params });
    return response.data;
  }

  /**
   * Get contribution by ID
   */
  async getById(id: string): Promise<Contribution> {
    const response = await api.get(`/contributions/${id}`);
    return response.data;
  }

  /**
   * Create new contribution
   */
  async create(data: CreateContributionDto): Promise<Contribution> {
    const response = await api.post('/contributions', data);
    return response.data;
  }

  /**
   * Update contribution
   */
  async update(
    id: string,
    data: UpdateContributionDto,
  ): Promise<Contribution> {
    const response = await api.patch(`/contributions/${id}`, data);
    return response.data;
  }

  /**
   * Delete contribution
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/contributions/${id}`);
  }

  /**
   * Get contribution statistics
   */
  async getStats(id: string): Promise<ContributionStats> {
    const response = await api.get(`/contributions/${id}/stats`);
    return response.data;
  }

  /**
   * Get unpaid members for a contribution
   */
  async getUnpaidMembers(id: string): Promise<Member[]> {
    const response = await api.get(`/contributions/${id}/unpaid-members`);
    return response.data;
  }
}

export default new ContributionsService();
