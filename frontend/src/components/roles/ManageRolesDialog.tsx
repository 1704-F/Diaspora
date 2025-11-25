import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import rolesService, { Role, MemberRole } from '../../services/roles.service';
import { RoleBadge } from './RoleBadge';
import toast from 'react-hot-toast';

interface ManageRolesDialogProps {
  open: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
  tenantId: string;
}

export const ManageRolesDialog = ({
  open,
  onClose,
  memberId,
  memberName,
  tenantId,
}: ManageRolesDialogProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [memberRoles, setMemberRoles] = useState<MemberRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, memberId, tenantId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [roles, currentRoles] = await Promise.all([
        rolesService.getRoles(tenantId),
        rolesService.getMemberRoles(tenantId, memberId),
      ]);
      setAvailableRoles(roles);
      setMemberRoles(currentRoles);
    } catch (err: any) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedRoleId) return;

    try {
      setLoading(true);
      await rolesService.assignRole(tenantId, memberId, selectedRoleId);
      toast.success(t('roles.roleAssigned') || 'Rôle attribué avec succès');
      setSelectedRoleId('');
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('common.error'));
      setLoading(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      setLoading(true);
      await rolesService.removeRole(tenantId, memberId, roleId);
      toast.success(t('roles.roleRemoved') || 'Rôle retiré avec succès');
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('common.error'));
      setLoading(false);
    }
  };

  // Filter out roles already assigned
  const assignedRoleIds = memberRoles.map(mr => mr.roleId);
  const unassignedRoles = availableRoles.filter(r => !assignedRoleIds.includes(r.id));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t('members.manageRoles')}
        <Typography variant="body2" color="text.secondary">
          {memberName}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && !memberRoles.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Current Roles */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('roles.currentRoles') || 'Rôles actuels'}
              </Typography>
              {memberRoles.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t('roles.noRoles') || 'Aucun rôle attribué'}
                </Typography>
              ) : (
                <List dense>
                  {memberRoles.map((memberRole) => (
                    <ListItem key={memberRole.id}>
                      <ListItemText
                        primary={<RoleBadge roleSlug={memberRole.role.slug} />}
                        secondary={memberRole.role.description}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveRole(memberRole.roleId)}
                          disabled={loading}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Assign New Role */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t('roles.assignNewRole') || 'Attribuer un nouveau rôle'}
              </Typography>
              {unassignedRoles.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t('roles.allRolesAssigned') || 'Tous les rôles sont déjà attribués'}
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('members.role')}</InputLabel>
                    <Select
                      value={selectedRoleId}
                      onChange={(e) => setSelectedRoleId(e.target.value)}
                      label={t('members.role')}
                    >
                      {unassignedRoles.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          {t(`roles.${role.slug}`)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <IconButton
                    color="primary"
                    onClick={handleAssignRole}
                    disabled={!selectedRoleId || loading}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.close') || 'Fermer'}</Button>
      </DialogActions>
    </Dialog>
  );
};
