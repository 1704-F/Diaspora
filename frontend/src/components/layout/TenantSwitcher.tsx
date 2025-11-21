import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Business,
  KeyboardArrowDown,
  Check,
  Add,
} from '@mui/icons-material';
import { useTenantStore } from '../../stores/tenant.store';
import type { Association } from '../../types';

export const TenantSwitcher = () => {
  const navigate = useNavigate();
  const { tenantId } = useParams<{ tenantId: string }>();
  const { tenants, currentTenant, setCurrentTenant } = useTenantStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Only show if user has 2+ associations
  if (tenants.length < 2) {
    return null;
  }

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectAssociation = (association: Association) => {
    setCurrentTenant(association);
    handleClose();

    // Navigate to the dashboard of the selected association
    navigate(`/associations/${association.id}/dashboard`);
  };

  const handleViewAll = () => {
    handleClose();
    navigate('/associations/select');
  };

  const handleCreateNew = () => {
    handleClose();
    navigate('/associations/create');
  };

  // Determine current association (from URL or from store)
  const displayAssociation = tenantId
    ? tenants.find((t) => t.id === tenantId) || currentTenant
    : currentTenant;

  if (!displayAssociation) {
    return null;
  }

  return (
    <Box sx={{ mx: 2 }}>
      <Button
        onClick={handleOpen}
        startIcon={<Business />}
        endIcon={<KeyboardArrowDown />}
        sx={{
          color: 'white',
          textTransform: 'none',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Box sx={{ textAlign: 'left', display: { xs: 'none', md: 'block' } }}>
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
            {displayAssociation.name}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {tenants.length} associations
          </Typography>
        </Box>
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Business />
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 280,
            maxHeight: 400,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
            Changer d'association
          </Typography>
        </Box>
        <Divider />

        {tenants.map((association) => {
          const isSelected = association.id === displayAssociation.id;
          const isActive = association.status === 'ACTIVE';

          return (
            <MenuItem
              key={association.id}
              onClick={() => isActive && handleSelectAssociation(association)}
              disabled={!isActive}
              selected={isSelected}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                {isSelected ? (
                  <Check color="primary" />
                ) : (
                  <Business color={isActive ? 'action' : 'disabled'} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={association.name}
                secondary={
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                    <Chip
                      label={association.primaryCurrency}
                      size="small"
                      sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                    {!isActive && (
                      <Chip
                        label={association.status}
                        size="small"
                        color="error"
                        sx={{ height: 18, fontSize: '0.65rem' }}
                      />
                    )}
                  </Box>
                }
              />
            </MenuItem>
          );
        })}

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={handleViewAll}>
          <ListItemIcon>
            <Business />
          </ListItemIcon>
          <ListItemText primary="Voir toutes les associations" />
        </MenuItem>

        <MenuItem onClick={handleCreateNew}>
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText primary="Créer une nouvelle association" />
        </MenuItem>
      </Menu>
    </Box>
  );
};
