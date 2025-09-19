import React from 'react';
import { Box } from '@mui/material';
import { Header } from '../components/common/Header';
import { LocationPicker } from '../components/maps/LocationPicker';

export const LocationPickerPage: React.FC = () => {
  return (
    <Box>
      <Header title="Select Location" showBackButton />
      <LocationPicker />
    </Box>
  );
};