import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import associationsService from '../services/associations.service';
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

          // If user belongs to associations, set the first one as current (or keep existing)
          const currentTenant = get().currentTenant;
          const newCurrentTenant = currentTenant && tenants.find(t => t.id === currentTenant.id)
            ? currentTenant
            : tenants[0] || null;

          set({
            tenants,
            currentTenant: newCurrentTenant,
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

      setCurrentTenant: (tenant) => set({ currentTenant: tenant }),

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
