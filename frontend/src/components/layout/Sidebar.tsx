import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, Divider } from '@mui/material';
import {
  Dashboard,
  People,
  Event,
  AccountBalance,
  Payment,
  Work,
  Settings,
} from '@mui/icons-material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const drawerWidth = 240;

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const baseMenuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: 'dashboard' },
  { text: 'Membres', icon: <People />, path: 'members' },
  { text: 'Cotisations', icon: <AccountBalance />, path: 'contributions' },
  { text: 'Paiements', icon: <Payment />, path: 'payments' },
  { text: 'Projets', icon: <Work />, path: 'projects' },
  { text: 'Événements', icon: <Event />, path: 'events' },
];

export const Sidebar = ({ mobileOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenantId } = useParams<{ tenantId: string }>();

  // Build menu items with tenantId in paths
  const menuItems = tenantId
    ? baseMenuItems.map(item => ({
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
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.fullPath}
              onClick={() => handleNavigate(item.fullPath)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
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
            <ListItemText primary="Paramètres" />
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
