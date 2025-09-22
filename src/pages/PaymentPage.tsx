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
  Divider,
  Chip
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Payment, CheckCircle, Info } from '@mui/icons-material';
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
  const [paymentMode, setPaymentMode] = useState<string>('');
  const [serviceTest, setServiceTest] = useState<{ success: boolean; message: string } | null>(null);

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
    // Get payment mode and test service on component mount
    const mode = paymentService.getPaymentMode();
    setPaymentMode(mode);
    
    paymentService.testPaymentService().then(result => {
      setServiceTest(result);
      console.log('Payment service test result:', result);
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
      
      // Process payment (mock or real)
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

  const handleDemoMode = () => {
    // Demo mode - skip payment
    console.log('Using demo mode - skipping payment');
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
  };
  const getProcessingMessage = () => {
    switch (paymentStep) {
      case 'processing':
        return 'Processing your payment...';
      case 'verifying':
        return 'Verifying payment status...';
      default:
        return `Processing your payment of ₹${total}`;
    }
  };
  };
  const getPaymentModeDisplay = () => {
    switch (paymentMode) {
      case 'mock':
        return { label: 'Demo Mode', color: 'info' as const };
      case 'cashfree-test':
        return { label: 'Test Mode', color: 'warning' as const };
      case 'cashfree-live':
        return { label: 'Live Mode', color: 'success' as const };
      default:
        return { label: 'Unknown', color: 'default' as const };
    }
  };
  return (
    <Box>
      <Header title="Payment" showBackButton />
      
      <Container maxWidth="sm" sx={{ py: 3 }}>
        {/* Payment Mode Indicator */}
        <Box display="flex" justifyContent="center" mb={2}>
          <Chip
            icon={<Info />}
            label={`Payment ${getPaymentModeDisplay().label}`}
            color={getPaymentModeDisplay().color}
            variant="outlined"
          />
        </Box>

        {/* Service Test Result */}
        {serviceTest && (
          <Alert 
            severity={serviceTest.success ? 'success' : 'warning'} 
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle2" mb={1}>
              Payment Service Status
            </Typography>
            {serviceTest.message}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" mb={1}>Payment Failed</Typography>
            {error}
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
                  {paymentMode === 'mock' ? 'Simulate Payment' : `Pay ₹${total}`}
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
                  onClick={handleDemoMode}
                  sx={{
                    py: 2,
                    borderRadius: 3,
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                  startIcon={<CheckCircle />}
                >
                  Continue Without Payment (Demo)
                </Button>
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  {paymentMode === 'mock' 
                    ? 'Currently in demo mode - no real payment will be processed'
                    : 'Demo option allows testing the booking flow without payment'
                  }
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};