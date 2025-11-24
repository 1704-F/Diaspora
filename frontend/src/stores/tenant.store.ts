import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import associationsService from '../services/associations.service';
import membersService from '../services/members.service';
import { useRolesStore } from './roles.store';
import type { Association } from '../types';

interface TenantState {
  currentTenant: Association | null;
  tenants: Association[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTenants: () => Promise<void>;
  setCurrentTenant: (tenant: Association) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      currentTenant: null,
      tenants: [],
      isLoading: false,
      error: null,

      loadTenants: async () => {
        try {
          set({ isLoading: true, error: null });
          const tenants = await associationsService.getAll();

          // Keep existing currentTenant if it's still valid, otherwise clear it
          const currentTenant = get().currentTenant;
          const isCurrentTenantStillValid = currentTenant && tenants.find(t => t.id === currentTenant.id);

          set({
            tenants,
            currentTenant: isCurrentTenantStillValid ? currentTenant : null,
            isLoading: false
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to load associations',
            isLoading: false,
          });
          throw error;
        }
      },

      setCurrentTenant: async (tenant) => {
        set({ currentTenant: tenant });

        // Load user's roles for this tenant
        try {
          const member = await membersService.getCurrentMember(tenant.id);
          const rolesStore = useRolesStore.getState();
          await rolesStore.loadMemberRoles(tenant.id, member.id);
        } catch (error) {
          console.error('Failed to load member roles:', error);
          // Clear roles if user is not a member
          useRolesStore.getState().clearRoles();
        }
      },

      clearTenant: () => set({ currentTenant: null, tenants: [], error: null }),
    }),
    {
      name: 'tenant-storage',
      partialize: (state) => ({
        currentTenant: state.currentTenant,
      }),
    },
  ),
);
