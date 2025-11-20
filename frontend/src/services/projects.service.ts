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
  async getAll(params?: any): Promise<PaginatedResponse<Project>> {
    const response = await api.get('/projects', { params });
    return response.data;
  }

  /**
   * Get project by ID
   */
  async getById(id: string): Promise<Project> {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  }

  /**
   * Create new project
   */
  async create(data: CreateProjectDto): Promise<Project> {
    const response = await api.post('/projects', data);
    return response.data;
  }

  /**
   * Update project
   */
  async update(id: string, data: UpdateProjectDto): Promise<Project> {
    const response = await api.patch(`/projects/${id}`, data);
    return response.data;
  }

  /**
   * Delete project
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  }

  /**
   * Get project statistics
   */
  async getStats(id: string): Promise<ProjectStats> {
    const response = await api.get(`/projects/${id}/stats`);
    return response.data;
  }

  /**
   * Get project financial summary
   */
  async getFinancialSummary(id: string): Promise<any> {
    const response = await api.get(`/projects/${id}/financial-summary`);
    return response.data;
  }
}

export default new ProjectsService();
