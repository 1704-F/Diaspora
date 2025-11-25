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

export const PaymentsPage = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tenantId) {
      navigate('/associations');
      return;
    }
  }, [tenantId, navigate]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('payments.title')}</Typography>
        <Button variant="contained" startIcon={<Add />}>
          {t('payments.recordPayment')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('common.date')}</TableCell>
              <TableCell>{t('common.member')}</TableCell>
              <TableCell>{t('payments.amount')}</TableCell>
              <TableCell>{t('payments.paymentMethod')}</TableCell>
              <TableCell>{t('payments.status')}</TableCell>
              <TableCell>{t('payments.reference')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography color="text.secondary" py={4}>
                  {t('payments.noPayments')}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
