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
  async getAll(tenantId: string, params?: any): Promise<PaginatedResponse<Contribution>> {
    const response = await api.get(`/associations/${tenantId}/contributions`, { params });
    return response.data;
  }

  /**
   * Get contribution by ID
   */
  async getById(tenantId: string, id: string): Promise<Contribution> {
    const response = await api.get(`/associations/${tenantId}/contributions/${id}`);
    return response.data;
  }

  /**
   * Create new contribution
   */
  async create(tenantId: string, data: CreateContributionDto): Promise<Contribution> {
    const response = await api.post(`/associations/${tenantId}/contributions`, data);
    return response.data;
  }

  /**
   * Update contribution
   */
  async update(
    tenantId: string,
    id: string,
    data: UpdateContributionDto,
  ): Promise<Contribution> {
    const response = await api.patch(`/associations/${tenantId}/contributions/${id}`, data);
    return response.data;
  }

  /**
   * Delete contribution
   */
  async delete(tenantId: string, id: string): Promise<void> {
    await api.delete(`/associations/${tenantId}/contributions/${id}`);
  }

  /**
   * Get contribution statistics
   */
  async getStats(tenantId: string, id: string): Promise<ContributionStats> {
    const response = await api.get(`/associations/${tenantId}/contributions/${id}/stats`);
    return response.data;
  }

  /**
   * Get unpaid members for a contribution
   */
  async getUnpaidMembers(tenantId: string, id: string): Promise<Member[]> {
    const response = await api.get(`/associations/${tenantId}/contributions/${id}/unpaid-members`);
    return response.data;
  }
}

export default new ContributionsService();
