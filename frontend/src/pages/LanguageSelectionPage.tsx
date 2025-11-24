import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Grid,
} from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';

const LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

export const LanguageSelectionPage = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLang(languageCode);
    i18n.changeLanguage(languageCode);
    localStorage.setItem('selectedLanguage', languageCode);

    // Wait a bit for language to be set, then navigate
    setTimeout(() => {
      navigate('/login');
    }, 300);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #003D3D 0%, #006666 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <LanguageIcon
            sx={{
              fontSize: 80,
              color: 'white',
              mb: 3,
            }}
          />
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
            color="white"
          >
            🌍 Diaspora Platform
          </Typography>
          <Typography variant="h6" color="rgba(255,255,255,0.9)" sx={{ mt: 2 }}>
            Choisissez votre langue / Scegli la tua lingua
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {LANGUAGES.map((language) => (
            <Grid item xs={12} sm={6} key={language.code}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s ease',
                  transform: selectedLang === language.code ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: selectedLang === language.code ? 8 : 2,
                  border: selectedLang === language.code ? '3px solid #003D3D' : 'none',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleLanguageSelect(language.code)}
                  sx={{
                    height: '100%',
                    minHeight: 200,
                  }}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      p: 4,
                    }}
                  >
                    <Typography
                      variant="h1"
                      sx={{
                        fontSize: 80,
                        mb: 2,
                      }}
                    >
                      {language.flag}
                    </Typography>
                    <Typography
                      variant="h5"
                      component="h2"
                      fontWeight="bold"
                      color="primary"
                    >
                      {language.name}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="rgba(255,255,255,0.7)">
            Vous pourrez changer de langue plus tard dans les paramètres
            <br />
            Potrai cambiare lingua più tardi nelle impostazioni
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
