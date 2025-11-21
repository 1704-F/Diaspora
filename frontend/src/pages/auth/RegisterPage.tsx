import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  MenuItem,
} from '@mui/material';
import { useAuthStore } from '../../stores/auth.store';
import toast from 'react-hot-toast';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    language: 'fr',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        language: formData.language,
      });

      toast.success('Inscription réussie ! Vérifiez votre email.');
      navigate('/login');
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <Container maxWidth="sm">
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
          <Typography variant="h4" component="h1" gutterBottom textAlign="center">
            🌍 Diaspora Platform
          </Typography>
          <Typography variant="h6" gutterBottom textAlign="center" color="text.secondary">
            Créer un compte
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
            />

            <TextField
              fullWidth
              label="Téléphone (optionnel)"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
            />

            <TextField
              select
              fullWidth
              label="Langue préférée"
              name="language"
              value={formData.language}
              onChange={handleChange}
              required
              margin="normal"
              helperText="Sélectionnez votre langue préférée pour l'interface"
            >
              <MenuItem value="fr">🇫🇷 Français</MenuItem>
              <MenuItem value="en">🇬🇧 English</MenuItem>
              <MenuItem value="ar">🇸🇦 العربية</MenuItem>
              <MenuItem value="es">🇪🇸 Español</MenuItem>
              <MenuItem value="pt">🇵🇹 Português</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Mot de passe"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              helperText="Minimum 12 caractères avec majuscules, minuscules, chiffres et caractères spéciaux"
            />

            <TextField
              fullWidth
              label="Confirmer le mot de passe"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              margin="normal"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : "S'inscrire"}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Déjà un compte ?{' '}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Typography component="span" color="primary">
                    Se connecter
                  </Typography>
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
