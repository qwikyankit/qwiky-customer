import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
} from '@mui/material';
import { LocationOn, Schedule, Build } from '@mui/icons-material';
import { format } from 'date-fns';
import { useBooking } from '../../context/BookingContext';
import { getText } from '../../resources/text';

interface BookingSummaryProps {
  onConfirm: () => void;
  isLoading?: boolean;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({ onConfirm, isLoading }) => {
  const { selectedLocation, selectedService, selectedTimeSlot } = useBooking();

  if (!selectedLocation || !selectedService || !selectedTimeSlot) {
    return null;
  }

  return (
    <Box p={2}>
      <Typography variant="h6" mb={2}>
        {getText('booking.bookingDetails')}
      </Typography>

      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <LocationOn color="primary" sx={{ mr: 2 }} />
            <Box>
              <Typography variant="subtitle1">{selectedLocation.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedLocation.address}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" alignItems="center" mb={2}>
            <Build color="primary" sx={{ mr: 2 }} />
            <Box>
              <Typography variant="subtitle1">{selectedService.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedService.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Duration: {selectedService.duration} minutes
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" alignItems="center" mb={2}>
            <Schedule color="primary" sx={{ mr: 2 }} />
            <Box>
              <Typography variant="subtitle1">
                {format(new Date(selectedTimeSlot.date), 'EEEE, MMMM d, yyyy')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {format(new Date(`2000-01-01T${selectedTimeSlot.startTime}`), 'h:mm a')} -
                {format(new Date(`2000-01-01T${selectedTimeSlot.endTime}`), 'h:mm a')}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Total Amount</Typography>
            <Typography variant="h6" color="primary">
              ₹{selectedService.price}
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {getText('booking.confirmBooking')}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};