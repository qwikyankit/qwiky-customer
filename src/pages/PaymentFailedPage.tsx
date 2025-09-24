import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip
} from '@mui/material';
import { Error, Home, Refresh } from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';

export const PaymentFailedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const orderId = searchParams.get('order_id');
  const reason = searchParams.get('reason');

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

  const handleRetryPayment = () => {
    // Navigate back to payment page with order details
    if (orderDetails) {
      navigate('/payment', { 
        state: { 
          service: {
            id: orderDetails.serviceType,
            name: orderDetails.serviceType,
            price: orderDetails.servicePrice,
            duration: parseInt(orderDetails.serviceType.replace('min', ''))
          },
          bookingType: orderDetails.bookingType,
          scheduledDate: orderDetails.scheduledDate,
          scheduledTime: orderDetails.scheduledTime,
          locality: orderDetails.locality,
          total: orderDetails.totalAmount,
          bookingData: orderDetails
        }
      });
    } else {
      navigate('/');
    }
  };

  const getFailureMessage = () => {
    switch (reason) {
      case 'cancelled':
        return 'Payment was cancelled by user';
      case 'processing_error':
        return 'There was an error processing your payment';
      default:
        return reason || 'Payment failed due to an unknown error';
    }
  };

  return (
    <Box>
      <Header title="Payment Failed" />
      
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Error color="error" sx={{ fontSize: 80, mb: 3 }} />
            
            <Typography variant="h4" color="error.main" mb={2} fontWeight={600}>
              Payment Failed
            </Typography>
            
            <Typography variant="body1" color="text.secondary" mb={4}>
              {getFailureMessage()}
            </Typography>

            {orderId && (
              <Box mb={4}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Order ID
                </Typography>
                <Chip 
                  label={orderId}
                  color="default"
                  sx={{ fontSize: '1rem', py: 2, px: 3 }}
                />
              </Box>
            )}

            {orderDetails && (
              <Box mb={4}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Service
                </Typography>
                <Typography variant="h6" mb={1}>
                  {orderDetails.serviceType} Service
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  ₹{orderDetails.totalAmount}
                </Typography>
              </Box>
            )}

            <Alert severity="info" sx={{ mb: 4, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>Don't worry!</strong> If any amount was deducted from your account, 
                it will be refunded within 5-7 business days.
              </Typography>
            </Alert>

            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              <Button
                variant="contained"
                onClick={handleRetryPayment}
                startIcon={<Refresh />}
                sx={{ px: 4 }}
              >
                Retry Payment
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