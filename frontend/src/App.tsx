import { Routes, Route } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';

function App() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          🌍 Diaspora Platform
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Plateforme de gestion pour les associations de la diaspora africaine
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          En cours de développement...
        </Typography>
      </Box>

      <Routes>
        <Route path="/" element={<div>Home Page (Coming Soon)</div>} />
        <Route path="/login" element={<div>Login Page (Coming Soon)</div>} />
        <Route path="/dashboard" element={<div>Dashboard (Coming Soon)</div>} />
      </Routes>
    </Container>
  );
}

export default App;
