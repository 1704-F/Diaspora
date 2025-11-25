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
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add, Edit, Delete, Visibility, AdminPanelSettings } from '@mui/icons-material';
import membersService from '../../services/members.service';
import rolesService, { MemberRole } from '../../services/roles.service';
import type { Member, MemberStatus } from '../../types';
import toast from 'react-hot-toast';
import { ManageRolesDialog } from '../../components/roles/ManageRolesDialog';
import { RoleBadge } from '../../components/roles/RoleBadge';

export const MembersPage = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberRoles, setMemberRoles] = useState<{ [memberId: string]: MemberRole[] }>({});
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    country: 'Cameroun',
  });

  useEffect(() => {
    // If no tenantId in URL, redirect to associations page
    if (!tenantId) {
      navigate('/associations');
      return;
    }

    loadMembers();
  }, [tenantId, navigate]);

  const loadMembers = async () => {
    if (!tenantId) return;

    try {
      setLoading(true);
      const response = await membersService.getAll(tenantId, { page: 1, limit: 100 });
      setMembers(response.data);

      // Load roles for each member
      const rolesMap: { [memberId: string]: MemberRole[] } = {};
      await Promise.all(
        response.data.map(async (member) => {
          try {
            const roles = await rolesService.getMemberRoles(tenantId, member.id);
            rolesMap[member.id] = roles;
          } catch (err) {
            rolesMap[member.id] = [];
          }
        })
      );
      setMemberRoles(rolesMap);
    } catch (err: any) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      city: '',
      country: 'Cameroun',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenantId) return;

    try {
      await membersService.create(tenantId, formData);
      toast.success(t('members.memberAdded') || 'Membre ajouté avec succès');
      handleCloseDialog();
      loadMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
  };

  const handleOpenRolesDialog = (member: Member) => {
    setSelectedMember(member);
    setRolesDialogOpen(true);
  };

  const handleCloseRolesDialog = () => {
    setRolesDialogOpen(false);
    setSelectedMember(null);
    // Reload members to refresh roles
    loadMembers();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir désactiver ce membre ?')) {
      return;
    }

    if (!tenantId) return;

    try {
      await membersService.delete(tenantId, id);
      toast.success('Membre désactivé');
      loadMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const getStatusColor = (status: MemberStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'default';
      case 'SUSPENDED':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('members.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          {t('members.addMember') || 'Ajouter un membre'}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('members.memberNumber')}</TableCell>
              <TableCell>{t('members.fullName')}</TableCell>
              <TableCell>{t('members.email')}</TableCell>
              <TableCell>{t('members.phone')}</TableCell>
              <TableCell>{t('members.roles')}</TableCell>
              <TableCell>{t('members.status')}</TableCell>
              <TableCell>{t('members.membershipDate')}</TableCell>
              <TableCell align="right">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary" py={4}>
                    {t('members.noMembers')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.memberNumber}</TableCell>
                  <TableCell>
                    {member.user.firstName} {member.user.lastName}
                  </TableCell>
                  <TableCell>{member.user.email}</TableCell>
                  <TableCell>{member.user.phone || '-'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {memberRoles[member.id]?.length > 0 ? (
                        memberRoles[member.id].map((memberRole) => (
                          <RoleBadge key={memberRole.id} roleSlug={memberRole.role.slug} />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={member.status}
                      color={getStatusColor(member.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(member.membershipDate).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenRolesDialog(member)}
                      title={t('members.manageRoles')}
                    >
                      <AdminPanelSettings />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <Visibility />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(member.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Member Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{t('members.addMember')}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('members.firstName')}
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('members.lastName')}
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('members.email')}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('members.phone')}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('members.address')}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('members.city')}
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('members.country')}
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
          >
            {t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Roles Dialog */}
      {selectedMember && (
        <ManageRolesDialog
          open={rolesDialogOpen}
          onClose={handleCloseRolesDialog}
          memberId={selectedMember.id}
          memberName={`${selectedMember.user.firstName} ${selectedMember.user.lastName}`}
          tenantId={tenantId!}
        />
      )}
    </Box>
  );
};
