import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, Divider, Chip } from '@mui/material';
import {
  Dashboard,
  People,
  Event,
  AccountBalance,
  Payment,
  Work,
  Settings,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRolesStore } from '../../stores/roles.store';

const drawerWidth = 240;

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  permission?: string;
  roles?: string[];
}

const allMenuItems: MenuItem[] = [
  {
    text: 'dashboard.title',
    icon: <Dashboard />,
    path: 'dashboard',
    roles: ['*'] // Everyone can see dashboard
  },
  {
    text: 'members.title',
    icon: <People />,
    path: 'members',
    permission: 'members.view',
    roles: ['president', 'vice-president', 'secretary', 'treasurer']
  },
  {
    text: 'contributions.title',
    icon: <AccountBalance />,
    path: 'contributions',
    permission: 'finances.view',
    roles: ['president', 'vice-president', 'treasurer']
  },
  {
    text: 'payments.title',
    icon: <Payment />,
    path: 'payments',
    permission: 'finances.view',
    roles: ['president', 'vice-president', 'treasurer']
  },
  {
    text: 'projects.title',
    icon: <Work />,
    path: 'projects',
    permission: 'projects.view',
    roles: ['president', 'vice-president', 'secretary']
  },
  {
    text: 'events.title',
    icon: <Event />,
    path: 'events',
    permission: 'events.view',
    roles: ['president', 'vice-president', 'secretary']
  },
];

export const Sidebar = ({ mobileOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenantId } = useParams<{ tenantId: string }>();
  const { t } = useTranslation();
  const { hasPermission, getPrimaryRole } = useRolesStore();

  const primaryRole = getPrimaryRole();

  // Filter menu items based on role/permission
  const visibleMenuItems = tenantId
    ? allMenuItems.filter(item => {
        // If item has wildcard role, show to everyone
        if (item.roles?.includes('*')) return true;

        // If no permission required, show to everyone
        if (!item.permission && !item.roles) return true;

        // Check permission first
        if (item.permission && hasPermission(item.permission)) return true;

        // Check role
        if (item.roles && primaryRole && item.roles.includes(primaryRole)) return true;

        return false;
      }).map(item => ({
        ...item,
        fullPath: `/associations/${tenantId}/${item.path}`
      }))
    : [];

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const drawer = (
    <Box>
      <Toolbar>
        {primaryRole && (
          <Chip
            label={t(`roles.${primaryRole}`)}
            color="primary"
            size="small"
            icon={<AdminPanelSettings />}
            sx={{ width: '100%' }}
          />
        )}
      </Toolbar>
      <Divider />
      <List>
        {visibleMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.fullPath}
              onClick={() => handleNavigate(item.fullPath)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={t(item.text)} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigate(tenantId ? `/associations/${tenantId}/settings` : '/settings')}>
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText primary={t('common.settings') || 'Paramètres'} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};
