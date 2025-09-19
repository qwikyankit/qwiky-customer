import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid
} from '@mui/material';
import { format } from 'date-fns';
import { bookingService } from '../services/bookingService';
import { Header } from '../components/common/Header';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useNavigate } from 'react-router-dom';

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
  createdAt: string;
}

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const bookingsData = await bookingService.getBookings();
      setBookings(bookingsData);
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

  const handleBookingClick = (bookingId: string) => {
    navigate(`/booking-details/${bookingId}`);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadBookings} />;
  }

  return (
    <Box sx={{ pb: 8 }}>
      <Header title="Order History" showBackButton />
      
      <Container maxWidth="sm" sx={{ py: 2 }}>
        {bookings.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary" mb={2}>
              No orders yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your booking history will appear here
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {bookings.map((booking) => (
              <Grid item xs={12} key={booking.id}>
                <Card 
                  sx={{ 
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 3
                    }
                  }}
                  onClick={() => handleBookingClick(booking.id)}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box flex={1}>
                        <Typography variant="h6" mb={1}>
                          {formatServiceName(booking.serviceType)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          Booking ID: {booking.bookingId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          {booking.locality}
                        </Typography>
                        {booking.bookingType === 'scheduled' && booking.scheduledDate && (
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            Scheduled: {format(new Date(booking.scheduledDate), 'MMM d, yyyy')}
                            {booking.scheduledTime && ` at ${booking.scheduledTime}`}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          Booked: {format(new Date(booking.createdAt), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Chip
                          label={booking.status.toUpperCase()}
                          color={getStatusColor(booking.status) as any}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="h6" color="primary" mb={1}>
                          ₹{booking.totalAmount}
                        </Typography>
                        <Chip
                          label={booking.paymentStatus.toUpperCase()}
                          color={getPaymentStatusColor(booking.paymentStatus) as any}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};