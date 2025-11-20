import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Add, CalendarToday, People, LocationOn } from '@mui/icons-material';
import eventsService from '../../services/events.service';
import type { Event } from '../../types';

export const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await eventsService.getAll({ page: 1, limit: 50 });
      setEvents(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
        <Typography variant="h4">Événements</Typography>
        <Button variant="contained" startIcon={<Add />}>
          Créer un événement
        </Button>
      </Box>

      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} md={6} lg={4} key={event.id}>
            <Card>
              <CardContent>
                <Chip label={event.type} size="small" color="primary" sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {event.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {event.description}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2">
                      {new Date(event.startDate).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Box>
                  {event.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2">{event.location}</Typography>
                    </Box>
                  )}
                  {event.maxAttendees && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <People fontSize="small" color="action" />
                      <Typography variant="body2">
                        Max {event.maxAttendees} participants
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small">Voir détails</Button>
                <Button size="small" color="primary">
                  S'inscrire
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {events.length === 0 && (
        <Typography variant="body1" color="text.secondary" textAlign="center" py={8}>
          Aucun événement trouvé
        </Typography>
      )}
    </Box>
  );
};
