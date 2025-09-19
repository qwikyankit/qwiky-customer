import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Payment } from '@mui/icons-material';
import { Header } from '../components/common/Header';
import { paymentService } from '../services/paymentService';

export const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { service, bookingType, scheduledDate, scheduledTime, locality, appliedCoupon, total, bookingData } = location.state as {
    service: {
      id: string;
      name: string;
      price: number;
      duration: number;
    };
    bookingType: 'instant' | 'scheduled';
    scheduledDate?: string;
    scheduledTime?: string;
    locality: string;
    appliedCoupon: any;
    total: number;
    bookingData?: any;
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // Create payment session
      const paymentData = {
        orderId: bookingData?.bookingId || `ORDER_${Date.now()}`,
        amount: total,
        currency: 'INR',
        customerDetails: {
          customerId: 'user_123', // This should come from auth context
          customerPhone: '+919876543210', // This should come from user data
          customerName: 'Test User',
          customerEmail: 'test@example.com'
        }
      };

      const sessionId = await paymentService.createPaymentSession(paymentData);
      
      // Process payment with Cashfree
      await paymentService.processPayment(sessionId);
      
      // Verify payment
      const isVerified = await paymentService.verifyPayment(paymentData.orderId);
      
      if (!isVerified) {
        throw new Error('Payment verification failed');
      }
      
      // Navigate to confirmation page
      navigate('/booking-confirmed', {
        state: {
          service,
          bookingType,
          scheduledDate,
          scheduledTime,
          locality,
          appliedCoupon,
          total,
          bookingId: bookingData?.bookingId || 'KTGYTIHBVC6576',
          otp: bookingData?.otp || '8208'
        }
      });
    } catch (error) {
      console.error('Payment failed:', error);
      setError((error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box>
      <Header title="Payment" showBackButton />
      
      <Container maxWidth="sm" sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Payment failed: {error}
          </Alert>
        )}
        
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Payment color="primary" sx={{ fontSize: 64, mb: 3 }} />
            <Typography variant="h5" mb={2}>
              {isProcessing ? 'Processing Payment' : 'Ready to Pay'}
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
              {isProcessing ? 
                `Please wait while we process your payment of ₹${total}` :
                `Secure payment powered by Cashfree for ₹${total}`
              }
            </Typography>
            
            {isProcessing ? (
              <Box>
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Processing...
                </Typography>
              </Box>
            ) : (
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handlePayment}
                disabled={isProcessing}
                sx={{
                  py: 2,
                  background: 'linear-gradient(135deg, #4E2780 0%, #6B46A3 100%)',
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
                startIcon={<Payment />}
              >
                Pay ₹{total}
              </Button>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};