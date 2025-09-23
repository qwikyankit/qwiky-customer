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
  const [paymentStep, setPaymentStep] = useState<'ready' | 'processing' | 'redirecting'>('ready');
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
      
      // Prepare payment data
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

      console.log('Starting Cashfree payment process with data:', paymentData);
      
      // Step 1: Initiate payment (create order with backend)
      const initiatePaymentResponse = await paymentService.initiatePayment(paymentData);
      console.log('Payment initiated successfully:', initiatePaymentResponse);
      
      setPaymentStep('redirecting');
      
      // Step 2: Process payment (redirect to Cashfree)
      await paymentService.processPayment(initiatePaymentResponse);
      console.log('Redirecting to Cashfree checkout...');
      
      // Note: At this point, user will be redirected to Cashfree
      // They will return via the callback URL
      
    } catch (error) {
      console.error('Payment failed:', error);
      setError((error as Error).message || 'Payment processing failed');
      setPaymentStep('ready');
      setIsProcessing(false);
    }
  };

  const getProcessingMessage = () => {
    switch (paymentStep) {
      case 'processing':
        return 'Creating payment session...';
      case 'redirecting':
        return 'Redirecting to Cashfree...';
      default:
        return `Processing your payment of ₹${total}`;
    }
  };

  const getPaymentModeDisplay = () => {
    if (paymentService.isTestMode()) {
      return { label: 'Test Mode', color: 'warning' as const };
    } else {
      return { label: 'Live Mode', color: 'success' as const };
    }
  };

  const getPaymentButtonText = () => {
    if (paymentService.isTestMode()) {
      return `Pay with Cashfree (Test) - ₹${total}`;
    } else {
      return `Pay with Cashfree - ₹${total}`;
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
            label={`Cashfree ${getPaymentModeDisplay().label}`}
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
            {!serviceTest.success && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                💡 To enable real payments, deploy the backend API endpoints from the /api/payment/ folder to your server.
              </Typography>
            )}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" mb={1}>Payment Failed</Typography>
            {error}
          </Alert>
        )}
        
        {/* Payment Summary */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>Payment Summary</Typography>
            
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Service</Typography>
              <Typography>{service.name}</Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Duration</Typography>
              <Typography>{service.duration} minutes</Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Location</Typography>
              <Typography>{locality}</Typography>
            </Box>
            
            {appliedCoupon && (
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography color="success.main">Discount ({appliedCoupon.code})</Typography>
                <Typography color="success.main">-₹{appliedCoupon.discount}</Typography>
              </Box>
            )}
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} pt={2} sx={{ borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Total Amount</Typography>
              <Typography variant="h6" color="primary">₹{total}</Typography>
            </Box>
          </CardContent>
        </Card>
        
        {/* Payment Action */}
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            {isProcessing ? (
              <>
                <CircularProgress size={64} sx={{ mb: 3 }} />
                <Typography variant="h5" mb={2}>
                  Processing Payment
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={4}>
                  {getProcessingMessage()}
                </Typography>
              </>
            ) : (
              <>
                <Payment color="primary" sx={{ fontSize: 64, mb: 3 }} />
                <Typography variant="h5" mb={2}>
                  Ready to Pay
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={4}>
                  Secure payment powered by Cashfree
                </Typography>
                
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
                  {getPaymentButtonText()}
                </Button>
                
                {!serviceTest?.success && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Demo Mode:</strong> Backend API not available. 
                      Payment will simulate success for testing purposes.
                    </Typography>
                  </Alert>
                )}
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  {paymentService.isTestMode() 
                    ? 'Test mode - Use test cards for payment'
                    : 'Live payments - Real money will be charged'
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