import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
} from '@mui/material';
import {
  Groups as GroupsIcon,
  BusinessCenter as InvestmentIcon,
  FamilyRestroom as FamilyIcon,
  AccountBalance as TontineIcon,
  Campaign as MarketplaceIcon,
} from '@mui/icons-material';

interface App {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  status: 'active' | 'coming_soon';
  color: string;
}

const apps: App[] = [
  {
    id: 'associations',
    name: 'Associations',
    description: 'Gérez vos associations de la diaspora : membres, cotisations, projets et événements',
    icon: <GroupsIcon sx={{ fontSize: 64 }} />,
    route: '/associations',
    status: 'active',
    color: '#1976d2',
  },
  {
    id: 'investments',
    name: 'Investissements au Pays',
    description: 'Suivez vos investissements : constructions, logements, commerces',
    icon: <InvestmentIcon sx={{ fontSize: 64 }} />,
    route: '/investments',
    status: 'coming_soon',
    color: '#2e7d32',
  },
  {
    id: 'family',
    name: 'Gestion Familiale',
    description: 'Gérez les budgets et dépenses familiales en toute transparence',
    icon: <FamilyIcon sx={{ fontSize: 64 }} />,
    route: '/family',
    status: 'coming_soon',
    color: '#ed6c02',
  },
  {
    id: 'tontine',
    name: 'Tontines',
    description: 'Organisez et suivez vos tontines de manière sécurisée',
    icon: <TontineIcon sx={{ fontSize: 64 }} />,
    route: '/tontine',
    status: 'coming_soon',
    color: '#9c27b0',
  },
  {
    id: 'marketplace',
    name: 'Annonces',
    description: 'Marketplace communautaire pour la diaspora',
    icon: <MarketplaceIcon sx={{ fontSize: 64 }} />,
    route: '/marketplace',
    status: 'coming_soon',
    color: '#d32f2f',
  },
];

export const AppsHubPage = () => {
  const navigate = useNavigate();

  const handleAppClick = (app: App) => {
    if (app.status === 'active') {
      navigate(app.route);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ minHeight: '100vh', py: 8 }}>
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            🌍 Diaspora Platform
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Choisissez votre application
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Une plateforme complète pour gérer vos engagements et investissements
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {apps.map((app) => (
            <Grid item xs={12} sm={6} md={4} key={app.id}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  opacity: app.status === 'coming_soon' ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: app.status === 'active' ? 'translateY(-8px)' : 'none',
                    boxShadow: app.status === 'active' ? 6 : 1,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleAppClick(app)}
                  disabled={app.status === 'coming_soon'}
                  sx={{ height: '100%' }}
                >
                  <CardContent
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      p: 3,
                    }}
                  >
                    <Box
                      sx={{
                        color: app.color,
                        mb: 2,
                      }}
                    >
                      {app.icon}
                    </Box>

                    <Typography
                      variant="h5"
                      component="h2"
                      gutterBottom
                      fontWeight="bold"
                      textAlign="center"
                    >
                      {app.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                      sx={{ mb: 2, flexGrow: 1 }}
                    >
                      {app.description}
                    </Typography>

                    {app.status === 'coming_soon' && (
                      <Chip
                        label="Bientôt disponible"
                        size="small"
                        color="default"
                        sx={{ mt: 'auto' }}
                      />
                    )}

                    {app.status === 'active' && (
                      <Chip
                        label="Disponible"
                        size="small"
                        color="success"
                        sx={{ mt: 'auto' }}
                      />
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            D'autres modules seront ajoutés progressivement selon vos besoins
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};
