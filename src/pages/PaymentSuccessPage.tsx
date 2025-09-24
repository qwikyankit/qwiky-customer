import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Chip
} from '@mui/material';
import { CheckCircle, Home, Receipt } from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';

export const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const orderId = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    // Load order details from localStorage or API
    if (orderId) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const bookingsKey = `bookings_${currentUser.id}`;
      const bookings = JSON.parse(localStorage.getItem(bookingsKey) || '[]');
      const booking = bookings.find((b: any) => b.bookingId === orderId);
      setOrderDetails(booking);
    }
  }, [orderId]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewBookings = () => {
    navigate('/orders');
  };

  return (
    <Box>
      <Header title="Payment Successful" />
      
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CheckCircle color="success" sx={{ fontSize: 80, mb: 3 }} />
            
            <Typography variant="h4" color="success.main" mb={2} fontWeight={600}>
              Payment Successful!
            </Typography>
            
            <Typography variant="body1" color="text.secondary" mb={4}>
              Your booking has been confirmed successfully.
            </Typography>

            {orderId && (
              <Box mb={4}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Order ID
                </Typography>
                <Chip 
                  label={orderId}
                  color="primary"
                  sx={{ fontSize: '1rem', py: 2, px: 3 }}
                />
              </Box>
            )}

            {paymentId && (
              <Box mb={4}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Payment ID
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {paymentId}
                </Typography>
              </Box>
            )}

            {orderDetails && (
              <Box mb={4}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Service Booked
                </Typography>
                <Typography variant="h6" mb={1}>
                  {orderDetails.serviceType} Service
                </Typography>
                <Typography variant="body1" color="primary" fontWeight={600}>
                  ₹{orderDetails.totalAmount}
                </Typography>
              </Box>
            )}

            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              <Button
                variant="contained"
                onClick={handleViewBookings}
                startIcon={<Receipt />}
                sx={{ px: 4 }}
              >
                View Bookings
              </Button>
              <Button
                variant="outlined"
                onClick={handleGoHome}
                startIcon={<Home />}
                sx={{ px: 4 }}
              >
                Go Home
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};