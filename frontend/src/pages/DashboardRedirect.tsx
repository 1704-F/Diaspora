import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Container } from '@mui/material';
import { useTenantStore } from '../stores/tenant.store';

export const DashboardRedirect = () => {
  const navigate = useNavigate();
  const { tenants, loadTenants, setCurrentTenant } = useTenantStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const redirect = async () => {
      try {
        await loadTenants();

        // Check if user has associations
        if (tenants.length === 0) {
          // No association -> onboarding
          navigate('/onboarding', { replace: true });
        } else if (tenants.length === 1) {
          // One association -> go directly to dashboard
          setCurrentTenant(tenants[0]);
          navigate(`/associations/${tenants[0].id}/dashboard`, { replace: true });
        } else {
          // Multiple associations -> selection page
          navigate('/associations/select', { replace: true });
        }
      } catch (error) {
        console.error('Error loading associations:', error);
        // On error, go to association creation
        navigate('/onboarding', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    redirect();
  }, [loadTenants, navigate, setCurrentTenant, tenants]);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
        </Container>
      </Box>
    );
  }

  return null;
};
