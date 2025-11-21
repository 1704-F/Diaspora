import api from './api';
import type { Member, MemberStats, PaginatedResponse } from '../types';

export interface MemberFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  search?: string;
  sectionId?: string;
}

export interface CreateMemberDto {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  statusType?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
  cityOfOrigin?: string;
  sectionId?: string;
  membershipDate?: string;
}

export interface UpdateMemberDto {
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
  cityOfOrigin?: string;
  statusType?: string;
  sectionId?: string;
}

class MembersService {
  /**
   * Get all members with filters
   */
  async getAll(tenantId: string, filters?: MemberFilters): Promise<PaginatedResponse<Member>> {
    const response = await api.get(`/associations/${tenantId}/members`, { params: filters });
    return response.data;
  }

  /**
   * Get member by ID
   */
  async getById(tenantId: string, id: string): Promise<Member> {
    const response = await api.get(`/associations/${tenantId}/members/${id}`);
    return response.data;
  }

  /**
   * Create new member
   */
  async create(tenantId: string, data: CreateMemberDto): Promise<Member> {
    const response = await api.post(`/associations/${tenantId}/members`, data);
    return response.data;
  }

  /**
   * Update member
   */
  async update(tenantId: string, id: string, data: UpdateMemberDto): Promise<Member> {
    const response = await api.patch(`/associations/${tenantId}/members/${id}`, data);
    return response.data;
  }

  /**
   * Delete member (soft delete)
   */
  async delete(tenantId: string, id: string): Promise<void> {
    await api.delete(`/associations/${tenantId}/members/${id}`);
  }

  /**
   * Get member statistics
   */
  async getStats(tenantId: string, id: string): Promise<MemberStats> {
    const response = await api.get(`/associations/${tenantId}/members/${id}/stats`);
    return response.data;
  }

  /**
   * Assign role to member
   */
  async assignRole(tenantId: string, memberId: string, roleId: string): Promise<void> {
    await api.post(`/associations/${tenantId}/members/${memberId}/roles/${roleId}`);
  }

  /**
   * Remove role from member
   */
  async removeRole(tenantId: string, memberId: string, roleId: string): Promise<void> {
    await api.delete(`/associations/${tenantId}/members/${memberId}/roles/${roleId}`);
  }
}

export default new MembersService();
