import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { googleMapsService } from '../services/googleMapsService';
import { useAuth } from './AuthContext';

interface LocationState {
  currentLocality: string | null;
  isDetecting: boolean;
  error: string | null;
  hasLocationPermission: boolean;
}

interface LocationContextType extends LocationState {
  detectLocation: () => Promise<void>;
  setManualLocation: (locality: string) => void;
  clearError: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

type LocationAction =
  | { type: 'SET_DETECTING'; payload: boolean }
  | { type: 'SET_LOCALITY'; payload: string }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_PERMISSION'; payload: boolean };

const locationReducer = (state: LocationState, action: LocationAction): LocationState => {
  switch (action.type) {
    case 'SET_DETECTING':
      return { ...state, isDetecting: action.payload };
    case 'SET_LOCALITY':
      return { ...state, currentLocality: action.payload, isDetecting: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isDetecting: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_PERMISSION':
      return { ...state, hasLocationPermission: action.payload };
    default:
      return state;
  }
};

const initialState: LocationState = {
  currentLocality: null,
  isDetecting: false,
  error: null,
  hasLocationPermission: false,
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(locationReducer, initialState);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !state.currentLocality) {
      detectLocation();
    }
  }, [isAuthenticated]);

  const detectLocation = async () => {
    try {
      dispatch({ type: 'SET_DETECTING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
      });

      dispatch({ type: 'SET_PERMISSION', payload: true });

      // Try to get locality from coordinates
      try {
        const locality = await googleMapsService.getLocalityFromCoordinates(
          position.coords.latitude,
          position.coords.longitude
        );
        
        if (locality) {
          dispatch({ type: 'SET_LOCALITY', payload: locality });
        } else {
          // Fallback to dummy locality
          dispatch({ type: 'SET_LOCALITY', payload: 'Sodala, Jaipur' });
        }
      } catch (error) {
        // If Google Maps fails, use dummy locality
        dispatch({ type: 'SET_LOCALITY', payload: 'Sodala, Jaipur' });
      }
    } catch (error) {
      dispatch({ type: 'SET_PERMISSION', payload: false });
      
      if ((error as GeolocationPositionError).code === 1) {
        dispatch({ type: 'SET_ERROR', payload: 'Location access denied. Using default location.' });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Unable to detect location. Using default location.' });
      }
      
      // Set dummy locality when detection fails
      dispatch({ type: 'SET_LOCALITY', payload: 'Sodala, Jaipur' });
    }
  };

  const setManualLocation = (locality: string) => {
    dispatch({ type: 'SET_LOCALITY', payload: locality });
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <LocationContext.Provider
      value={{
        ...state,
        detectLocation,
        setManualLocation,
        clearError,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};