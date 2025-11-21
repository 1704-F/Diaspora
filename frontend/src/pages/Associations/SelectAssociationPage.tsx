import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Chip,
} from '@mui/material';
import { ArrowBack, Add, Business } from '@mui/icons-material';
import { useTenantStore } from '../../stores/tenant.store';
import type { Association } from '../../types';

export const SelectAssociationPage = () => {
  const navigate = useNavigate();
  const { tenants, loadTenants, setCurrentTenant, isLoading, error } = useTenantStore();
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLocalLoading(true);
      try {
        await loadTenants();
      } finally {
        setLocalLoading(false);
      }
    };
    load();
  }, [loadTenants]);

  const handleSelectAssociation = (association: Association) => {
    setCurrentTenant(association);
    navigate(`/associations/${association.id}/dashboard`);
  };

  const handleCreateNew = () => {
    navigate('/associations/create');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'default';
      case 'SUSPENDED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'INACTIVE':
        return 'Inactive';
      case 'SUSPENDED':
        return 'Suspendue';
      default:
        return status;
    }
  };

  if (localLoading || isLoading) {
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
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{ mb: 3 }}
          >
            Retour au tableau de bord
          </Button>

          <Typography variant="h4" component="h1" gutterBottom>
            Sélectionner une association
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Choisissez l'association sur laquelle vous souhaitez travailler.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {/* Card to create new association */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  border: '2px dashed',
                  borderColor: 'primary.main',
                  bgcolor: 'transparent',
                }}
              >
                <CardActionArea
                  onClick={handleCreateNew}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 4,
                  }}
                >
                  <Add sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" color="primary">
                    Créer une nouvelle association
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>

            {/* Existing associations */}
            {tenants.map((association) => (
              <Grid item xs={12} sm={6} md={4} key={association.id}>
                <Card
                  sx={{
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => handleSelectAssociation(association)}
                    disabled={association.status !== 'ACTIVE'}
                    sx={{ height: '100%' }}
                  >
                    <CardContent sx={{ height: '100%', p: 3 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 2,
                        }}
                      >
                        {association.logo ? (
                          <Box
                            component="img"
                            src={association.logo}
                            alt={association.name}
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 1,
                              mr: 2,
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 1,
                              bgcolor: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2,
                            }}
                          >
                            <Business sx={{ color: 'white' }} />
                          </Box>
                        )}
                        <Chip
                          label={getStatusLabel(association.status)}
                          color={getStatusColor(association.status)}
                          size="small"
                        />
                      </Box>

                      <Typography variant="h6" gutterBottom>
                        {association.name}
                      </Typography>

                      {association.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {association.description}
                        </Typography>
                      )}

                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Chip
                          label={association.primaryCurrency}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={association.primaryLanguage.toUpperCase()}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {tenants.length === 0 && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Vous n'avez aucune association pour le moment.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateNew}
                sx={{ mt: 2 }}
              >
                Créer votre première association
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};
