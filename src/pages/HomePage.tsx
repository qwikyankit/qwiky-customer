import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip
} from '@mui/material';
import { CardGiftcard, LocationOn, Home, Business } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentLocality, detectLocation } = useLocation();
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const savedAddresses = JSON.parse(localStorage.getItem(`addresses_${user.id}`) || '[]');
      setAddresses(savedAddresses);
    }
  }, [user]);
  const services = [
    {
      id: '1',
      name: '60 Minutes',
      originalPrice: 99,
      discountedPrice: 79,
      discount: '8% OFF',
      description: 'The Quick Fix Hour'
    },
    {
      id: '2', 
      name: '90 Minutes',
      originalPrice: 149,
      discountedPrice: 134,
      discount: '10% OFF',
      description: 'The Power Hour & a Half'
    },
    {
      id: '3',
      name: '120 Minutes',
      originalPrice: 199,
      discountedPrice: 179,
      discount: '10% OFF',
      description: 'The Full Care Session'
    }
  ];

  const handleBookService = (serviceId: string) => {
    // Check if user has address
    if (addresses.length === 0) {
      navigate('/address-setup');
      return;
    }

    const service = services.find(s => s.id === serviceId);
    navigate('/review-booking', { 
      state: { 
        service: {
          id: serviceId,
          name: service?.name,
          price: service?.discountedPrice,
          duration: parseInt(service?.name.split(' ')[0] || '60'),
          description: service?.description
        },
        bookingType: 'instant',
        locality: currentLocality
      } 
    });
  };

  const handleReferEarn = () => {
    navigate('/refer-earn');
  };

  const handleLocationClick = () => {
    if (addresses.length === 0) {
      navigate('/address-setup');
    } else {
      setShowAddressDialog(true);
    }
  };

  const handlePrebookingClick = () => {
    // Check if user has address
    if (addresses.length === 0) {
      navigate('/address-setup');
      return;
    }

    navigate('/choose-service');
  };

  const handleSelectAddress = (address: any) => {
    // Set as current location and close dialog
    setShowAddressDialog(false);
    // Update current locality context if needed
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'Home': return <Home />;
      case 'Office': return <Business />;
      default: return <LocationOn />;
    }
  };

  // Display current locality or fallback text
  const defaultAddress = addresses.find(addr => addr.isDefault);
  const displayLocation = defaultAddress ? 
    `${defaultAddress.houseNumber}, ${defaultAddress.apartmentArea}` : 
    (currentLocality || 'Add your address');
  const displayAddress = defaultAddress ? 
    defaultAddress.location : 
    (currentLocality ? 'A 102 Location one....' : 'Please add your address to continue');

  return (
    <Box sx={{ pb: 8 }}> {/* Add padding bottom for bottom navigation */}
      {/* Header Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #4E2780 0%, #6B46A3 100%)',
          color: 'white',
          pt: 4,
          pb: 3,
          px: 2
        }}
      >
        <Container maxWidth="sm">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box 
              onClick={handleLocationClick}
              sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <LocationOn sx={{ mr: 1, fontSize: 20 }} />
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {displayLocation}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {displayAddress}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<CardGiftcard />}
              onClick={handleReferEarn}
              sx={{ 
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Refer & Earn
            </Button>
          </Box>
          
          {/* Service Features */}
          <Box display="flex" justifyContent="space-between" mb={3}>
            <Box textAlign="center">
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Serving Homes with
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                Care & Speed
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Your Home, Our
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                Priority
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Book Once, Get It
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                All Done
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ px: 2, mt: -2 }}>
        {/* At your door in 10 mins */}
        <Box textAlign="center" py={2}>
          <Typography variant="h6" fontWeight={600} mb={1}>
            At your door in 10 mins
          </Typography>
        </Box>

        {/* Service Cards */}
        <Grid container spacing={2} mb={3}>
          {services.map((service) => (
            <Grid item xs={4} key={service.id}>
              <Card sx={{ borderRadius: 2, position: 'relative', height: '100%' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    zIndex: 1
                  }}
                >
                  {service.discount}
                </Box>
                <CardContent sx={{ textAlign: 'center', py: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600} mb={1}>
                      {service.name.split(' ')[0]} min
                    </Typography>
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
                      <Typography variant="h6" color="primary" fontWeight={600}>
                        ₹{service.discountedPrice}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ textDecoration: 'line-through' }}
                      >
                        ₹{service.originalPrice}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleBookService(service.id)}
                    sx={{ borderRadius: 2, mt: 'auto' }}
                  >
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Prebook for convenience */}
        <Box textAlign="center" mb={3}>
          <Typography variant="h6" fontWeight={600}>
            Prebook for convenience
          </Typography>
        </Box>

        {/* Single Prebooking Card */}
        <Card 
          sx={{ 
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #4E2780 0%, #6B46A3 100%)',
            color: 'white',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(78, 39, 128, 0.3)'
            },
            transition: 'all 0.3s ease'
          }}
          onClick={handlePrebookingClick}
        >
          <CardContent sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={600} mb={1}>
              Schedule Your Service
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
              Choose your preferred date and time
            </Typography>
            <Button
              variant="contained"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)'
                }
              }}
            >
              Book Now
            </Button>
          </CardContent>
        </Card>

        {/* Placeholder for carousel */}
        <Box
          sx={{
            height: 200,
            bgcolor: 'grey.200',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3
          }}
        >
          <Typography color="text.secondary">
            Carousel placeholder
          </Typography>
        </Box>

        {/* Pagination dots */}
        <Box display="flex" justifyContent="center" mb={3}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              mr: 1
            }}
          />
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'grey.300'
            }}
          />
          <Typography variant="body2" color="text.secondary" ml={1}>
            1/2
          </Typography>
        </Box>

        {/* Experts active around you */}
        <Box mb={3}>
          <Typography variant="h6" textAlign="center" mb={2}>
            (35) Experts active around you
          </Typography>
          <Box
            sx={{
              height: 200,
              bgcolor: 'grey.200',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography color="text.secondary">
              Map showing active experts
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* Address Selection Dialog */}
      <Dialog open={showAddressDialog} onClose={() => setShowAddressDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select Address</DialogTitle>
        <DialogContent>
          <List>
            {addresses.map((address) => (
              <ListItem key={address.id} disablePadding>
                <ListItemButton onClick={() => handleSelectAddress(address)}>
                  {getAddressIcon(address.addressType)}
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography>{address.addressType}</Typography>
                        {address.isDefault && <Chip label="Default" size="small" color="primary" />}
                      </Box>
                    }
                    secondary={`${address.houseNumber}, ${address.apartmentArea}, ${address.location}`}
                    sx={{ ml: 2 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              setShowAddressDialog(false);
              navigate('/address-setup');
            }}
            sx={{ mt: 2 }}
          >
            Add New Address
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};