import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  TextField,
  Alert
} from '@mui/material';
import { ArrowForward, LocalOffer, CheckCircle } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Header } from '../components/common/Header';
import { bookingService } from '../services/bookingService';

export const ReviewBookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { service, bookingType, scheduledDate, scheduledTime, timePeriod, locality } = location.state as {
    service: {
      id: string;
      name: string;
      price: number;
      duration: number;
      description: string;
    };
    bookingType: 'instant' | 'scheduled';
    scheduledDate?: string;
    scheduledTime?: string;
    timePeriod?: string;
    locality: string;
  };

  const [showCoupons, setShowCoupons] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponCode, setCouponCode] = useState('');
  const [showCouponSuccess, setShowCouponSuccess] = useState(false);

  const availableCoupons = [
    {
      id: 'free',
      title: 'FREE',
      subtitle: 'FREE Service',
      description: 'Use code FREE on your next booking for 1 hour of FREE service',
      code: 'FREE',
      discount: service.price,
      type: 'free_service'
    },
    {
      id: 'specials',
      title: 'SPECIALS',
      subtitle: 'Save ₹25 on this booking!',
      description: 'Use code TRYNEW & get ₹15 off on this booking',
      code: 'SPECIALS',
      discount: 25,
      type: 'discount'
    }
  ];

  const handleApplyCoupon = (coupon: any) => {
    setAppliedCoupon(coupon);
    setShowCoupons(false);
    setShowCouponSuccess(true);
    setTimeout(() => setShowCouponSuccess(false), 2000);
  };

  const handleManualCoupon = () => {
    const coupon = availableCoupons.find(c => c.code === couponCode.toUpperCase());
    if (coupon) {
      handleApplyCoupon(coupon);
      setCouponCode('');
    }
  };

  const calculateTotal = () => {
    let total = service.price;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'free_service') {
        total = 0;
      } else {
        total = Math.max(0, total - appliedCoupon.discount);
      }
    }
    return total;
  };

  const handlePayment = async () => {
    try {
      // Create booking in database
      const bookingData = await bookingService.createBooking({
        serviceType: service.id,
        servicePrice: service.price,
        bookingType,
        scheduledDate,
        scheduledTime,
        timePeriod,
        locality,
        couponCode: appliedCoupon?.code,
        discountAmount: appliedCoupon?.discount || 0
      });

      // Navigate to payment with booking data
      const paymentState = {
        service,
        bookingType,
        scheduledDate,
        scheduledTime,
        locality,
        appliedCoupon,
        total: calculateTotal(),
        bookingData
      };
      
      navigate('/payment', { state: paymentState });
    } catch (error) {
      console.error('Error creating booking:', error);
      // Still navigate to payment for demo purposes
      const fallbackState = {
        service,
        bookingType,
        scheduledDate,
        scheduledTime,
        locality,
        appliedCoupon,
        total: calculateTotal()
      };
      
      navigate('/payment', { state: fallbackState });
    }
  };

  const getServiceDisplayName = () => {
    if (bookingType === 'instant') {
      return appliedCoupon?.type === 'free_service' ? 'Expert Service' : 'Slot Booked';
    }
    return service.description || service.name;
  };

  const getServiceDuration = () => {
    if (bookingType === 'scheduled' && scheduledTime) {
      const [hours, minutes] = scheduledTime.split(':');
      const period = scheduledTime.includes('AM') || scheduledTime.includes('PM') ? '' : 
                   (parseInt(hours) >= 12 ? ' PM' : ' AM');
      return `${service.duration} min (${scheduledTime}${period})`;
    }
    return `${service.duration} min`;
  };

  return (
    <Box>
      <Header title="Review Booking" showBackButton />
      
      <Container maxWidth="sm" sx={{ py: 2 }}>
        {/* Service Details */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar
                src="https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=100"
                sx={{ width: 60, height: 60, mr: 2 }}
              />
              <Box flex={1}>
                <Typography variant="h6">
                  {getServiceDisplayName()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getServiceDuration()}
                </Typography>
                {bookingType === 'scheduled' && scheduledDate && (
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(scheduledDate), 'EEE, MMM d, yyyy')}
                  </Typography>
                )}
              </Box>
              <Typography variant="h6" color="primary">
                ₹{service.price}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Coupon Section */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="space-between"
              onClick={() => setShowCoupons(true)}
              sx={{ cursor: 'pointer' }}
            >
              <Box display="flex" alignItems="center">
                <LocalOffer color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="body1">
                    {appliedCoupon ? `₹${appliedCoupon.discount} saved with ${appliedCoupon.title}` : 'Apply coupons'}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    {appliedCoupon ? (
                      <Box display="flex" alignItems="center">
                        <CheckCircle sx={{ fontSize: 16, mr: 0.5 }} />
                        Applied
                      </Box>
                    ) : (
                      'Coupons Available'
                    )}
                  </Typography>
                </Box>
              </Box>
              <ArrowForward />
            </Box>
          </CardContent>
        </Card>

        {/* Refund Policy */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="body1">Refund & Cancellation Policy</Typography>
              <ArrowForward />
            </Box>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Full refund if cancelled 30 mins before scheduled time. 
              Refund for partial cancellations shall be adjusted against discounts
            </Typography>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>Payment details</Typography>
            
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Service Charge</Typography>
              <Typography>₹{service.price}.00</Typography>
            </Box>
            
            {appliedCoupon && (
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography color="success.main">Discount ({appliedCoupon.code})</Typography>
                <Typography color="success.main">-₹{appliedCoupon.discount}.00</Typography>
              </Box>
            )}
            
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography>GST</Typography>
              <Typography>00.00</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Total Payable</Typography>
              <Typography variant="h6">₹{calculateTotal()}.00</Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Payment Button */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handlePayment}
          sx={{
            py: 2,
            background: 'linear-gradient(135deg, #4E2780 0%, #6B46A3 100%)',
            borderRadius: 3,
            fontSize: '1.1rem',
            fontWeight: 600
          }}
          startIcon={<ArrowForward />}
        >
          SLIDE TO PAY ₹{calculateTotal()}
        </Button>
      </Container>

      {/* Coupon Success Dialog */}
      <Dialog open={showCouponSuccess} onClose={() => setShowCouponSuccess(false)}>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <LocalOffer color="success" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6" mb={1}>'{appliedCoupon?.title}' applied</Typography>
          <Typography variant="h4" color="success.main" mb={2}>
            ₹{appliedCoupon?.discount} savings with this coupon
          </Typography>
          <Button 
            variant="contained" 
            color="success" 
            fullWidth
            onClick={() => setShowCouponSuccess(false)}
          >
            AWESOME
          </Button>
        </DialogContent>
      </Dialog>

      {/* Coupons Dialog */}
      <Dialog 
        open={showCoupons} 
        onClose={() => setShowCoupons(false)}
        fullScreen
      >
        <Box>
          <Header title="Apply Coupon" showBackButton />
          <Container maxWidth="sm" sx={{ py: 2 }}>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Your Cart: ₹{service.price}
            </Typography>

            {/* Manual Coupon Input */}
            <Box display="flex" gap={1} mb={3}>
              <TextField
                fullWidth
                placeholder="Enter Coupon Code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                size="small"
              />
              <Button 
                variant="outlined" 
                onClick={handleManualCoupon}
                disabled={!couponCode.trim()}
              >
                APPLY
              </Button>
            </Box>

            {/* Available Coupons */}
            <List>
              {availableCoupons.map((coupon) => (
                <ListItem key={coupon.id} sx={{ mb: 2, p: 0 }}>
                  <Card sx={{ width: '100%' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Box display="flex" alignItems="center">
                          <Box
                            sx={{
                              width: 60,
                              height: 80,
                              bgcolor: 'primary.main',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2,
                              borderRadius: 1,
                              writingMode: 'vertical-rl',
                              textOrientation: 'mixed'
                            }}
                          >
                            <Typography variant="h6" fontWeight="bold">
                              {coupon.title}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="h6" color="success.main">
                              {coupon.subtitle}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mt={1}>
                              {coupon.description}
                            </Typography>
                          </Box>
                        </Box>
                        <Button
                          variant="outlined"
                          onClick={() => handleApplyCoupon(coupon)}
                        >
                          APPLY
                        </Button>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" mt={2}>
                        Terms and Conditions Apply
                      </Typography>
                      <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                        <Typography component="li" variant="caption" color="text.secondary">
                          Lorem Ipsum is simply dummy text of the printing
                        </Typography>
                        <Typography component="li" variant="caption" color="text.secondary">
                          Lorem Ipsum is simply dummy text of the printing
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </ListItem>
              ))}
            </List>
          </Container>
        </Box>
      </Dialog>
    </Box>
  );
};