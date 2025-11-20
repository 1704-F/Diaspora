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
  async getAll(filters?: MemberFilters): Promise<PaginatedResponse<Member>> {
    const response = await api.get('/members', { params: filters });
    return response.data;
  }

  /**
   * Get member by ID
   */
  async getById(id: string): Promise<Member> {
    const response = await api.get(`/members/${id}`);
    return response.data;
  }

  /**
   * Create new member
   */
  async create(data: CreateMemberDto): Promise<Member> {
    const response = await api.post('/members', data);
    return response.data;
  }

  /**
   * Update member
   */
  async update(id: string, data: UpdateMemberDto): Promise<Member> {
    const response = await api.patch(`/members/${id}`, data);
    return response.data;
  }

  /**
   * Delete member (soft delete)
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/members/${id}`);
  }

  /**
   * Get member statistics
   */
  async getStats(id: string): Promise<MemberStats> {
    const response = await api.get(`/members/${id}/stats`);
    return response.data;
  }

  /**
   * Assign role to member
   */
  async assignRole(memberId: string, roleId: string): Promise<void> {
    await api.post(`/members/${memberId}/roles/${roleId}`);
  }

  /**
   * Remove role from member
   */
  async removeRole(memberId: string, roleId: string): Promise<void> {
    await api.delete(`/members/${memberId}/roles/${roleId}`);
  }
}

export default new MembersService();
