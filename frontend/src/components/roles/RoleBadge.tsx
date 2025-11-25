import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface RoleBadgeProps {
  roleSlug: string;
  size?: 'small' | 'medium';
}

const roleColors: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'default' } = {
  'president': 'error',
  'vice-president': 'warning',
  'treasurer': 'success',
  'secretary': 'info',
  'section-head': 'secondary',
  'member': 'default',
};

export const RoleBadge = ({ roleSlug, size = 'small' }: RoleBadgeProps) => {
  const { t } = useTranslation();

  return (
    <Chip
      label={t(`roles.${roleSlug}`)}
      color={roleColors[roleSlug] || 'default'}
      size={size}
    />
  );
};
