import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, Box } from '@mui/material';
import { Home, History, Person } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export const AppBottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    if (location.pathname === '/') return 0;
    if (location.pathname === '/orders') return 1;
    if (location.pathname === '/profile' || location.pathname === '/refer-earn') return 2;
    return 0;
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/orders');
        break;
      case 2:
        navigate('/profile');
        break;
    }
  };

  // Don't show bottom navigation on auth page or booking flow
  if (location.pathname === '/auth' || 
      location.pathname.startsWith('/booking') || 
      location.pathname === '/choose-service' ||
      location.pathname === '/review-booking' ||
      location.pathname === '/payment' ||
      location.pathname === '/booking-confirmed' ||
      location.pathname === '/address-setup' ||
      location.pathname === '/profile-setup' ||
      location.pathname === '/manage-addresses') {
    return null;
  }

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
      <BottomNavigation value={getActiveTab()} onChange={handleChange}>
        <BottomNavigationAction label="Home" icon={<Home />} />
        <BottomNavigationAction label="Bookings" icon={<History />} />
        <BottomNavigationAction label="Account" icon={<Person />} />
      </BottomNavigation>
    </Paper>
  );
};