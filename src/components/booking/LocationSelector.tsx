import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { useBooking } from '../../context/BookingContext';
import { Location } from '../../types';
import { getText } from '../../resources/text';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface LocationSelectorProps {
  onLocationSelect: (location: Location) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ onLocationSelect }) => {
  const { locations, isLoading, error, loadLocations, clearError } = useBooking();

  useEffect(() => {
    loadLocations();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => { clearError(); loadLocations(); }} />;
  }

  return (
    <Box p={2}>
      <Typography variant="h6" mb={2}>
        {getText('booking.selectLocation')}
      </Typography>

      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <List>
            {locations.map((location, index) => (
              <React.Fragment key={location.id}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => onLocationSelect(location)}>
                    <LocationOn color="primary" sx={{ mr: 2 }} />
                    <ListItemText
                      primary={location.name}
                      secondary={location.address}
                    />
                  </ListItemButton>
                </ListItem>
                {index < locations.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};