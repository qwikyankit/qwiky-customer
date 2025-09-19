import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  IconButton,
  Button,
  TextField,
  Divider,
  Alert,
  Chip
} from '@mui/material';
import { Add, Remove, Delete, LocalOffer } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Header } from '../components/common/Header';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    discountCode,
    discountAmount,
    total,
    isLoading,
    error,
    updateCartItem,
    removeFromCart,
    applyDiscountCode,
    removeDiscountCode,
    clearError
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    updateCartItem(id, newQuantity);
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return;

    setIsApplyingPromo(true);
    const success = await applyDiscountCode(promoCode.trim());
    if (success) {
      setPromoCode('');
    }
    setIsApplyingPromo(false);
  };

  const handleRemovePromoCode = () => {
    removeDiscountCode();
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  if (isLoading && items.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Box sx={{ pb: 8 }}>
      <Header title="Cart" showBackButton />
      
      <Container maxWidth="sm" sx={{ py: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {items.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary" mb={2}>
              Your cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Add some services to get started
            </Typography>
            <Button variant="contained" onClick={() => navigate('/')}>
              Browse Services
            </Button>
          </Box>
        ) : (
          <>
            {/* Cart Items */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Cart Items ({items.length})
                </Typography>
                
                <List sx={{ px: 0 }}>
                  {items.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <ListItem sx={{ px: 0, py: 2 }}>
                        <Box sx={{ width: '100%' }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight={500}>
                                {item.service?.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" mb={1}>
                                {item.service?.description}
                              </Typography>
                              <Typography variant="body2" color="primary" fontWeight={500}>
                                ₹{item.service?.price} × {item.quantity} = ₹{(item.service?.price || 0) * item.quantity}
                              </Typography>
                            </Box>
                            
                            <IconButton 
                              color="error" 
                              onClick={() => handleRemoveItem(item.id)}
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                          
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box display="flex" alignItems="center">
                              <IconButton 
                                size="small"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Remove />
                              </IconButton>
                              <Typography sx={{ mx: 2, minWidth: 20, textAlign: 'center' }}>
                                {item.quantity}
                              </Typography>
                              <IconButton 
                                size="small"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              >
                                <Add />
                              </IconButton>
                            </Box>
                            
                            {item.scheduledDate && (
                              <Typography variant="caption" color="text.secondary">
                                {item.scheduledDate} {item.scheduledTime}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </ListItem>
                      {index < items.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Promo Code
                </Typography>
                
                {discountCode ? (
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Chip
                      icon={<LocalOffer />}
                      label={`${discountCode.code} - ₹${discountAmount} off`}
                      color="success"
                      variant="outlined"
                    />
                    <Button size="small" onClick={handleRemovePromoCode}>
                      Remove
                    </Button>
                  </Box>
                ) : (
                  <Box display="flex" gap={1}>
                    <TextField
                      size="small"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      sx={{ flex: 1 }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleApplyPromoCode}
                      disabled={!promoCode.trim() || isApplyingPromo}
                    >
                      {isApplyingPromo ? <LoadingSpinner size={20} /> : 'Apply'}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Order Summary
                </Typography>
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Subtotal</Typography>
                  <Typography>₹{subtotal}</Typography>
                </Box>
                
                {discountAmount > 0 && (
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography color="success.main">Discount</Typography>
                    <Typography color="success.main">-₹{discountAmount}</Typography>
                  </Box>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" color="primary">
                    ₹{total}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Checkout Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleProceedToCheckout}
              disabled={items.length === 0}
              sx={{ py: 1.5 }}
            >
              Proceed to Checkout
            </Button>
          </>
        )}
      </Container>
    </Box>
  );
};