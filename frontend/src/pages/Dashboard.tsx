import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People,
  AccountBalance,
  Work,
  Event,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import dashboardService from '../services/dashboard.service';
import type { DashboardStats } from '../types';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactElement;
  color: string;
  subtitle?: string;
}

const StatCard = ({ title, value, icon, color, subtitle }: StatCardProps) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="text.secondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: `${color}15`,
            p: 1,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const Dashboard = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no tenantId in URL, redirect to associations page
    if (!tenantId) {
      navigate('/associations');
      return;
    }

    loadStats();
  }, [tenantId, navigate]);

  const loadStats = async () => {
    if (!tenantId) return;

    try {
      setLoading(true);
      const data = await dashboardService.getOverview(tenantId);
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!stats) return null;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Members */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Membres"
            value={stats.members.total}
            icon={<People sx={{ color: '#3b82f6' }} />}
            color="#3b82f6"
            subtitle={`${stats.members.active} actifs`}
          />
        </Grid>

        {/* Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Solde"
            value={`${stats.financial.balance.toLocaleString()} FCFA`}
            icon={<AccountBalance sx={{ color: '#10b981' }} />}
            color="#10b981"
            subtitle={`${stats.financial.complianceRate.toFixed(1)}% conformité`}
          />
        </Grid>

        {/* Projects */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Projets"
            value={stats.projects.total}
            icon={<Work sx={{ color: '#f59e0b' }} />}
            color="#f59e0b"
            subtitle={`${stats.projects.inProgress} en cours`}
          />
        </Grid>

        {/* Events */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Événements"
            value={stats.events.total}
            icon={<Event sx={{ color: '#8b5cf6' }} />}
            color="#8b5cf6"
            subtitle={`${stats.events.upcoming} à venir`}
          />
        </Grid>
      </Grid>

      {/* Financial Summary */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Revenus totaux
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp sx={{ color: '#10b981' }} />
                <Typography variant="h5" color="#10b981">
                  {stats.financial.totalRevenue.toLocaleString()} FCFA
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {stats.financial.revenueThisMonth.toLocaleString()} FCFA ce mois
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Dépenses totales
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingDown sx={{ color: '#ef4444' }} />
                <Typography variant="h5" color="#ef4444">
                  {stats.financial.totalExpenses.toLocaleString()} FCFA
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {stats.financial.expensesThisMonth.toLocaleString()} FCFA ce mois
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Cotisations
              </Typography>
              <Typography variant="h5">
                {stats.financial.contributionsCollected.toLocaleString()} /{' '}
                {stats.financial.contributionsExpected.toLocaleString()} FCFA
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {stats.contributions.paid} payées / {stats.contributions.pending} en attente
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activities */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Activités récentes
          </Typography>
          {stats.recentActivities.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              {stats.recentActivities.map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    py: 1.5,
                    borderBottom: index < stats.recentActivities.length - 1 ? '1px solid #e5e7eb' : 'none',
                  }}
                >
                  <Typography variant="body2">{activity.description}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(activity.timestamp).toLocaleString('fr-FR')}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Aucune activité récente
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
