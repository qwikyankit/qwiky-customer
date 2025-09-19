import React, { createContext, useContext, useReducer } from 'react';
import { Location, Service, TimeSlot, Booking } from '../types';
import { bookingService } from '../services/bookingService';

interface BookingState {
  selectedLocation: Location | null;
  selectedService: Service | null;
  selectedTimeSlot: TimeSlot | null;
  currentBooking: Booking | null;
  locations: Location[];
  services: Service[];
  timeSlots: TimeSlot[];
  isLoading: boolean;
  error: string | null;
}

interface BookingContextType extends BookingState {
  setSelectedLocation: (location: Location) => void;
  setSelectedService: (service: Service) => void;
  setSelectedTimeSlot: (timeSlot: TimeSlot) => void;
  loadLocations: () => Promise<void>;
  loadServices: (locationId: string) => Promise<void>;
  loadTimeSlots: (serviceId: string, date: string) => Promise<void>;
  createBooking: () => Promise<Booking>;
  clearBooking: () => void;
  clearError: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

type BookingAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_SELECTED_LOCATION'; payload: Location }
  | { type: 'SET_SELECTED_SERVICE'; payload: Service }
  | { type: 'SET_SELECTED_TIME_SLOT'; payload: TimeSlot }
  | { type: 'SET_LOCATIONS'; payload: Location[] }
  | { type: 'SET_SERVICES'; payload: Service[] }
  | { type: 'SET_TIME_SLOTS'; payload: TimeSlot[] }
  | { type: 'SET_CURRENT_BOOKING'; payload: Booking }
  | { type: 'CLEAR_BOOKING' };

const bookingReducer = (state: BookingState, action: BookingAction): BookingState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_SELECTED_LOCATION':
      return { ...state, selectedLocation: action.payload };
    case 'SET_SELECTED_SERVICE':
      return { ...state, selectedService: action.payload };
    case 'SET_SELECTED_TIME_SLOT':
      return { ...state, selectedTimeSlot: action.payload };
    case 'SET_LOCATIONS':
      return { ...state, locations: action.payload, isLoading: false };
    case 'SET_SERVICES':
      return { ...state, services: action.payload, isLoading: false };
    case 'SET_TIME_SLOTS':
      return { ...state, timeSlots: action.payload, isLoading: false };
    case 'SET_CURRENT_BOOKING':
      return { ...state, currentBooking: action.payload, isLoading: false };
    case 'CLEAR_BOOKING':
      return {
        ...state,
        selectedLocation: null,
        selectedService: null,
        selectedTimeSlot: null,
        currentBooking: null,
        services: [],
        timeSlots: [],
      };
    default:
      return state;
  }
};

const initialState: BookingState = {
  selectedLocation: null,
  selectedService: null,
  selectedTimeSlot: null,
  currentBooking: null,
  locations: [],
  services: [],
  timeSlots: [],
  isLoading: false,
  error: null,
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const setSelectedLocation = (location: Location) => {
    dispatch({ type: 'SET_SELECTED_LOCATION', payload: location });
  };

  const setSelectedService = (service: Service) => {
    dispatch({ type: 'SET_SELECTED_SERVICE', payload: service });
  };

  const setSelectedTimeSlot = (timeSlot: TimeSlot) => {
    dispatch({ type: 'SET_SELECTED_TIME_SLOT', payload: timeSlot });
  };

  const loadLocations = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const locations = await bookingService.getLocations();
      dispatch({ type: 'SET_LOCATIONS', payload: locations });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const loadServices = async (locationId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const services = await bookingService.getServices(locationId);
      dispatch({ type: 'SET_SERVICES', payload: services });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const loadTimeSlots = async (serviceId: string, date: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const timeSlots = await bookingService.getTimeSlots(serviceId, date);
      dispatch({ type: 'SET_TIME_SLOTS', payload: timeSlots });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const createBooking = async (): Promise<Booking> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (!state.selectedLocation || !state.selectedService || !state.selectedTimeSlot) {
        throw new Error('Please select all booking details');
      }

      const booking = await bookingService.createBooking({
        serviceId: state.selectedService.id,
        locationId: state.selectedLocation.id,
        timeSlotId: state.selectedTimeSlot.id,
      });

      dispatch({ type: 'SET_CURRENT_BOOKING', payload: booking });
      return booking;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const clearBooking = () => {
    dispatch({ type: 'CLEAR_BOOKING' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <BookingContext.Provider
      value={{
        ...state,
        setSelectedLocation,
        setSelectedService,
        setSelectedTimeSlot,
        loadLocations,
        loadServices,
        loadTimeSlots,
        createBooking,
        clearBooking,
        clearError,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};