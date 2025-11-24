import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

interface StepWelcomeProps {
  associationId: string;
}

export const StepWelcome = ({ associationId }: StepWelcomeProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate(`/associations/${associationId}/dashboard`);
  };

  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        {t('onboarding.step3.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {t('onboarding.step3.description')}
      </Typography>

      <Box sx={{ my: 6 }}>
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" fontSize="large" />
            </ListItemIcon>
            <ListItemText
              primary={t('onboarding.step3.associationCreated')}
              primaryTypographyProps={{ variant: 'h6' }}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" fontSize="large" />
            </ListItemIcon>
            <ListItemText
              primary={t('onboarding.step3.rolesCreated')}
              secondary="Président, Trésorier, Secrétaire, Membre"
              primaryTypographyProps={{ variant: 'h6' }}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" fontSize="large" />
            </ListItemIcon>
            <ListItemText
              primary={t('onboarding.step3.youArePresident')}
              primaryTypographyProps={{ variant: 'h6' }}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" fontSize="large" />
            </ListItemIcon>
            <ListItemText
              primary={t('onboarding.step3.dashboardReady')}
              primaryTypographyProps={{ variant: 'h6' }}
            />
          </ListItem>
        </List>
      </Box>

      <Button
        variant="contained"
        size="large"
        startIcon={<DashboardIcon />}
        onClick={handleGoToDashboard}
        sx={{ mt: 2, px: 6, py: 2 }}
      >
        {t('onboarding.step3.goToDashboard')}
      </Button>
    </Box>
  );
};
