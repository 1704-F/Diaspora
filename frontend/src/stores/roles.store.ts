import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import rolesService, { MemberRole } from '../services/roles.service';

interface RolesState {
  memberRoles: MemberRole[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadMemberRoles: (tenantId: string, memberId: string) => Promise<void>;
  clearRoles: () => void;
  hasPermission: (permission: string) => boolean;
  getPrimaryRole: () => string | null;
}

export const useRolesStore = create<RolesState>()(
  persist(
    (set, get) => ({
      memberRoles: [],
      isLoading: false,
      error: null,

      loadMemberRoles: async (tenantId: string, memberId: string) => {
        try {
          set({ isLoading: true, error: null });
          const roles = await rolesService.getMemberRoles(tenantId, memberId);
          set({ memberRoles: roles, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to load roles',
            isLoading: false,
          });
        }
      },

      clearRoles: () => set({ memberRoles: [], error: null }),

      hasPermission: (permission: string) => {
        const { memberRoles } = get();
        return rolesService.hasPermission(memberRoles, permission);
      },

      getPrimaryRole: () => {
        const { memberRoles } = get();
        return rolesService.getPrimaryRole(memberRoles);
      },
    }),
    {
      name: 'roles-storage',
      partialize: (state) => ({
        memberRoles: state.memberRoles,
      }),
    },
  ),
);
