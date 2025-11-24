import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  Grid,
} from '@mui/material';
import associationsService, { CreateAssociationDto } from '../../services/associations.service';
import { useTenantStore } from '../../stores/tenant.store';

interface StepCreateAssociationProps {
  onNext: (associationId: string) => void;
}

const CURRENCIES = [
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'USD', label: 'Dollar américain (USD)' },
  { value: 'GBP', label: 'Livre sterling (GBP)' },
  { value: 'CAD', label: 'Dollar canadien (CAD)' },
  { value: 'CHF', label: 'Franc suisse (CHF)' },
  { value: 'XOF', label: 'Franc CFA Ouest (XOF)' },
  { value: 'XAF', label: 'Franc CFA Central (XAF)' },
];

export const StepCreateAssociation = ({ onNext }: StepCreateAssociationProps) => {
  const { t, i18n } = useTranslation();
  const { setCurrentTenant } = useTenantStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateAssociationDto>({
    name: '',
    slug: '',
    primaryCurrency: 'EUR',
    primaryLanguage: i18n.language,
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
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

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
      setCurrentTenant(newAssociation);
      onNext(newAssociation.id);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        t('common.error')
      );
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        {t('onboarding.step1.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {t('onboarding.step1.description')}
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
              label={t('onboarding.step1.name')}
              value={formData.name}
              onChange={handleChange('name')}
              required
              helperText={t('onboarding.step1.nameHelper')}
              inputProps={{ minLength: 3, maxLength: 255 }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('onboarding.step1.slug')}
              value={formData.slug}
              onChange={handleChange('slug')}
              required
              helperText={t('onboarding.step1.slugHelper')}
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
              label={t('onboarding.step1.currency')}
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
              label={t('onboarding.step1.language')}
              value={formData.primaryLanguage}
              onChange={handleChange('primaryLanguage')}
              required
            >
              <MenuItem value="fr">{t('languages.fr')}</MenuItem>
              <MenuItem value="it">{t('languages.it')}</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label={t('onboarding.step1.type')}
              value={formData.type}
              onChange={handleChange('type')}
              helperText={t('onboarding.step1.typeHelper')}
            >
              <MenuItem value="SIMPLE">{t('onboarding.step1.typeSimple')}</MenuItem>
              <MenuItem value="MULTI_SECTION">{t('onboarding.step1.typeMultiSection')}</MenuItem>
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
                t('common.next')
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
