import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Button,
  Alert
} from '@mui/material';
import { CheckCircle, Schedule, LocationOn, Person, Phone } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { bookingService } from '../services/bookingService';
import { Header } from '../components/common/Header';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

interface BookingData {
  id: string;
  serviceType: string;
  servicePrice: number;
  bookingType: string;
  scheduledDate?: string;
  scheduledTime?: string;
  locality: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  bookingId: string;
  otp: string;
  createdAt: string;
}

export const BookingDetailsPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails();
    }
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      setIsLoading(true);
      const bookingData = await bookingService.getBooking(bookingId!);
      setBooking(bookingData);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'info';
      case 'completed':
        return 'primary';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'warning';
    }
  };

  const formatServiceName = (serviceType: string) => {
    const duration = serviceType.replace('min', '');
    switch (serviceType) {
      case '60min':
        return `${duration} Minutes - The Quick Fix Hour`;
      case '90min':
        return `${duration} Minutes - The Power Hour & a Half`;
      case '120min':
        return `${duration} Minutes - The Full Care Session`;
      default:
        return `${duration} Minutes Service`;
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error || !booking) {
    return <ErrorMessage message={error || 'Booking not found'} onRetry={loadBookingDetails} />;
  }

  return (
    <Box sx={{ pb: 8 }}>
      <Header title="Booking Details" showBackButton />
      
      <Container maxWidth="sm" sx={{ py: 2 }}>
        {/* Status Header */}
        <Box 
          sx={{ 
            bgcolor: booking.status === 'confirmed' ? 'success.light' : 'info.light',
            color: booking.status === 'confirmed' ? 'success.contrastText' : 'info.contrastText',
            py: 2,
            px: 3,
            borderRadius: 2,
            textAlign: 'center',
            mb: 3
          }}
        >
          <CheckCircle sx={{ fontSize: 32, mb: 1 }} />
          <Typography variant="h6" fontWeight={600}>
            Booking {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Typography>
        </Box>

        {/* Booking Info Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Service Details</Typography>
              <Chip
                label={booking.status.toUpperCase()}
                color={getStatusColor(booking.status) as any}
                size="small"
              />
            </Box>

            <Typography variant="h6" mb={1}>
              {formatServiceName(booking.serviceType)}
            </Typography>
            
            <Box display="flex" alignItems="center" mb={2}>
              <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {booking.locality}
              </Typography>
            </Box>

            {booking.bookingType === 'scheduled' && booking.scheduledDate && (
              <Box display="flex" alignItems="center" mb={2}>
                <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Scheduled: {format(new Date(booking.scheduledDate), 'MMM d, yyyy')}
                  {booking.scheduledTime && ` at ${booking.scheduledTime}`}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Booking ID</Typography>
              <Typography variant="body2" fontWeight={500}>{booking.bookingId}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Service Amount</Typography>
              <Typography variant="body2">₹{booking.servicePrice}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Total Amount</Typography>
              <Typography variant="h6" color="primary">₹{booking.totalAmount}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">Payment Status</Typography>
              <Chip
                label={booking.paymentStatus.toUpperCase()}
                color={getPaymentStatusColor(booking.paymentStatus) as any}
                size="small"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>

        {/* OTP Card */}
        {booking.otp && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" mb={2}>Service OTP</Typography>
              <Box display="flex" justifyContent="center" gap={1} mb={2}>
                {booking.otp.split('').map((digit, index) => (
                  <Chip 
                    key={index}
                    label={digit}
                    color="primary"
                    sx={{ 
                      width: 50, 
                      height: 50,
                      fontSize: '1.5rem',
                      fontWeight: 'bold'
                    }}
                  />
                ))}
              </Box>
              <Alert severity="info">
                Share this OTP with the service provider when they arrive
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Booking Timeline */}
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>Booking Timeline</Typography>
            
            <Box display="flex" alignItems="center" mb={2}>
              <CheckCircle color="success" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="body1" fontWeight={500}>Booking Confirmed</Typography>
                <Typography variant="body2" color="text.secondary">
                  {format(new Date(booking.createdAt), 'MMM d, yyyy - h:mm a')}
                </Typography>
              </Box>
            </Box>

            {booking.status === 'completed' && (
              <Box display="flex" alignItems="center">
                <CheckCircle color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="body1" fontWeight={500}>Service Completed</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Service has been completed successfully
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};