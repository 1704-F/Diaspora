import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Typography,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import membersService from '../../services/members.service';
import toast from 'react-hot-toast';

interface StepAddMembersProps {
  associationId: string;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

interface MemberFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export const StepAddMembers = ({ associationId, onNext, onBack, onSkip }: StepAddMembersProps) => {
  const { t } = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const [addedMembers, setAddedMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<MemberFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const handleChange = (field: keyof MemberFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleAddMember = async () => {
    setIsLoading(true);
    try {
      const member = await membersService.create(associationId, {
        ...formData,
        statusType: 'ACTIVE',
      });
      setAddedMembers((prev) => [...prev, member]);
      toast.success(t('onboarding.step2.memberAdded'));
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      });
      setOpenDialog(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = (index: number) => {
    setAddedMembers((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        {t('onboarding.step2.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {t('onboarding.step2.description')}
      </Typography>

      <Box sx={{ my: 4 }}>
        {addedMembers.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {addedMembers.length} {t('members.title').toLowerCase()}
            </Typography>
            <List>
              {addedMembers.map((member, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleRemoveMember(index)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={`${member.firstName} ${member.lastName}`}
                    secondary={member.email}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          fullWidth
          size="large"
        >
          {t('onboarding.step2.addMember')}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button onClick={onBack} size="large">
          {t('common.back')}
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={onSkip} size="large">
            {t('common.skip')}
          </Button>
          <Button
            variant="contained"
            onClick={onNext}
            size="large"
          >
            {t('common.next')}
          </Button>
        </Box>
      </Box>

      {/* Add Member Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('members.addMember')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('members.firstName')}
                value={formData.firstName}
                onChange={handleChange('firstName')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('members.lastName')}
                value={formData.lastName}
                onChange={handleChange('lastName')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('members.email')}
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('members.phone')}
                value={formData.phone}
                onChange={handleChange('phone')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>{t('common.cancel')}</Button>
          <Button
            onClick={handleAddMember}
            variant="contained"
            disabled={isLoading || !formData.firstName || !formData.lastName || !formData.email}
          >
            {t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
