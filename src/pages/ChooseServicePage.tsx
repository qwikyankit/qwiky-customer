import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Alert
} from '@mui/material';
import { format, addDays, startOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../context/LocationContext';
import { Header } from '../components/common/Header';

export const ChooseServicePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentLocality } = useLocation();
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string | null>(() => {
    // Auto-select time period based on current time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    // 11:59 AM = 11 * 60 + 59 = 719 minutes
    // 4:00 PM = 16 * 60 = 960 minutes
    
    if (currentTimeInMinutes < 719) {
      return 'Morning';
    } else if (currentTimeInMinutes < 960) {
      return 'Afternoon';
    } else {
      return 'Evening';
    }
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfDay(new Date()), i);
    return {
      date,
      dayName: format(date, 'EEE').toUpperCase(),
      dayNumber: format(date, 'd')
    };
  });

  const durations = [
    { id: '60min', name: '60 min', price: 154, originalPrice: 200, selected: true },
    { id: '90min', name: '90 min', price: 154, originalPrice: 200 },
    { id: '120min', name: '120 min', price: 250, originalPrice: 300 }
  ];

  const timePeriods = ['Morning', 'Afternoon', 'Evening'];

  // Generate time slots based on period and locality
  const getTimeSlots = (period: string) => {
    let baseSlots: string[] = [];
    
    switch (period) {
      case 'Morning':
        baseSlots = ['06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', 
                    '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'];
        break;
      case 'Afternoon':
        baseSlots = ['12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', 
                    '02:30 PM', '03:00 PM', '03:30 PM'];
        break;
      case 'Evening':
        baseSlots = ['04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', 
                    '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM'];
        break;
    }

    // Remove 2PM slot for Sodala locality
    if (currentLocality?.toLowerCase().includes('sodala') && period === 'Afternoon') {
      baseSlots = baseSlots.filter(slot => !slot.includes('02:00 PM'));
    }

    return baseSlots.map(slot => ({
      time: slot,
      available: Math.random() > 0.3, // 70% availability
      hasExtra: period === 'Morning' && Math.random() > 0.8 // Some morning slots have extra charge
    }));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleDurationSelect = (durationId: string) => {
    setSelectedDuration(durationId);
  };

  const handleTimePeriodSelect = (period: string) => {
    setSelectedTimePeriod(period);
    setSelectedTimeSlot(null); // Reset time slot when period changes
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleProceedToPay = () => {
    if (!selectedDate || !selectedDuration || !selectedTimeSlot) return;

    const selectedDurationData = durations.find(d => d.id === selectedDuration);
    
    navigate('/review-booking', {
      state: {
        service: {
          id: selectedDuration,
          name: selectedDurationData?.name,
          price: selectedDurationData?.price,
          duration: parseInt(selectedDuration.replace('min', '')),
          description: `Scheduled ${selectedDurationData?.name} service`
        },
        bookingType: 'scheduled',
        scheduledDate: format(selectedDate, 'yyyy-MM-dd'),
        scheduledTime: selectedTimeSlot,
        timePeriod: selectedTimePeriod?.toLowerCase(),
        locality: currentLocality
      }
    });
  };

  const timeSlots = selectedTimePeriod ? getTimeSlots(selectedTimePeriod) : [];
  const hasAvailableSlots = timeSlots.some(slot => slot.available);

  return (
    <Box>
      <Header title="Choose Service" showBackButton />
      
      <Container maxWidth="sm" sx={{ py: 2, bgcolor: 'grey.100', minHeight: '100vh' }}>
        {/* Select Date */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Select Date</Typography>
              <Typography variant="body2" color="text.secondary">▼</Typography>
            </Box>
            
            <Box 
              sx={{ 
                display: 'flex',
                gap: 1,
                overflowX: 'auto',
                pb: 1,
                '&::-webkit-scrollbar': {
                  height: 4,
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'grey.200',
                  borderRadius: 2,
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'primary.main',
                  borderRadius: 2,
                },
              }}
            >
              {dates.map((dateItem, index) => (
                <Button
                  key={index}
                  variant={selectedDate?.getTime() === dateItem.date.getTime() ? "contained" : "outlined"}
                  onClick={() => handleDateSelect(dateItem.date)}
                  sx={{
                    py: 2,
                    px: 3,
                    borderRadius: 2,
                    flexDirection: 'column',
                    minWidth: 80,
                    flexShrink: 0,
                    bgcolor: selectedDate?.getTime() === dateItem.date.getTime() ? 'primary.main' : 'white',
                    color: selectedDate?.getTime() === dateItem.date.getTime() ? 'white' : 'text.primary',
                    borderColor: 'grey.300',
                    '&:hover': {
                      bgcolor: selectedDate?.getTime() === dateItem.date.getTime() ? 'primary.dark' : 'grey.50'
                    }
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {dateItem.dayName}
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {dateItem.dayNumber}
                  </Typography>
                </Button>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Select Duration */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Select Duration</Typography>
              <Typography variant="body2" color="text.secondary">▼</Typography>
            </Box>
            
            <Box 
              sx={{ 
                display: 'flex',
                gap: 2,
                overflowX: 'auto',
                pb: 1,
                '&::-webkit-scrollbar': {
                  height: 4,
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'grey.200',
                  borderRadius: 2,
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'primary.main',
                  borderRadius: 2,
                },
              }}
            >
              {durations.map((duration) => (
                <Button
                  key={duration.id}
                  variant={selectedDuration === duration.id ? "contained" : "outlined"}
                  onClick={() => handleDurationSelect(duration.id)}
                  sx={{
                    py: 2,
                    px: 3,
                    borderRadius: 2,
                    flexDirection: 'column',
                    minWidth: 120,
                    flexShrink: 0,
                    bgcolor: selectedDuration === duration.id ? 'primary.main' : 'white',
                    color: selectedDuration === duration.id ? 'white' : 'text.primary',
                    borderColor: 'grey.300',
                    '&:hover': {
                      bgcolor: selectedDuration === duration.id ? 'primary.dark' : 'grey.50'
                    }
                  }}
                >
                  <Typography variant="body1" fontWeight={600} mb={1}>
                    {duration.name}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    ₹{duration.price}
                  </Typography>
                  <Typography variant="caption" sx={{ textDecoration: 'line-through', opacity: 0.7 }}>
                    ₹{duration.originalPrice}
                  </Typography>
                </Button>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Select Time Period */}
        {selectedDate && selectedDuration && (
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Select Time</Typography>
                <Typography variant="body2" color="text.secondary">▼</Typography>
              </Box>
              
              <Box 
                sx={{ 
                  display: 'flex',
                  gap: 1,
                  overflowX: 'auto',
                  pb: 1,
                  mb: 3,
                  '&::-webkit-scrollbar': {
                    height: 4,
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'grey.200',
                    borderRadius: 2,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'primary.main',
                    borderRadius: 2,
                  },
                }}
              >
                {timePeriods.map((period) => (
                  <Button
                    key={period}
                    variant={selectedTimePeriod === period ? "contained" : "outlined"}
                    onClick={() => handleTimePeriodSelect(period)}
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderRadius: 2,
                      minWidth: 100,
                      flexShrink: 0,
                      bgcolor: selectedTimePeriod === period ? 'primary.main' : 'white',
                      color: selectedTimePeriod === period ? 'white' : 'text.primary',
                      borderColor: 'grey.300'
                    }}
                  >
                    {period}
                  </Button>
                ))}
              </Box>

              {/* Time Slots */}
              {selectedTimePeriod && (
                <>
                  {hasAvailableSlots ? (
                    <Box 
                      sx={{ 
                        display: 'flex',
                        gap: 1,
                        overflowX: 'auto',
                        pb: 1,
                        flexWrap: 'wrap',
                        '&::-webkit-scrollbar': {
                          height: 4,
                        },
                        '&::-webkit-scrollbar-track': {
                          backgroundColor: 'grey.200',
                          borderRadius: 2,
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: 'primary.main',
                          borderRadius: 2,
                        },
                      }}
                    >
                      {timeSlots.map((slot, index) => (
                        <Box key={index} position="relative" sx={{ flexShrink: 0 }}>
                          {slot.hasExtra && (
                            <Chip
                              label="EXTRA ₹16"
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: -8,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 1,
                                bgcolor: 'orange',
                                color: 'white',
                                fontSize: '0.6rem',
                                height: 16
                              }}
                            />
                          )}
                          <Button
                            variant={selectedTimeSlot === slot.time ? "contained" : "outlined"}
                            disabled={!slot.available}
                            onClick={() => slot.available && handleTimeSlotSelect(slot.time)}
                            sx={{
                              py: 1.5,
                              px: 2,
                              borderRadius: 2,
                              minWidth: 90,
                              bgcolor: selectedTimeSlot === slot.time ? 'primary.main' : 'white',
                              color: selectedTimeSlot === slot.time ? 'white' : 'text.primary',
                              borderColor: slot.available ? 'grey.300' : 'grey.200',
                              opacity: slot.available ? 1 : 0.5,
                              mt: slot.hasExtra ? 1 : 0
                            }}
                          >
                            <Typography variant="body2">
                              {slot.time}
                            </Typography>
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box textAlign="center" py={4}>
                      <Box
                        component="img"
                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyIDhDMTguNzQ1IDggOCAyMC43NDUgOCAzNEM4IDQ3LjI1NSAxOC43NDUgNjAgMzIgNjBDNDUuMjU1IDYwIDU2IDQ3LjI1NSA1NiAzNEM1NiAyMC43NDUgNDUuMjU1IDggMzIgOFpNMzIgNTJDMjMuMTYzIDUyIDE2IDQ0LjgzNyAxNiAzNkMxNiAyNy4xNjMgMjMuMTYzIDIwIDMyIDIwQzQwLjgzNyAyMCA0OCAyNy4xNjMgNDggMzZDNDggNDQuODM3IDQwLjgzNyA1MiAzMiA1MloiIGZpbGw9IiNDQ0NDQ0MiLz4KPHBhdGggZD0iTTMyIDI4VjQ0IiBzdHJva2U9IiNDQ0NDQ0MiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik0yNCAzNkgzMiIgc3Ryb2tlPSIjQ0NDQ0NDIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K"
                        alt="No slots"
                        sx={{ width: 64, height: 64, mb: 2, opacity: 0.5 }}
                      />
                      <Typography variant="h6" color="text.secondary" mb={1}>
                        No slots available
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Please try after some time
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Bottom Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          bgcolor: 'white',
          borderTop: '1px solid',
          borderColor: 'grey.200'
        }}
      >
        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={!selectedDate || !selectedDuration || !selectedTimeSlot || !hasAvailableSlots}
          onClick={handleProceedToPay}
          sx={{
            py: 2,
            borderRadius: 3,
            background: selectedDate && selectedDuration && selectedTimeSlot && hasAvailableSlots 
              ? 'linear-gradient(135deg, #4E2780 0%, #6B46A3 100%)' 
              : 'grey.300',
            fontSize: '1.1rem',
            fontWeight: 600
          }}
        >
          {!hasAvailableSlots && selectedTimePeriod ? 'NO SLOTS AVAILABLE' : `SLIDE TO PAY ₹${durations.find(d => d.id === selectedDuration)?.price || 154}`}
        </Button>
      </Box>
    </Box>
  );
};