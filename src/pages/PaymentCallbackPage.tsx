import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { CheckCircle, Error, Home } from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import { Header } from '../components/common/Header';

export const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [result, setResult] = useState<{
    success: boolean;
    orderId: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    handlePaymentCallback();
  }, []);

  const handlePaymentCallback = async () => {
    try {
      // Extract callback parameters from URL
      const callbackData = {
        order_id: searchParams.get('order_id'),
        order_status: searchParams.get('order_status'),
        payment_status: searchParams.get('payment_status'),
        cf_payment_id: searchParams.get('cf_payment_id'),
        payment_amount: searchParams.get('payment_amount'),
        payment_currency: searchParams.get('payment_currency'),
        payment_message: searchParams.get('payment_message'),
        payment_time: searchParams.get('payment_time'),
        signature: searchParams.get('signature')
      };

      console.log('Payment callback data:', callbackData);

      // Handle the callback using payment service
      const callbackResult = paymentService.handlePaymentCallback(callbackData);
      setResult(callbackResult);

      // If successful, verify payment
      if (callbackResult.success && callbackResult.orderId) {
        const isVerified = await paymentService.verifyPayment(callbackResult.orderId);
        
        if (!isVerified) {
          setResult({
            success: false,
            orderId: callbackResult.orderId,
            message: 'Payment verification failed'
          });
        }
      }
    } catch (error) {
      console.error('Error handling payment callback:', error);
      setResult({
        success: false,
        orderId: '',
        message: 'Failed to process payment callback'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToBookings = () => {
    navigate('/orders');
  };

  if (isProcessing) {
    return (
      <Box>
        <Header title="Processing Payment" />
        <Container maxWidth="sm" sx={{ py: 6 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress size={64} sx={{ mb: 3 }} />
              <Typography variant="h6" mb={2}>
                Processing Payment Result
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please wait while we verify your payment...
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <Header title="Payment Result" />
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            {result?.success ? (
              <>
                <CheckCircle color="success" sx={{ fontSize: 64, mb: 3 }} />
                <Typography variant="h5" color="success.main" mb={2}>
                  Payment Successful!
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={4}>
                  {result.message}
                </Typography>
                {result.orderId && (
                  <Typography variant="body2" color="text.secondary" mb={4}>
                    Order ID: {result.orderId}
                  </Typography>
                )}
                <Box display="flex" gap={2} justifyContent="center">
                  <Button
                    variant="contained"
                    onClick={handleGoToBookings}
                    sx={{ px: 4 }}
                  >
                    View Bookings
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleGoHome}
                    startIcon={<Home />}
                  >
                    Go Home
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Error color="error" sx={{ fontSize: 64, mb: 3 }} />
                <Typography variant="h5" color="error.main" mb={2}>
                  Payment Failed
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={4}>
                  {result?.message || 'Something went wrong with your payment'}
                </Typography>
                {result?.orderId && (
                  <Typography variant="body2" color="text.secondary" mb={4}>
                    Order ID: {result.orderId}
                  </Typography>
                )}
                <Alert severity="info" sx={{ mb: 4 }}>
                  Don't worry! No amount has been deducted from your account.
                  You can try booking again.
                </Alert>
                <Box display="flex" gap={2} justifyContent="center">
                  <Button
                    variant="contained"
                    onClick={handleGoHome}
                    startIcon={<Home />}
                  >
                    Go Home
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};