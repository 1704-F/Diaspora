import api from './api';

export interface Role {
  id: string;
  tenantId: string;
  sectionId?: string;
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MemberRole {
  id: string;
  memberId: string;
  roleId: string;
  assignedAt: string;
  assignedBy: string;
  validFrom?: string;
  validUntil?: string;
  role: Role;
}

class RolesService {
  /**
   * Get all roles for a tenant
   */
  async getRoles(tenantId: string): Promise<Role[]> {
    const response = await api.get(`/associations/${tenantId}/roles`);
    return response.data;
  }

  /**
   * Get member's roles
   */
  async getMemberRoles(tenantId: string, memberId: string): Promise<MemberRole[]> {
    const response = await api.get(`/associations/${tenantId}/members/${memberId}/roles`);
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

  /**
   * Check if user has permission
   */
  hasPermission(roles: MemberRole[], permission: string): boolean {
    return roles.some(memberRole => {
      const permissions = memberRole.role.permissions;

      // Check for wildcard permission (admin)
      if (permissions.includes('*')) return true;

      // Check for exact permission
      if (permissions.includes(permission)) return true;

      // Check for wildcard category (e.g., 'finances.*' matches 'finances.view')
      const parts = permission.split('.');
      if (parts.length > 1) {
        const category = parts[0];
        if (permissions.includes(`${category}.*`)) return true;
      }

      return false;
    });
  }

  /**
   * Get user's primary role (highest priority)
   */
  getPrimaryRole(roles: MemberRole[]): string | null {
    if (!roles || roles.length === 0) return null;

    // Priority order
    const rolePriority: { [key: string]: number } = {
      'president': 1,
      'vice-president': 2,
      'treasurer': 3,
      'secretary': 4,
      'section-head': 5,
      'member': 6,
    };

    const sortedRoles = [...roles].sort((a, b) => {
      const aPriority = rolePriority[a.role.slug] || 999;
      const bPriority = rolePriority[b.role.slug] || 999;
      return aPriority - bPriority;
    });

    return sortedRoles[0]?.role.slug || null;
  }
}

export default new RolesService();
