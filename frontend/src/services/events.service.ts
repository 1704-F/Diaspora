import api from './api';
import type {
  Event,
  EventStats,
  EventRegistration,
  PaginatedResponse,
} from '../types';

export interface CreateEventDto {
  type: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate: string;
  maxAttendees?: number;
  registrationDeadline?: string;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  maxAttendees?: number;
  registrationDeadline?: string;
  status?: string;
}

export interface RegisterEventDto {
  numberOfGuests?: number;
}

class EventsService {
  /**
   * Get all events
   */
  async getAll(tenantId: string, params?: any): Promise<PaginatedResponse<Event>> {
    const response = await api.get(`/associations/${tenantId}/events`, { params });
    return response.data;
  }

  /**
   * Get event by ID
   */
  async getById(tenantId: string, id: string): Promise<Event> {
    const response = await api.get(`/associations/${tenantId}/events/${id}`);
    return response.data;
  }

  /**
   * Create new event
   */
  async create(tenantId: string, data: CreateEventDto): Promise<Event> {
    const response = await api.post(`/associations/${tenantId}/events`, data);
    return response.data;
  }

  /**
   * Update event
   */
  async update(tenantId: string, id: string, data: UpdateEventDto): Promise<Event> {
    const response = await api.patch(`/associations/${tenantId}/events/${id}`, data);
    return response.data;
  }

  /**
   * Delete event
   */
  async delete(tenantId: string, id: string): Promise<void> {
    await api.delete(`/associations/${tenantId}/events/${id}`);
  }

  /**
   * Get event statistics
   */
  async getStats(tenantId: string, id: string): Promise<EventStats> {
    const response = await api.get(`/associations/${tenantId}/events/${id}/stats`);
    return response.data;
  }

  /**
   * Register for event
   */
  async register(
    tenantId: string,
    eventId: string,
    data: RegisterEventDto,
  ): Promise<EventRegistration> {
    const response = await api.post(`/associations/${tenantId}/events/${eventId}/register`, data);
    return response.data;
  }

  /**
   * Get event registrations
   */
  async getRegistrations(tenantId: string, eventId: string): Promise<EventRegistration[]> {
    const response = await api.get(`/associations/${tenantId}/events/${eventId}/registrations`);
    return response.data;
  }

  /**
   * Cancel registration
   */
  async cancelRegistration(
    tenantId: string,
    eventId: string,
    registrationId: string,
  ): Promise<void> {
    await api.delete(`/associations/${tenantId}/events/${eventId}/registrations/${registrationId}`);
  }
}

export default new EventsService();
