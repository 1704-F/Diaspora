import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) {
      navigate('/associations');
      return;
    }

    loadContributions();
  }, [tenantId, navigate]);

  const loadContributions = async () => {
    if (!tenantId) return;

    try {
      const response = await contributionsService.getAll(tenantId, { page: 1, limit: 50 });
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
        <Typography variant="h4">{t('contributions.title')}</Typography>
        <Button variant="contained" startIcon={<Add />}>
          {t('contributions.addContribution')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('common.name')}</TableCell>
              <TableCell>{t('contributions.type')}</TableCell>
              <TableCell>{t('contributions.amount')}</TableCell>
              <TableCell>{t('contributions.frequency')}</TableCell>
              <TableCell>{t('contributions.status')}</TableCell>
              <TableCell>{t('contributions.dueDate')}</TableCell>
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
                    label={contribution.isActive ? t('common.active') : t('common.inactive')}
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
          {t('contributions.noContributions')}
        </Typography>
      )}
    </Box>
  );
};
