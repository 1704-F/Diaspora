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
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import projectsService from '../../services/projects.service';
import type { Project } from '../../types';

export const ProjectsPage = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) {
      navigate('/associations');
      return;
    }

    loadProjects();
  }, [tenantId, navigate]);

  const loadProjects = async () => {
    if (!tenantId) return;

    try {
      const response = await projectsService.getAll(tenantId, { page: 1, limit: 50 });
      setProjects(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'ON_HOLD':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getBudgetUsage = (budget: number, actualCost: number) => {
    return budget > 0 ? (actualCost / budget) * 100 : 0;
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
        <Typography variant="h4">{t('projects.title')}</Typography>
        <Button variant="contained" startIcon={<Add />}>
          {t('projects.addProject')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('common.name')}</TableCell>
              <TableCell>{t('projects.budget')}</TableCell>
              <TableCell>{t('projects.spent')}</TableCell>
              <TableCell>{t('projects.usage')}</TableCell>
              <TableCell>{t('projects.status')}</TableCell>
              <TableCell>{t('projects.startDate')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => {
              const usage = getBudgetUsage(project.budget, project.actualCost);
              return (
                <TableRow key={project.id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.budget.toLocaleString()} {project.currency}</TableCell>
                  <TableCell>{project.actualCost.toLocaleString()} {project.currency}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(usage, 100)}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
                      />
                      <Typography variant="body2">{usage.toFixed(0)}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={project.status} color={getStatusColor(project.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    {new Date(project.startDate).toLocaleDateString('fr-FR')}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {projects.length === 0 && (
        <Typography variant="body1" color="text.secondary" textAlign="center" py={8}>
          {t('projects.noProjects')}
        </Typography>
      )}
    </Box>
  );
};
