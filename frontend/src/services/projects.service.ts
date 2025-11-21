import api from './api';
import type { Project, ProjectStats, PaginatedResponse } from '../types';

export interface CreateProjectDto {
  name: string;
  description?: string;
  budget: number;
  currency?: string;
  startDate: string;
  endDate?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  budget?: number;
  actualCost?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  completedAt?: string;
}

class ProjectsService {
  /**
   * Get all projects
   */
  async getAll(tenantId: string, params?: any): Promise<PaginatedResponse<Project>> {
    const response = await api.get(`/associations/${tenantId}/projects`, { params });
    return response.data;
  }

  /**
   * Get project by ID
   */
  async getById(tenantId: string, id: string): Promise<Project> {
    const response = await api.get(`/associations/${tenantId}/projects/${id}`);
    return response.data;
  }

  /**
   * Create new project
   */
  async create(tenantId: string, data: CreateProjectDto): Promise<Project> {
    const response = await api.post(`/associations/${tenantId}/projects`, data);
    return response.data;
  }

  /**
   * Update project
   */
  async update(tenantId: string, id: string, data: UpdateProjectDto): Promise<Project> {
    const response = await api.patch(`/associations/${tenantId}/projects/${id}`, data);
    return response.data;
  }

  /**
   * Delete project
   */
  async delete(tenantId: string, id: string): Promise<void> {
    await api.delete(`/associations/${tenantId}/projects/${id}`);
  }

  /**
   * Get project statistics
   */
  async getStats(tenantId: string, id: string): Promise<ProjectStats> {
    const response = await api.get(`/associations/${tenantId}/projects/${id}/stats`);
    return response.data;
  }

  /**
   * Get project financial summary
   */
  async getFinancialSummary(tenantId: string, id: string): Promise<any> {
    const response = await api.get(`/associations/${tenantId}/projects/${id}/financial-summary`);
    return response.data;
  }
}

export default new ProjectsService();
