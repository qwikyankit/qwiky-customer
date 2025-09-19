import React from 'react';
import { CircularProgress, Box } from '@mui/material';

interface LoadingSpinnerProps {
  size?: number;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 40, 
  fullScreen = false 
}) => {
  if (fullScreen) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress size={size} color="primary" />
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" p={2}>
      <CircularProgress size={size} color="primary" />
    </Box>
  );
};