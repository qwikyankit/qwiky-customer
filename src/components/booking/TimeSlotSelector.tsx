import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays } from 'date-fns';
import { useBooking } from '../../context/BookingContext';
import { TimeSlot } from '../../types';
import { getText } from '../../resources/text';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface TimeSlotSelectorProps {
  onTimeSlotSelect: (timeSlot: TimeSlot) => void;
}

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({ onTimeSlotSelect }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { selectedService, timeSlots, isLoading, error, loadTimeSlots, clearError } = useBooking();

  useEffect(() => {
    if (selectedService && selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      loadTimeSlots(selectedService.id, dateString);
    }
  }, [selectedService, selectedDate]);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => {
          clearError();
          if (selectedService) {
            loadTimeSlots(selectedService.id, format(selectedDate, 'yyyy-MM-dd'));
          }
        }}
      />
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h6" mb={2}>
        {getText('booking.selectTimeSlot')}
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={handleDateChange}
              minDate={new Date()}
              maxDate={addDays(new Date(), 30)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </CardContent>
      </Card>

      <Typography variant="subtitle1" mb={2}>
        Available Time Slots
      </Typography>

      <Grid container spacing={2}>
        {timeSlots
          .filter((slot) => slot.isAvailable)
          .map((timeSlot) => (
            <Grid item xs={6} sm={4} md={3} key={timeSlot.id}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => onTimeSlotSelect(timeSlot)}
                sx={{
                  py: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography variant="body2">
                  {format(new Date(`2000-01-01T${timeSlot.startTime}`), 'h:mm a')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(`2000-01-01T${timeSlot.endTime}`), 'h:mm a')}
                </Typography>
              </Button>
            </Grid>
          ))}
      </Grid>

      {timeSlots.filter((slot) => slot.isAvailable).length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography color="text.secondary">
            No available time slots for the selected date
          </Typography>
        </Box>
      )}
    </Box>
  );
};