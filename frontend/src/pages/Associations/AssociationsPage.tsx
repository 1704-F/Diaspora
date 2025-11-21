import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, CircularProgress } from '@mui/material';
import { useTenantStore } from '../../stores/tenant.store';

/**
 * AssociationsPage - Smart routing page for associations
 *
 * This page implements the following logic:
 * - 0 associations → redirect to /associations/create
 * - 1 association → redirect to /associations/:id/dashboard
 * - 2+ associations → redirect to /associations/select
 */
export const AssociationsPage = () => {
  const navigate = useNavigate();
  const { tenants, loadTenants, setCurrentTenant } = useTenantStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleRouting = async () => {
      setIsLoading(true);
      try {
        // Load all associations for the current user
        await loadTenants();
      } catch (error) {
        console.error('Error loading associations:', error);
        // On error, redirect to create page
        navigate('/associations/create', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    handleRouting();
  }, [loadTenants]);

  useEffect(() => {
    if (!isLoading) {
      // Apply routing logic based on number of associations
      if (tenants.length === 0) {
        // No associations → create new
        navigate('/associations/create', { replace: true });
      } else if (tenants.length === 1) {
        // Exactly 1 association → go directly to its dashboard
        const association = tenants[0];
        setCurrentTenant(association);
        navigate(`/associations/${association.id}/dashboard`, { replace: true });
      } else {
        // 2+ associations → show selection page
        navigate('/associations/select', { replace: true });
      }
    }
  }, [isLoading, tenants, navigate, setCurrentTenant]);

  // Show loading spinner while determining where to route
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    </Container>
  );
};
