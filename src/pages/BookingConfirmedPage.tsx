import React from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip
} from '@mui/material';
import { CheckCircle, SupportAgent } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export const BookingConfirmedPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { service, bookingType, scheduledDate, scheduledTime, locality, total, bookingId, otp } = location.state as {
    service: {
      name: string;
      duration: number;
    };
    bookingType: 'instant' | 'scheduled';
    scheduledDate?: string;
    scheduledTime?: string;
    locality: string;
    total: number;
    bookingId: string;
    otp: string;
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const getDisplayTime = () => {
    if (bookingType === 'scheduled' && scheduledTime) {
      return scheduledTime;
    }
    return '08:00 - 09:00 PM';
  };

  const getDisplayDate = () => {
    if (bookingType === 'scheduled' && scheduledDate) {
      return format(new Date(scheduledDate), 'EEE, dd MMM, yyyy');
    }
    return 'Sat, 02 Feb, 2025';
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Success Header */}
      <Box 
        sx={{ 
          bgcolor: 'success.light', 
          color: 'success.contrastText',
          py: 2,
          textAlign: 'center'
        }}
      >
        <CheckCircle sx={{ fontSize: 32, mb: 1 }} />
        <Typography variant="h6" fontWeight={600}>
          Booking Confirmed
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ py: 3 }}>
        {/* Booking Details Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Booking Details</Typography>
              <Box>
                <Typography variant="body2" color="text.secondary">OTP:</Typography>
                <Box display="flex" gap={1}>
                  {otp.split('').map((digit, index) => (
                    <Chip 
                      key={index}
                      label={digit}
                      color="primary"
                      sx={{ 
                        width: 40, 
                        height: 40,
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">Booked for</Typography>
                <Typography variant="body1" fontWeight={500}>John Doe</Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="body2" color="text.secondary">Slot Booked</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {getDisplayTime()} {getDisplayDate()}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">Address</Typography>
                <Typography variant="body1">
                  {locality}
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="body2" color="text.secondary">Booking ID</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {bookingId}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Service Provider Image */}
        <Box textAlign="center" mb={4}>
          <img
            src="https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=400"
            alt="Service Provider"
            style={{
              width: '300px',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '12px'
            }}
          />
        </Box>

        {/* Support Button */}
        <Box position="fixed" bottom={100} right={20}>
          <Button
            variant="contained"
            color="primary"
            sx={{
              borderRadius: '50%',
              width: 60,
              height: 60,
              minWidth: 60
            }}
          >
            <SupportAgent />
          </Button>
        </Box>

        {/* Go to Home Button */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleGoHome}
          sx={{
            py: 2,
            background: 'linear-gradient(135deg, #4E2780 0%, #6B46A3 100%)',
            borderRadius: 3,
            fontSize: '1.1rem',
            fontWeight: 600,
            position: 'fixed',
            bottom: 20,
            left: 20,
            right: 20,
            maxWidth: 'calc(100% - 40px)'
          }}
        >
          GO TO HOME
        </Button>
      </Container>
    </Box>
  );
};