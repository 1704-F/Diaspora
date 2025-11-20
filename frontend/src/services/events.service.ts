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
  async getAll(params?: any): Promise<PaginatedResponse<Event>> {
    const response = await api.get('/events', { params });
    return response.data;
  }

  /**
   * Get event by ID
   */
  async getById(id: string): Promise<Event> {
    const response = await api.get(`/events/${id}`);
    return response.data;
  }

  /**
   * Create new event
   */
  async create(data: CreateEventDto): Promise<Event> {
    const response = await api.post('/events', data);
    return response.data;
  }

  /**
   * Update event
   */
  async update(id: string, data: UpdateEventDto): Promise<Event> {
    const response = await api.patch(`/events/${id}`, data);
    return response.data;
  }

  /**
   * Delete event
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/events/${id}`);
  }

  /**
   * Get event statistics
   */
  async getStats(id: string): Promise<EventStats> {
    const response = await api.get(`/events/${id}/stats`);
    return response.data;
  }

  /**
   * Register for event
   */
  async register(
    eventId: string,
    data: RegisterEventDto,
  ): Promise<EventRegistration> {
    const response = await api.post(`/events/${eventId}/register`, data);
    return response.data;
  }

  /**
   * Get event registrations
   */
  async getRegistrations(eventId: string): Promise<EventRegistration[]> {
    const response = await api.get(`/events/${eventId}/registrations`);
    return response.data;
  }

  /**
   * Cancel registration
   */
  async cancelRegistration(
    eventId: string,
    registrationId: string,
  ): Promise<void> {
    await api.delete(`/events/${eventId}/registrations/${registrationId}`);
  }
}

export default new EventsService();
