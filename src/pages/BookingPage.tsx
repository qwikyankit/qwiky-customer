import React, { useState } from 'react';
import { Box, Container, Button, Typography, Card, CardContent, Grid, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../context/LocationContext';
import { Service, TimeSlot } from '../types';
import { Header } from '../components/common/Header';
import { LocationPicker } from '../components/maps/LocationPicker';
import { ServiceSelector } from '../components/booking/ServiceSelector';
import { format, addDays } from 'date-fns';

export const BookingPage: React.FC = () => {
  const [step, setStep] = useState<'location' | 'service' | 'timeslot'>('location');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const navigate = useNavigate();
  const { currentLocality } = useLocation();

  const handleLocationConfirm = () => {
    setStep('service');
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep('timeslot');
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    // Navigate to review booking page
    navigate('/review-booking', { 
      state: { 
        service: selectedService, 
        timeSlot: timeSlot,
        locality: currentLocality 
      } 
    });
  };

  const handleBack = () => {
    if (step === 'location') {
      navigate('/');
    } else if (step === 'service') {
      setStep('location');
    } else {
      setStep('service');
    }
  };

  const getTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const today = new Date();
    
    // Generate time slots based on locality
    const morningSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
    const afternoonSlots = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'];
    const eveningSlots = ['15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];
    
    // Vary availability based on locality
    let availableSlots = [...morningSlots, ...afternoonSlots, ...eveningSlots];
    
    if (currentLocality?.toLowerCase().includes('sodala')) {
      // Remove 2PM slot for Sodala
      availableSlots = availableSlots.filter(slot => slot !== '14:00');
    }
    
    availableSlots.forEach((time, index) => {
      const [hours, minutes] = time.split(':');
      const endTime = `${String(parseInt(hours) + (minutes === '30' ? 1 : 0)).padStart(2, '0')}:${minutes === '30' ? '00' : '30'}`;
      
      slots.push({
        id: `slot-${index}`,
        startTime: time,
        endTime: endTime,
        isAvailable: Math.random() > 0.2, // 80% availability
        date: format(today, 'yyyy-MM-dd')
      });
    });
    
    return slots;
  };

  const renderTimeSlotSelector = () => {
    const timeSlots = getTimeSlots();
    const morningSlots = timeSlots.filter(slot => {
      const hour = parseInt(slot.startTime.split(':')[0]);
      return hour >= 9 && hour < 12;
    });
    const afternoonSlots = timeSlots.filter(slot => {
      const hour = parseInt(slot.startTime.split(':')[0]);
      return hour >= 12 && hour < 15;
    });
    const eveningSlots = timeSlots.filter(slot => {
      const hour = parseInt(slot.startTime.split(':')[0]);
      return hour >= 15;
    });

    const renderSlotGroup = (title: string, slots: TimeSlot[]) => (
      <Box mb={3}>
        <Typography variant="h6" mb={2} color="text.primary">
          {title}
        </Typography>
        <Grid container spacing={1}>
          {slots.map((slot) => (
            <Grid item xs={4} sm={3} key={slot.id}>
              <Button
                fullWidth
                variant={slot.isAvailable ? "outlined" : "text"}
                disabled={!slot.isAvailable}
                onClick={() => slot.isAvailable && handleTimeSlotSelect(slot)}
                sx={{
                  py: 1,
                  fontSize: '0.875rem',
                  color: slot.isAvailable ? 'primary.main' : 'text.disabled',
                  borderColor: slot.isAvailable ? 'primary.main' : 'transparent',
                  '&:hover': {
                    bgcolor: slot.isAvailable ? 'primary.light' : 'transparent',
                    color: slot.isAvailable ? 'white' : 'text.disabled'
                  }
                }}
              >
                {format(new Date(`2000-01-01T${slot.startTime}`), 'h:mm a')}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
    );

    return (
      <Box p={2}>
        <Typography variant="h6" mb={2}>
          Select Time Slot
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Available slots for {format(new Date(), 'EEEE, MMMM d')} in {currentLocality}
        </Typography>
        
        {renderSlotGroup('Morning', morningSlots)}
        {renderSlotGroup('Afternoon', afternoonSlots)}
        {renderSlotGroup('Evening', eveningSlots)}
      </Box>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 'location':
        return (
          <Box>
            <LocationPicker />
            {currentLocality && (
              <Box sx={{ p: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleLocationConfirm}
                >
                  Continue with {currentLocality}
                </Button>
              </Box>
            )}
          </Box>
        );
      case 'service':
        return <ServiceSelector onServiceSelect={handleServiceSelect} />;
      case 'timeslot':
        return renderTimeSlotSelector();
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (step) {
      case 'location': return 'Select Location';
      case 'service': return 'Choose Service';
      case 'timeslot': return 'Pick Time Slot';
      default: return 'Book Service';
    }
  };

  return (
    <Box>
      <Header title={getTitle()} showBackButton />
      
      <Container maxWidth="sm">
        <Box>
          {renderStepContent()}
        </Box>
      </Container>
    </Box>
  );
};