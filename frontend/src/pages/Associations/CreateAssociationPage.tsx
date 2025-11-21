import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  MenuItem,
  Grid,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import associationsService, { CreateAssociationDto } from '../../services/associations.service';
import { useTenantStore } from '../../stores/tenant.store';

const CURRENCIES = [
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'USD', label: 'Dollar américain (USD)' },
  { value: 'GBP', label: 'Livre sterling (GBP)' },
  { value: 'CAD', label: 'Dollar canadien (CAD)' },
  { value: 'CHF', label: 'Franc suisse (CHF)' },
  { value: 'XOF', label: 'Franc CFA (XOF)' },
  { value: 'XAF', label: 'Franc CFA (XAF)' },
];

const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
  { value: 'ar', label: 'العربية' },
];

export const CreateAssociationPage = () => {
  const navigate = useNavigate();
  const { loadTenants, setCurrentTenant } = useTenantStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateAssociationDto>({
    name: '',
    slug: '',
    primaryCurrency: 'EUR',
    primaryLanguage: 'fr',
    type: 'SIMPLE',
  });

  const handleChange = (field: keyof CreateAssociationDto) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug from name
    if (field === 'name' && !formData.slug) {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

      setFormData((prev) => ({
        ...prev,
        slug,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const newAssociation = await associationsService.create(formData);

      // Reload tenants to include the new association
      await loadTenants();

      // Set the new association as current tenant
      setCurrentTenant(newAssociation);

      // Navigate to the association dashboard
      navigate(`/associations/${newAssociation.id}/dashboard`);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Une erreur s'est produite lors de la création de l'association"
      );
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{ mb: 3 }}
          >
            Retour au tableau de bord
          </Button>

          <Typography variant="h4" component="h1" gutterBottom>
            Créer une association
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Remplissez les informations ci-dessous pour créer votre association.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom de l'association"
                  value={formData.name}
                  onChange={handleChange('name')}
                  required
                  helperText="Le nom complet de votre association"
                  inputProps={{ minLength: 3, maxLength: 255 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Identifiant (slug)"
                  value={formData.slug}
                  onChange={handleChange('slug')}
                  required
                  helperText="Identifiant unique (lettres minuscules, chiffres et tirets uniquement)"
                  inputProps={{
                    minLength: 3,
                    maxLength: 100,
                    pattern: '^[a-z0-9-]+$',
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Devise principale"
                  value={formData.primaryCurrency}
                  onChange={handleChange('primaryCurrency')}
                  required
                >
                  {CURRENCIES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Langue principale"
                  value={formData.primaryLanguage}
                  onChange={handleChange('primaryLanguage')}
                  required
                >
                  {LANGUAGES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Type d'association"
                  value={formData.type}
                  onChange={handleChange('type')}
                  helperText="Choisissez SIMPLE pour une structure simple, MULTI_SECTION pour gérer plusieurs sections"
                >
                  <MenuItem value="SIMPLE">Simple</MenuItem>
                  <MenuItem value="MULTI_SECTION">Multi-sections</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{ mt: 2 }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Créer l\'association'
                  )}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
