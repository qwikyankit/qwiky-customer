import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Payment, CheckCircle } from '@mui/icons-material';
import { Header } from '../components/common/Header';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';

export const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'ready' | 'processing' | 'verifying'>('ready');

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

  useEffect(() => {
    // Test payment service on component mount
    paymentService.testPaymentService().then(isWorking => {
      if (!isWorking) {
        console.warn('Payment service test failed, will use mock payments');
      }
    });
  }, []);
  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      setPaymentStep('processing');
      
      // Create payment session
      const paymentData = {
        orderId: bookingData?.bookingId || `ORDER_${Date.now()}`,
        amount: total,
        currency: 'INR',
        customerDetails: {
          customerId: user?.id || 'guest_user',
          customerPhone: user?.mobile ? `+91${user.mobile}` : '+919876543210',
          customerName: user?.name || 'Guest User',
          customerEmail: user?.email || 'guest@example.com'
        }
      };

      console.log('Starting payment process with data:', paymentData);
      const sessionId = await paymentService.createPaymentSession(paymentData);
      console.log('Payment session created:', sessionId);
      
      // Process payment with Cashfree
      await paymentService.processPayment(sessionId);
      console.log('Payment processing completed');
      
      setPaymentStep('verifying');
      // Verify payment
      const isVerified = await paymentService.verifyPayment(paymentData.orderId);
      console.log('Payment verification result:', isVerified);
      
      if (!isVerified) {
        throw new Error('Payment verification failed');
      }
      
      console.log('Payment successful, navigating to confirmation');
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
      setError((error as Error).message || 'Payment processing failed');
      setPaymentStep('ready');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkipPayment = () => {
    // For demo purposes, allow skipping payment
    console.log('Skipping payment for demo');
    navigate('/booking-confirmed', {
      state: {
        service,
        bookingType,
        scheduledDate,
        scheduledTime,
        locality,
        appliedCoupon,
        total: 0, // Free for demo
        bookingId: bookingData?.bookingId || 'DEMO_BOOKING_123',
        otp: bookingData?.otp || '1234'
      }
    });
  const getProcessingMessage = () => {
    switch (paymentStep) {
      case 'processing':
        return 'Processing your payment...';
      case 'verifying':
        return 'Verifying payment status...';
      default:
        return `Please wait while we process your payment of ₹${total}`;
    }
  };
  };
  return (
    <Box>
      <Header title="Payment" showBackButton />
      
      <Container maxWidth="sm" sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" mb={1}>Payment Failed</Typography>
            {error}
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
              You can try again or use the demo mode below.
            </Typography>
          </Alert>
        )}
        
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            {isProcessing ? (
              <CircularProgress size={64} sx={{ mb: 3 }} />
            ) : (
              <Payment color="primary" sx={{ fontSize: 64, mb: 3 }} />
            )}
            
            <Typography variant="h5" mb={2}>
              {isProcessing ? 'Processing Payment' : 'Ready to Pay'}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" mb={4}>
              {isProcessing ? getProcessingMessage() : `Secure payment for ₹${total}`}
            </Typography>
            
            {!isProcessing && (
              <>
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
                    fontWeight: 600,
                    mb: 2
                  }}
                  startIcon={<Payment />}
                >
                  Pay ₹{total}
                </Button>
                
                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>
                
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={handleSkipPayment}
                  sx={{
                    py: 2,
                    borderRadius: 3,
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                  startIcon={<CheckCircle />}
                >
                  Skip Payment (Demo Mode)
                </Button>
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Demo mode allows you to test the booking flow without payment
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};