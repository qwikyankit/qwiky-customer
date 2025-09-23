import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Alert
} from '@mui/material';
import { LocationOn, Search, MyLocation } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { useAuth } from '../context/AuthContext';

interface SavedAddress {
  id: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

export const AddressSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [step, setStep] = useState<'select' | 'location' | 'details' | 'home'>('select');
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  // Location step state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  
  // Address details step state
  const [houseNumber, setHouseNumber] = useState('');
  const [apartmentArea, setApartmentArea] = useState('');
  const [addressType, setAddressType] = useState<'Home' | 'Office' | 'Custom'>('Home');
  const [isPetParent, setIsPetParent] = useState<boolean | null>(null);
  
  // Home details step state
  const [rooms, setRooms] = useState<number | null>(null);
  const [washrooms, setWashrooms] = useState<number | null>(null);
  const [residents, setResidents] = useState<number | null>(null);
  const [homeSize, setHomeSize] = useState<string | null>(null);

  const isFromSignup = location.state?.fromSignup;

  React.useEffect(() => {
    loadSavedAddresses();
  }, [user]);

  const loadSavedAddresses = async () => {
    if (!user) return;
    
    try {
      // For now, load from localStorage (replace with API call later)
      const addresses = JSON.parse(localStorage.getItem(`addresses_${user.id}`) || '[]');
      setSavedAddresses(addresses);
      
      // If user has addresses, show selection step
      if (addresses.length > 0 && !isFromSignup) {
        setStep('select');
      } else {
        setStep('location');
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      setStep('location');
    }
  };

  const handleSelectExistingAddress = (address: SavedAddress) => {
    // Set as current address and navigate back
    navigate(-1);
  };

  const handleAddNewAddress = () => {
    setShowAddressForm(true);
    setStep('location');
  };

  const handleLocationConfirm = () => {
    if (selectedLocation) {
      setStep('details');
    }
  };

  const handleAddressDetailsSave = () => {
    if (houseNumber && apartmentArea && isPetParent !== null) {
      setStep('home');
    }
  };

  const handleHomeDetailsSave = () => {
    if (rooms && washrooms && residents && homeSize) {
      // Save address data
      const addressData = {
        location: selectedLocation,
        houseNumber,
        apartmentArea,
        addressType,
        isPetParent,
        rooms,
        washrooms,
        residents,
        homeSize
      };
      
      // Store in localStorage for now
      const existingAddresses = JSON.parse(localStorage.getItem(`addresses_${user?.id}`) || '[]');
      const newAddress = {
        id: crypto.randomUUID(),
        ...addressData,
        isDefault: existingAddresses.length === 0,
        createdAt: new Date().toISOString()
      };
      existingAddresses.push(newAddress);
      localStorage.setItem(`addresses_${user?.id}`, JSON.stringify(existingAddresses));
      
      if (isFromSignup) {
        navigate('/');
      } else {
        navigate(-1);
      }
    }
  };

  const handleSkip = () => {
    if (isFromSignup) {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  const renderAddressSelection = () => (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Typography variant="h6" mb={3}>
        Select Address
      </Typography>
      
      {savedAddresses.length > 0 && (
        <Box mb={3}>
          <Typography variant="body1" mb={2} fontWeight={500}>
            Saved Addresses
          </Typography>
          {savedAddresses.map((address) => (
            <Card 
              key={address.id} 
              sx={{ 
                mb: 2, 
                cursor: 'pointer',
                '&:hover': { boxShadow: 3 }
              }}
              onClick={() => handleSelectExistingAddress(address)}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h6" mb={1}>
                      {address.addressLine1}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {address.addressLine2 && `${address.addressLine2}, `}
                      {address.city}, {address.state} {address.postalCode}
                    </Typography>
                    {address.isDefault && (
                      <Chip label="Default" size="small" color="primary" />
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
      
      <Button
        fullWidth
        variant="outlined"
        onClick={handleAddNewAddress}
        sx={{ py: 2 }}
      >
        Add New Address
      </Button>
      
      {!isFromSignup && (
        <Button
          fullWidth
          variant="text"
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Cancel
        </Button>
      )}
    </Container>
  );
  const renderLocationStep = () => (
    <Box>
      {/* Search Bar */}
      <Box sx={{ p: 2, bgcolor: 'white' }}>
        <TextField
          fullWidth
          placeholder="Search address or area"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ mb: 2 }}
        />
        {!showAddressForm && (
          <Button
            variant="text"
            color="primary"
            onClick={handleSkip}
            sx={{ position: 'absolute', top: 16, right: 16 }}
          >
            SKIP
          </Button>
        )}
      </Box>

      {/* Map Placeholder */}
      <Box
        sx={{
          height: 400,
          bgcolor: 'grey.200',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2
          }}
        >
          <LocationOn sx={{ fontSize: 40, color: 'primary.main' }} />
        </Box>
        <Typography color="text.secondary">Map View</Typography>
        
        {/* Move pin instruction */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 100,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'rgba(0,0,0,0.7)',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 2
          }}
        >
          Move the pin to place accurately
        </Box>
      </Box>

      {/* Current Location Button */}
      <Box sx={{ p: 2, bgcolor: 'white' }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<MyLocation />}
          onClick={() => setSelectedLocation('Current Location')}
          sx={{ mb: 2 }}
        >
          Current Location
        </Button>
      </Box>

      {/* Location Details */}
      <Card sx={{ m: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={1}>
            <LocationOn sx={{ mr: 1 }} />
            <Typography variant="h6">S.B Vihar</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
          </Typography>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setSelectedLocation('S.B Vihar');
              handleLocationConfirm();
            }}
            sx={{ mt: 2 }}
          >
            Confirm Location
          </Button>
        </CardContent>
      </Card>
    </Box>
  );

  const renderAddressDetailsStep = () => (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      {/* Map Section */}
      <Box
        sx={{
          height: 200,
          bgcolor: 'grey.200',
          borderRadius: 2,
          mb: 3,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <LocationOn sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography color="text.secondary" sx={{ ml: 1 }}>Map View</Typography>
      </Box>

      {/* Location Name */}
      <Box display="flex" alignItems="center" mb={3}>
        <LocationOn sx={{ mr: 1 }} />
        <Typography variant="h6">S.B Vihar</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
      </Typography>

      {/* Address Form */}
      <TextField
        fullWidth
        placeholder="House / Flat / Floor Number"
        value={houseNumber}
        onChange={(e) => setHouseNumber(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        placeholder="Apartment / Road / Area"
        value={apartmentArea}
        onChange={(e) => setApartmentArea(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* Save as */}
      <Typography variant="body1" mb={2} fontWeight={500}>
        Save as
      </Typography>
      <Box display="flex" gap={1} mb={3}>
        {(['Home', 'Office', 'Custom'] as const).map((type) => (
          <Chip
            key={type}
            label={type}
            onClick={() => setAddressType(type)}
            color={addressType === type ? 'primary' : 'default'}
            variant={addressType === type ? 'filled' : 'outlined'}
            icon={type === 'Home' ? <LocationOn /> : undefined}
          />
        ))}
      </Box>

      {/* Pet Parent */}
      <Typography variant="body1" mb={2} fontWeight={500}>
        Are you a pet parent?
      </Typography>
      <Box display="flex" gap={1} mb={4}>
        <Button
          variant={isPetParent === true ? 'contained' : 'outlined'}
          onClick={() => setIsPetParent(true)}
          sx={{ flex: 1 }}
        >
          Yes
        </Button>
        <Button
          variant={isPetParent === false ? 'contained' : 'outlined'}
          onClick={() => setIsPetParent(false)}
          sx={{ flex: 1 }}
        >
          No
        </Button>
      </Box>

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleAddressDetailsSave}
        disabled={!houseNumber || !apartmentArea || isPetParent === null}
        sx={{ py: 2 }}
      >
        SAVE ADDRESS
      </Button>
    </Container>
  );

  const renderHomeDetailsStep = () => (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Typography variant="h6" mb={1}>
        Tell Us About Your Home
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        We use this to make the service work better for you
      </Typography>

      {/* Number of Rooms */}
      <Typography variant="body1" mb={2} fontWeight={500}>
        Number of Rooms
      </Typography>
      <Box display="flex" gap={1} mb={3}>
        {[1, 2, 3, 4].map((num) => (
          <Button
            key={num}
            variant={rooms === num ? 'contained' : 'outlined'}
            onClick={() => setRooms(num)}
            sx={{ minWidth: 60 }}
          >
            {num}
          </Button>
        ))}
        <Button
          variant={rooms && rooms > 4 ? 'contained' : 'outlined'}
          onClick={() => setRooms(5)}
        >
          Custom
        </Button>
      </Box>

      {/* Number of Washrooms */}
      <Typography variant="body1" mb={2} fontWeight={500}>
        Number of Washrooms
      </Typography>
      <Box display="flex" gap={1} mb={3}>
        {[1, 2, 3, 4].map((num) => (
          <Button
            key={num}
            variant={washrooms === num ? 'contained' : 'outlined'}
            onClick={() => setWashrooms(num)}
            sx={{ minWidth: 60 }}
          >
            {num}
          </Button>
        ))}
        <Button
          variant={washrooms && washrooms > 4 ? 'contained' : 'outlined'}
          onClick={() => setWashrooms(5)}
        >
          Custom
        </Button>
      </Box>

      {/* Number of Residents */}
      <Typography variant="body1" mb={2} fontWeight={500}>
        Number of Residents
      </Typography>
      <Box display="flex" gap={1} mb={3}>
        {[1, 2, 3, 4].map((num) => (
          <Button
            key={num}
            variant={residents === num ? 'contained' : 'outlined'}
            onClick={() => setResidents(num)}
            sx={{ minWidth: 60 }}
          >
            {num}
          </Button>
        ))}
        <Button
          variant={residents && residents > 4 ? 'contained' : 'outlined'}
          onClick={() => setResidents(5)}
        >
          Custom
        </Button>
      </Box>

      {/* Home Size */}
      <Typography variant="body1" mb={2} fontWeight={500}>
        Approximate Size of your Home (in sqft.)
      </Typography>
      <Box display="flex" gap={1} mb={4} flexWrap="wrap">
        {['<500', '500 - 999', '1000 - 1999', '2000 - 2999', '3000 - 4999', '5000+'].map((size) => (
          <Button
            key={size}
            variant={homeSize === size ? 'contained' : 'outlined'}
            onClick={() => setHomeSize(size)}
            sx={{ mb: 1 }}
          >
            {size}
          </Button>
        ))}
      </Box>

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleHomeDetailsSave}
        disabled={!rooms || !washrooms || !residents || !homeSize}
        sx={{ py: 2 }}
      >
        SAVE HOME DETAILS
      </Button>
    </Container>
  );

  const getTitle = () => {
    switch (step) {
      case 'select': return 'Select Address';
      case 'location': return '';
      case 'details': return '';
      case 'home': return '';
      default: return 'Setup Address';
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {(step !== 'location' || showAddressForm) && <Header title={getTitle()} showBackButton />}
      
      {step === 'select' && renderAddressSelection()}
      {step === 'location' && renderLocationStep()}
      {step === 'details' && renderAddressDetailsStep()}
      {step === 'home' && renderHomeDetailsStep()}
    </Box>
  );
};