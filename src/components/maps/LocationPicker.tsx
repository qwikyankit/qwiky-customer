import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { LocationOn, MyLocation, Edit } from '@mui/icons-material';
import { googleMapsService } from '../../services/googleMapsService';
import { useLocation } from '../../context/LocationContext';

export const LocationPicker: React.FC = () => {
  const { currentLocality, isDetecting, error, detectLocation, setManualLocation, clearError } = useLocation();
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isGoogleMapsAvailable, setIsGoogleMapsAvailable] = useState(true);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  useEffect(() => {
    const searchPlaces = async () => {
      if (query.length < 3) {
        setPredictions([]);
        setShowPredictions(false);
        return;
      }

      try {
        setIsLoading(true);
        setSearchError(null);
        const results = await googleMapsService.searchPlaces(query);
        if (results.length === 0 && query.length > 0) {
          // Check if Google Maps is available
          setIsGoogleMapsAvailable(false);
        }
        setPredictions(results);
        setShowPredictions(true);
      } catch (error) {
        setSearchError('Failed to search locations');
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchPlaces, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handlePlaceSelect = async (prediction: google.maps.places.AutocompletePrediction) => {
    try {
      setIsLoading(true);
      const placeDetails = await googleMapsService.getPlaceDetails(prediction.place_id);
      
      if (placeDetails) {
        const addressComponents = googleMapsService.parseAddressComponents(
          placeDetails.address_components
        );

        // Extract locality from the selected place
        let locality = '';
        for (const component of placeDetails.address_components) {
          if (component.types.includes('sublocality_level_1') || 
              component.types.includes('sublocality')) {
            locality = component.long_name;
            break;
          } else if (component.types.includes('locality')) {
            locality = component.long_name;
          }
        }
        
        const localityWithCity = locality && addressComponents.city ? 
          `${locality}, ${addressComponents.city}` : 
          addressComponents.city || placeDetails.formatted_address;
        
        setManualLocation(localityWithCity);
        setQuery('');
        setShowPredictions(false);
      }
    } catch (error) {
      setSearchError('Failed to get location details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (manualAddress.trim()) {
      setManualLocation(manualAddress.trim());
      setManualAddress('');
      setShowManualInput(false);
    }
  };

  const handleDetectLocation = () => {
    clearError();
    detectLocation();
  };

  return (
    <Box>
      {/* Current Location Display */}
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box display="flex" alignItems="center">
          <LocationOn sx={{ mr: 1 }} />
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Current Location
            </Typography>
            <Typography variant="h6">
              {isDetecting ? 'Detecting location...' : currentLocality || 'No location set'}
            </Typography>
          </Box>
        </Box>
        <Button
          color="inherit"
          startIcon={<Edit />}
          onClick={() => setShowManualInput(true)}
          sx={{ color: 'white' }}
        >
          Change
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}

      {/* Location Actions */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={isDetecting ? <CircularProgress size={20} /> : <MyLocation />}
          onClick={handleDetectLocation}
          disabled={isDetecting}
          sx={{ mb: 2 }}
        >
          {isDetecting ? 'Detecting...' : 'Detect My Location'}
        </Button>

        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
          OR
        </Typography>

        {/* Search Location */}
        <Box position="relative">
          <TextField
            fullWidth
            label="Search Location"
            placeholder="Search for your locality"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowPredictions(predictions.length > 0)}
            InputProps={{
              startAdornment: <LocationOn color="action" sx={{ mr: 1 }} />,
              endAdornment: isLoading ? <CircularProgress size={20} /> : null
            }}
          />

          {searchError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {searchError}
            </Alert>
          )}

          {!isGoogleMapsAvailable && query.length > 0 && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Google Maps is not configured. Please use manual input below.
            </Alert>
          )}

          {showPredictions && predictions.length > 0 && (
            <Paper
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1000,
                maxHeight: 300,
                overflow: 'auto',
                mt: 1
              }}
            >
              <List>
                {predictions.map((prediction) => (
                  <ListItem key={prediction.place_id} disablePadding>
                    <ListItemButton onClick={() => handlePlaceSelect(prediction)}>
                      <LocationOn color="action" sx={{ mr: 2 }} />
                      <ListItemText
                        primary={prediction.structured_formatting.main_text}
                        secondary={prediction.structured_formatting.secondary_text}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {showPredictions && predictions.length === 0 && query.length >= 3 && !isLoading && (
            <Paper
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1000,
                mt: 1,
                p: 2
              }}
            >
              <Typography color="text.secondary" textAlign="center">
                No locations found
              </Typography>
            </Paper>
          )}
        </Box>

        <Button
          fullWidth
          variant="text"
          onClick={() => setShowManualInput(true)}
          sx={{ mt: 2 }}
        >
          Enter Address Manually
        </Button>
      </Box>

      {/* Manual Input Dialog */}
      <Dialog 
        open={showManualInput} 
        onClose={() => setShowManualInput(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Enter Your Location</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Locality/Area"
            placeholder="e.g., Sodala, Jaipur"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            sx={{ mt: 1 }}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowManualInput(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleManualSubmit}
            variant="contained"
            disabled={!manualAddress.trim()}
          >
            Set Location
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};