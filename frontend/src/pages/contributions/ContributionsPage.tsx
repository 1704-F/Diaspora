import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import contributionsService from '../../services/contributions.service';
import type { Contribution } from '../../types';

export const ContributionsPage = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContributions();
  }, []);

  const loadContributions = async () => {
    try {
      const response = await contributionsService.getAll({ page: 1, limit: 50 });
      setContributions(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Cotisations</Typography>
        <Button variant="contained" startIcon={<Add />}>
          Créer une cotisation
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Montant</TableCell>
              <TableCell>Fréquence</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Date limite</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contributions.map((contribution) => (
              <TableRow key={contribution.id}>
                <TableCell>{contribution.name}</TableCell>
                <TableCell>
                  <Chip label={contribution.type} size="small" />
                </TableCell>
                <TableCell>
                  {contribution.amount.toLocaleString()} {contribution.currency}
                </TableCell>
                <TableCell>{contribution.frequency}</TableCell>
                <TableCell>
                  <Chip
                    label={contribution.isActive ? 'Active' : 'Inactive'}
                    color={contribution.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {contribution.dueDate
                    ? new Date(contribution.dueDate).toLocaleDateString('fr-FR')
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {contributions.length === 0 && (
        <Typography variant="body1" color="text.secondary" textAlign="center" py={8}>
          Aucune cotisation trouvée
        </Typography>
      )}
    </Box>
  );
};
